import { Inject } from './di';
import { isNil } from 'lodash';
import { Subscription } from 'rxjs';

import { DBConnectorInterface } from './db/interface';

import { Config } from './config';
import EventsSource, { Event } from './events_source';
import ModelStorage from './model_storage';
import EventStorage from './event_storage';
import { WorkersPoolInterface } from './workers_pool';
import { LoggerInterface } from './logger';
import Worker, { EngineResult } from './worker';

interface SyncedModels {
    [characterId: string]: Event;
}

@Inject
export class Manager {
    private eventsSource: EventsSource;
    private modelStorage: ModelStorage;
    private workingModelStorage: ModelStorage;
    private viewModelStorage: { [alias: string]: ModelStorage };
    private eventStorage: EventStorage;
    private syncedModels: SyncedModels = {};
    private eventsSourceSubscription: Subscription;

    constructor(
        private config: Config,
        private dbConnector: DBConnectorInterface,
        private pool: WorkersPoolInterface,
        private logger: LoggerInterface
    ) { }

    init() {
        this.modelStorage = new ModelStorage(this.dbConnector.use(this.config.db.models));
        this.workingModelStorage = new ModelStorage(this.dbConnector.use(this.config.db.workingModels));

        const eventsDb = this.dbConnector.use(this.config.db.events);
        this.eventStorage = new EventStorage(eventsDb);
        this.eventsSource = new EventsSource(eventsDb);

        this.initViewModelStorage();

        this.pool.init();

        this.eventsSourceSubscription = this.eventsSource.refreshModelEvents.subscribe(this.queueEvent);
        this.eventsSource.follow();
    }

    queueEvent = (event: Event) => {
        this.logger.info('manager', 'refresh event for %s', event.characterId, event);

        const characterId = event.characterId;

        if (!this.syncedModels[characterId]) {
            this.syncedModels[characterId] = event;
            setImmediate(this.refreshModel, characterId);
        } else if (this.syncedModels[characterId].timestamp < event.timestamp) {
            this.syncedModels[characterId] = event;
        }
    }

    refreshModel = async (characterId: string) => {
        let event = await this.pool.withWorker(this.processModel(characterId));
        if (event && event.timestamp < this.syncedModels[characterId].timestamp) {
            setImmediate(this.refreshModel, characterId);
        } else {
            delete this.syncedModels[characterId];
        }
    }

    stop() {
        if (!this.eventsSourceSubscription) return;

        this.eventsSourceSubscription.unsubscribe();
        return this.pool.drain();
    }

    private processModel(characterId: string) {
        this.logger.debug('manager', 'process model %s', characterId);

        return async (worker: Worker) => {
            this.logger.debug('manager', 'worker aquired');

            const syncEvent = this.syncedModels[characterId];
            if (!syncEvent) {
                this.logger.warn('manager', 'Sync event lost', { characterId });
                return Promise.reject('Sync event lost');
            }

            const model = await this.modelStorage.find(characterId);

            const events = (await this.eventStorage.range(characterId, model.timestamp + 1, syncEvent.timestamp))
                .filter((event: Event) => event.eventType != '_NoOp');

            this.logger.debug('manager', 'events = %j', events);

            if (!events.length) return syncEvent;

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

            return syncEvent;
        };
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
        let pending: Array<Promise<any>> = [];
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
