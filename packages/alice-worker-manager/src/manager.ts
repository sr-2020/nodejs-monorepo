import { Subject } from 'rxjs';

import { SyncRequest } from 'interface/src/models/alice-model-engine';

import { CatalogsStorageInterface } from './catalogs_storage';
import { LoggerInterface } from './logger';
import { SyncRequestsSource } from './sync_requests_source';
import { WorkersPoolInterface } from './workers_pool';

import { Processor, ProcessorFactory } from './processor';

const MAX_ERRORS = 3;

export class Manager {
  private stopped: Subject<{}> = new Subject();

  private processors: {
    [modelId: string]: {
      current: Processor;
      pending?: Processor;
    };
  } = {};

  private errors: {
    [modelId: string]: number;
  } = {};

  constructor(
    private eventsSource: SyncRequestsSource,
    private catalogsStorage: CatalogsStorageInterface,
    private pool: WorkersPoolInterface,
    private processorFactory: ProcessorFactory,
    private logger: LoggerInterface,
  ) {}

  public async init() {
    let catalogs;
    catalogs = await this.catalogsStorage.load();

    this.pool.init().setCatalogs(catalogs);
    this.subscribeEvents();
  }

  public subscribeEvents() {
    this.eventsSource
      .syncRequests()
      .takeUntil(this.stopped)
      .do(this.logEvent)
      .filter(this.filterErroredModels)
      .subscribe(this.onSyncEvent);

    this.eventsSource.follow();
  }

  public logEvent = (event: SyncRequest) => {
    this.logger.info('manager', `Get sync request for ${event.modelId}`, { modelId: event.modelId, event });
  };

  public filterErroredModels = (event: SyncRequest) => {
    const modelId = event.modelId;

    if (this.errors[modelId] && this.errors[modelId] >= MAX_ERRORS) {
      this.logger.warn('manager', 'Character exceed MAX_ERRORS value', { modelId, totalErrors: this.errors[modelId], MAX_ERRORS });
      return false;
    }

    return true;
  };

  public onSyncEvent = (event: SyncRequest) => {
    const modelId = event.modelId;

    if (this.processors[modelId]) {
      const processors = this.processors[modelId];
      if (processors.current.acceptingEvents()) {
        processors.current.pushEvent(event);
      } else {
        if (!processors.pending) {
          processors.pending = this.processorFactory();
        }
        processors.pending.pushEvent(event);
      }
    } else {
      const processor = this.processorFactory();
      this.processors[modelId] = { current: processor };
      processor
        .pushEvent(event)
        .run()
        .then(this.processorFulfilled, this.processorRejected);
    }
  };

  public processorFulfilled = (event: SyncRequest) => {
    const modelId = event.modelId;

    delete this.errors[modelId];
    this.rotateProcessors(modelId);
  };

  public processorRejected = (event: SyncRequest) => {
    this.errors[event.modelId] = (this.errors[event.modelId] || 0) + 1;
    this.rotateProcessors(event.modelId);
  };

  public rotateProcessors(modelId: string) {
    if (!this.processors[modelId]) return;

    const processors = this.processors[modelId];
    if (processors.pending) {
      processors.current = processors.pending;
      delete processors.pending;
      processors.current.run().then(this.processorFulfilled, this.processorRejected);
    } else {
      delete this.processors[modelId];
    }
  }

  public stop() {
    this.stopped.next({});
    return this.pool.drain();
  }
}
