import { Inject } from './di';
import { isNil, keyBy, cloneDeep } from 'lodash';

import { Event, SyncEvent, EngineResult } from 'deus-engine-manager-api';

import { ModelStorage } from './model_storage';
import { ViewModelStorage } from './view_model_storage';
import { EventStorage } from './event_storage';
import { ObjectStorageInterface, BoundObjectStorage } from './object_storage';
import { WorkersPoolInterface } from './workers_pool';
import { Worker } from './worker';
import { LoggerInterface } from './logger';

type State = 'New' | 'Waiting for worker' | 'Processing' | 'Done';

export type ProcessorFactory = () => Processor;

export function processorFactory(
    pool: WorkersPoolInterface,
    eventStorage: EventStorage,
    modelStorage: ModelStorage,
    workingModelStorage: ModelStorage,
    viewModelStorage: ViewModelStorage,
    objectStorage: ObjectStorageInterface,
    logger: LoggerInterface
) {
    return () => {
        return new Processor(pool, eventStorage, modelStorage, workingModelStorage, viewModelStorage, objectStorage, logger);
    };
}

export class Processor {
    private state: State = 'New';
    private event: SyncEvent;

    constructor(
        private pool: WorkersPoolInterface,
        private eventStorage: EventStorage,
        private modelStorage: ModelStorage,
        private workingModelStorage: ModelStorage,
        private viewModelStorage: ViewModelStorage,
        private objectStorage: ObjectStorageInterface,
        private logger: LoggerInterface
    ) { }

    acceptingEvents() {
        return this.state == 'New' || this.state == 'Waiting for worker';
    }

    pushEvent(event: SyncEvent) {
        if (!this.event || event.timestamp > this.event.timestamp) {
            this.event = event;
        }

        return this;
    }

    async run() {
        this.logger.debug('manager', 'processing model %s', this.event.characterId);
        this.state = 'Waiting for worker';

        try {
            await this.pool.withWorker(async (worker: Worker) => {
                this.state = 'Processing';

                this.logger.debug('manager', 'worker aquired');
                this.logger.debug('manager', 'processing with event %j', this.event);
                const characterId = this.event.characterId;
                const model = await this.modelStorage.find(characterId);

                if (model.timestamp > this.event.timestamp) return;

                const events = (await this.eventStorage.range(characterId, model.timestamp, this.event.timestamp))
                    .filter((event) => event.eventType[0] != '_') as any;

                events.push(this.event);

                this.logger.debug('manager', 'events = %j', events);

                const objectStorage = new BoundObjectStorage(this.objectStorage);
                const result: EngineResult = await worker.process(objectStorage, this.event, model, events);

                this.logger.debug('manager', 'result = %j', result);

                if (result.status == 'ok') {
                    let { baseModel, workingModel, viewModels, events: outboundEvents, aquired } = result;

                    delete workingModel._rev;
                    workingModel.timestamp = baseModel.timestamp;

                    await Promise.all([
                        this.modelStorage.store(baseModel),
                        this.workingModelStorage.store(workingModel),
                        this.storeViewModels(characterId, baseModel.timestamp, viewModels),
                        this.storeOutboundEvents(outboundEvents),
                        this.storeAquiredObjects(objectStorage, aquired)
                    ]);
                } else {
                    throw result.error;
                }
            });
        } catch (e) {
            return Promise.reject(this.event);
        } finally {
            this.state = 'Done';
        }

        return this.event;
    }

    private async storeViewModels(characteId: string, timestamp: number, viewModels: { [alias: string]: any }) {
        let pending: Array<Promise<any>> = [];
        for (let alias in viewModels) {
            let viewModel = viewModels[alias];
            viewModel.timestamp = timestamp;
            delete viewModel._rev;
            if (isNil(viewModel._id)) {
                viewModel._id = characteId;
            }

            pending.push(this.viewModelStorage.store(alias, viewModel));
        }

        return pending;
    }

    private async storeOutboundEvents(outboundEvents: Event[] | undefined) {
        if (!outboundEvents || !outboundEvents.length) return;

        let characterIds = outboundEvents.map((e) => e.characterId);
        let models = keyBy(await this.modelStorage.findAll(characterIds), (m) => m.characterId);

        let pending = outboundEvents.map((event) => {
            let model = models[event.characterId];
            if (!model) return;
            event = cloneDeep(event);

            // XXX есть шанс что эта модель сейчас обрабатывается и тогда все пропало
            event.timestamp = Math.max(event.timestamp, model.timestamp + 1);

            return this.eventStorage.store(event);
        });

        return Promise.all(pending);
    }

    private async storeAquiredObjects(objectStorage: BoundObjectStorage, aquired: any) {
        try {
            await objectStorage.store(aquired);
        } catch (e) {
            this.logger.error('manager', "Can't store aquired objects: %j %j", aquired, e);
        } finally {
            objectStorage.release();
        }
    }
}
