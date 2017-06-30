import { isNil } from 'lodash';

import { DIInterface } from './di';

import { DBConnectorInterface } from './db/interface';

import { Config } from './config';
import EventsSource, { Event } from './events_source';
import ModelStorage from './model_storage';
import EventStorage from './event_storage';
import { WorkersPoolInterface } from './workers_pool';
import { LoggerInterface } from './logger';
import Worker, { EngineResult } from './worker';

type SyncedModels = {
    [characterId: string]: Event
};

export default class Manager {
    private config: Config;
    private dbConnector: DBConnectorInterface;
    private eventsSource: EventsSource;
    private modelStorage: ModelStorage;
    private workingModelStorage: ModelStorage;
    private viewModelStorage: { [alias: string]: ModelStorage };
    private eventStorage: EventStorage;
    private pool: WorkersPoolInterface;
    private logger: LoggerInterface;
    private syncedModels: SyncedModels = {};

    constructor(private di: DIInterface) {
        this.config = di.config;
        this.dbConnector = di.dbConnector;
        this.logger = di.logger;
        this.pool = di.workersPool;

        this.modelStorage = new ModelStorage(this.dbConnector.use(this.config.db.models));
        this.workingModelStorage = new ModelStorage(this.dbConnector.use(this.config.db.workingModels));

        const eventsDb = this.dbConnector.use(this.config.db.events);
        this.eventStorage = new EventStorage(eventsDb);
        this.eventsSource = new EventsSource(eventsDb);

        this.initViewModelStorage();

        this.eventsSource.refreshModelEvents.subscribe(this.refreshModel);
        this.eventsSource.follow();
    }

    refreshModel = async (event: Event) => {
        this.logger.info('manager', 'refresh event for %s', event.characterId, event);

        const characterId = event.characterId;

        if (!this.syncedModels[characterId]) {
            this.syncedModels[characterId] = event;
            await this.pool.withWorker(this.processModel(characterId));
            delete this.syncedModels[characterId]
        } else {
            this.syncedModels[characterId] = event;
        }
    }

    private processModel(characterId: string) {
        this.logger.debug('manager', 'process model %s', characterId);

        return async (worker: Worker) => {
            const syncEvent = this.syncedModels[characterId];
            if (!syncEvent) {
                this.logger.warn('manager', 'Sync event lost', { characterId })
                return;
            }

            const model = await this.modelStorage.find(characterId);

            const events = (await this.eventStorage.range(characterId, model.timestamp + 1, syncEvent.timestamp))
                .filter((event: Event) => event.eventType != '_NoOp');

            this.logger.debug('manager', 'events = %j', events);

            const result: EngineResult = await worker.process(syncEvent, model, events);

            this.logger.debug('manager', 'result = %j', result);

            let { baseModel, workingModel, viewModels } = result;
            delete workingModel._rev;
            workingModel.timestamp = baseModel.timestamp;

            await Promise.all([
                this.modelStorage.store(baseModel),
                this.workingModelStorage.store(workingModel),
                this.storeViewModels(characterId, baseModel.timestamp, viewModels)
            ]);
        }
    }

    private initViewModelStorage() {
        this.viewModelStorage = {};

        for (let alias in this.config.db) {
            if (['url', 'models', 'workingModels', 'events'].indexOf(alias) != -1) continue;

            let db = this.dbConnector.use(this.config.db[alias]);
            this.viewModelStorage[alias] = new ModelStorage(db);
        }
    }

    private async storeViewModels(characteId: string, timestamp: number, viewModels: { [alias: string]: any }) {
        let pending = [];
        for (let alias in viewModels) {
            if (!this.viewModelStorage[alias]) continue;

            let viewModel = viewModels[alias];
            viewModel.timestamp = timestamp;
            delete viewModel._rev;
            if (isNil(viewModel._id)) {
                viewModel._id = characteId;
            }

            pending.push(this.viewModelStorage[alias].store(viewModel));
        }

        return pending;
    }
}
