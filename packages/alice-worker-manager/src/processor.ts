import { cloneDeep, isNil, keyBy } from 'lodash';

import { AquiredObjects, EngineResult, Event, SyncRequest } from 'alice-model-engine-api';

import { Config } from './config';
import { EventStorage } from './event_storage';
import { LoggerInterface } from './logger';
import { ModelStorageBase } from './model_storage';
import { BoundObjectStorage, ObjectStorageInterface } from './object_storage';
import { ViewModelStorage } from './view_model_storage';
import { Worker } from './worker';
import { WorkersPoolInterface } from './workers_pool';

type State = 'New' | 'Waiting for worker' | 'Processing' | 'Done';

export type ProcessorFactory = () => Processor;

export function processorFactory(
  config: Config,
  pool: WorkersPoolInterface,
  eventStorage: EventStorage,
  modelStorage: ModelStorageBase,
  workingModelStorage: ModelStorageBase,
  viewModelStorage: ViewModelStorage,
  objectStorage: ObjectStorageInterface,
  logger: LoggerInterface,
): ProcessorFactory {
  return () => new Processor(config, pool, eventStorage, modelStorage, workingModelStorage, viewModelStorage, objectStorage, logger);
}

export class Processor {
  private state: State = 'New';
  private event: SyncRequest;

  constructor(
    private config: Config,
    private pool: WorkersPoolInterface,
    private eventStorage: EventStorage,
    private modelStorage: ModelStorageBase,
    private workingModelStorage: ModelStorageBase,
    private viewModelStorage: ViewModelStorage,
    private objectStorage: ObjectStorageInterface,
    private logger: LoggerInterface,
  ) {}

  public acceptingEvents(): boolean {
    return this.state == 'New' || this.state == 'Waiting for worker';
  }

  public pushEvent(event: SyncRequest): this {
    if (!this.event || event.scheduledUpdateTimestamp > this.event.scheduledUpdateTimestamp) {
      this.event = event;
    }
    return this;
  }

  public async run(): Promise<SyncRequest> {
    this.logger.info('manager', 'Started processing model', {
      modelId: this.event.modelId,
      eventTimestamp: this.event.scheduledUpdateTimestamp,
    });
    this.state = 'Waiting for worker';

    try {
      await this.pool.withWorker(async (worker: Worker) => {
        this.state = 'Processing';

        this.logger.info('manager', 'Worker aquired', {
          modelId: this.event.modelId,
          eventTimestamp: this.event.scheduledUpdateTimestamp,
        });
        const modelId = this.event.modelId;
        const model = await this.modelStorage.find(modelId);

        if (model.timestamp > this.event.scheduledUpdateTimestamp) return;

        const events = (await this.eventStorage.range(modelId, model.timestamp + 1, this.event.scheduledUpdateTimestamp)).filter(
          (event) => event.eventType[0] != '_',
        );

        events.push({ modelId: this.event.modelId, eventType: '_NoOp', timestamp: this.event.scheduledUpdateTimestamp });

        this.logger.debug('manager', 'Processing following events', {
          modelId: this.event.modelId,
          eventTimestamp: this.event.scheduledUpdateTimestamp,
          events,
        });

        const objectStorage = new BoundObjectStorage(this.objectStorage);
        const result: EngineResult = await worker.process(objectStorage, this.event, model, events);

        this.logger.info('manager', 'Finished processing model', {
          modelId: this.event.modelId,
          eventTimestamp: this.event.scheduledUpdateTimestamp,
        });
        this.logger.debug('manager', 'Result of model processing', {
          result,
          modelId: this.event.modelId,
          eventTimestamp: this.event.scheduledUpdateTimestamp,
        });

        if (result.status == 'ok') {
          const { baseModel, workingModel, viewModels, outboundEvents, aquired } = result;

          delete workingModel._rev;
          workingModel.timestamp = baseModel.timestamp;

          try {
            await Promise.all([
              this.modelStorage.store(baseModel),
              this.workingModelStorage.store(workingModel),
              this.storeViewModels(modelId, baseModel.timestamp, viewModels),
              this.storeOutboundEvents(outboundEvents),
              this.storeAquiredObjects(objectStorage, aquired),
            ]);

            await this.eventStorage.removeOlderThan(modelId, baseModel.timestamp - this.config.processor.deleteEventsOlderThanMs);

            this.logger.info('manager', 'All data stored', {
              modelId: this.event.modelId,
              eventTimestamp: this.event.scheduledUpdateTimestamp,
            });
          } finally {
            objectStorage.release();
          }
        } else {
          objectStorage.release();
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

  private async storeViewModels(modelId: string, timestamp: number, viewModels: { [alias: string]: any }) {
    const pending: Array<Promise<any>> = [];
    // tslint:disable-next-line:forin
    for (const alias in viewModels) {
      const viewModel = viewModels[alias];
      viewModel.timestamp = timestamp;
      delete viewModel._rev;
      if (isNil(viewModel._id)) {
        viewModel._id = modelId;
      }

      pending.push(this.viewModelStorage.store(alias, viewModel));
    }

    return Promise.all(pending);
  }

  private async storeOutboundEvents(outboundEvents: Event[] | undefined) {
    if (!outboundEvents || !outboundEvents.length) return;

    const modelIds = outboundEvents.map((e) => e.modelId);
    const models = keyBy(await this.modelStorage.findAll(modelIds), (m) => m.modelId);

    const pending = outboundEvents.map((event) => {
      const model = models[event.modelId];
      if (!model) return;
      event = cloneDeep(event);

      // XXX есть шанс что эта модель сейчас обрабатывается и тогда все пропало
      event.timestamp = Math.max(event.timestamp, (model as any).timestamp + 1);

      return this.eventStorage.store(event);
    });

    return Promise.all(pending);
  }

  private async storeAquiredObjects(objectStorage: BoundObjectStorage, aquired: AquiredObjects) {
    try {
      await objectStorage.store(aquired);
    } catch (e) {
      this.logger.error('manager', `Can't store aquired objects, got error: ${e}`, { aquired });
    }
  }
}
