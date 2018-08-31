import { cloneDeep, isNil, keyBy } from 'lodash';

import { EngineResult, Event, SyncEvent } from 'alice-model-engine-api';

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
  logger: LoggerInterface): ProcessorFactory {
  return () => new Processor(config, pool, eventStorage, modelStorage,
    workingModelStorage, viewModelStorage, objectStorage, logger);
}

export class Processor {
  private state: State = 'New';
  private event: SyncEvent;

  constructor(
    private config: Config,
    private pool: WorkersPoolInterface,
    private eventStorage: EventStorage,
    private modelStorage: ModelStorageBase,
    private workingModelStorage: ModelStorageBase,
    private viewModelStorage: ViewModelStorage,
    private objectStorage: ObjectStorageInterface,
    private logger: LoggerInterface,
  ) { }

  public acceptingEvents(): boolean {
    return this.state == 'New' || this.state == 'Waiting for worker';
  }

  public pushEvent(event: SyncEvent): this {
    if (!this.event || event.timestamp > this.event.timestamp) {
      this.event = event;
    }
    return this;
  }

  public async run(): Promise<SyncEvent> {
    this.logger.info('manager', 'Started processing model',
      { characterId: this.event.characterId, eventTimestamp: this.event.timestamp });
    this.state = 'Waiting for worker';

    try {
      await this.pool.withWorker(async (worker: Worker) => {
        this.state = 'Processing';

        this.logger.info('manager',
          'Worker aquired', { characterId: this.event.characterId, eventTimestamp: this.event.timestamp });
        const characterId = this.event.characterId;
        const model = await this.modelStorage.find(characterId);

        if (model.timestamp > this.event.timestamp) return;

        const events = (await this.eventStorage.range(characterId, model.timestamp + 1, this.event.timestamp))
          .filter((event) => event.eventType[0] != '_') as any;

        events.push(this.event);

        this.logger.debug('manager', 'Processing following events',
          { characterId: this.event.characterId, eventTimestamp: this.event.timestamp, events });

        const objectStorage = new BoundObjectStorage(this.objectStorage);
        const result: EngineResult = await worker.process(objectStorage, this.event, model, events);

        this.logger.info('manager',
          'Finished processing model',
          { characterId: this.event.characterId, eventTimestamp: this.event.timestamp });
        this.logger.debug('manager',
          'Result of model processing',
          { result, characterId: this.event.characterId, eventTimestamp: this.event.timestamp });

        if (result.status == 'ok') {
          const { baseModel, workingModel, viewModels, events: outboundEvents, aquired } = result;

          delete workingModel._rev;
          workingModel.timestamp = baseModel.timestamp;

          try {
            await Promise.all([
              this.modelStorage.store(baseModel),
              this.workingModelStorage.store(workingModel),
              this.storeViewModels(characterId, baseModel.timestamp, viewModels),
              this.storeOutboundEvents(outboundEvents),
              this.storeAquiredObjects(objectStorage, aquired),
            ]);

            await this.eventStorage.removeOlderThan(characterId,
              baseModel.timestamp - this.config.processor.deleteEventsOlderThanMs);

            this.logger.info('manager', 'All data stored',
              { characterId: this.event.characterId, eventTimestamp: this.event.timestamp });
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

  private async storeViewModels(characteId: string, timestamp: number, viewModels: { [alias: string]: any }) {
    const pending: Array<Promise<any>> = [];
    // tslint:disable-next-line:forin
    for (const alias in viewModels) {
      const viewModel = viewModels[alias];
      viewModel.timestamp = timestamp;
      delete viewModel._rev;
      if (isNil(viewModel._id)) {
        viewModel._id = characteId;
      }

      pending.push(this.viewModelStorage.store(alias, viewModel));
    }

    return Promise.all(pending);
  }

  private async storeOutboundEvents(outboundEvents: Event[] | undefined) {
    if (!outboundEvents || !outboundEvents.length) return;

    const characterIds = outboundEvents.map((e) => e.characterId);
    const models = keyBy(await this.modelStorage.findAll(characterIds), (m) => m.characterId);

    const pending = outboundEvents.map((event) => {
      const model = models[event.characterId];
      if (!model) return;
      event = cloneDeep(event);

      // XXX есть шанс что эта модель сейчас обрабатывается и тогда все пропало
      event.timestamp = Math.max(event.timestamp, (model as any).timestamp + 1);

      return this.eventStorage.store(event);
    });

    return Promise.all(pending);
  }

  private async storeAquiredObjects(objectStorage: BoundObjectStorage, aquired: any) {
    try {
      await objectStorage.store(aquired);
    } catch (e) {
      this.logger.error('manager', `Can't store aquired objects, got error: ${e}`, { aquired });
    }
  }
}
