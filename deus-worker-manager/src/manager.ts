import { Nano, NanoDatabase } from 'nano';
import nano = require('nano');

import EventsSource, { Event } from './events_source';
import ModelStorage from './model_storage';
import EventStorage from './event_storage';
import WorkersPool from './workers_pool';
import Worker from './worker';

type SyncedModels = {
    [characterId: string]: Event
};

export default class Manager {
    private nano: Nano;
    private eventsSource: EventsSource;
    private modelStorage: ModelStorage;
    private workingModelStorage: ModelStorage;
    private viewModelStorage: ModelStorage;
    private eventStorage: EventStorage;
    private pool: WorkersPool;
    private syncedModels: SyncedModels = {};

    constructor(private config: any) {
        this.nano = nano(config.db.url);
        this.eventsSource = new EventsSource(this.nano, config.db.events);

        this.modelStorage = new ModelStorage(this.nano.use(config.db.models));
        this.workingModelStorage = new ModelStorage(this.nano.use(config.db.workingModels));
        this.viewModelStorage = new ModelStorage(this.nano.use(config.db.viewModels));
        this.eventStorage = new EventStorage(this.nano.use(config.db.events));

        this.pool = new WorkersPool(config.pool.workerModule, config.pool.workerArgs, config.pool.options);

        this.eventsSource.refreshModelEvents.subscribe(this.refreshModel);
        this.eventsSource.follow();
    }

    refreshModel = async (event: Event) => {
        console.log('>>>', event);

        const characterId = event.characterId;

        if (!this.syncedModels[characterId]) {
            this.syncedModels[characterId] = event;
            await this.pool.withWorker(this.processModel(characterId));
            delete this.syncedModels[characterId]
        } else {
            this.syncedModels[characterId] = event;
        }
    }

    processModel(characterId: string) {
        console.log(">>> processModel", characterId);

        return async (worker: Worker) => {
            const syncEvent = this.syncedModels[characterId];
            console.log('>>> syncEvent = ', syncEvent);
            if (!syncEvent) {
                // warn!
                return;
            }

            const model = await this.modelStorage.find(characterId);

            const events = (await this.eventStorage.range(characterId, model.timestamp + 1, syncEvent.timestamp))
                .filter((event: Event) => event.eventType && event.eventType[0] != '_');

            console.log('>>> events = ', events);

            const result: any = await worker.process(syncEvent, model, events);

            console.log('>>> result =', result);

            let [baseModel, workingModel, viewModel] = result;
            delete workingModel._rev;
            delete viewModel._rev;

            await Promise.all([
                this.modelStorage.store(baseModel),
                this.workingModelStorage.store(workingModel),
                this.viewModelStorage.store(viewModel)
            ]);
        }
    }
}
