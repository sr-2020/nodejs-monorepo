import { Inject } from './di';
import { isNil, keyBy } from 'lodash';
import { Subscription, Subject, Observable } from 'rxjs/Rx';

import { Event, SyncEvent, RetryEvent } from 'deus-engine-manager-api';

import { DBConnectorInterface } from './db/interface';

import { Config } from './config';
import { EventsSource /* , Event, SyncEvent */ } from './events_source';
import { ModelStorage } from './model_storage';
import { ViewModelStorage } from './view_model_storage';
import { EventStorage } from './event_storage';
import { CatalogsStorageInterface } from './catalogs_storage';
import { WorkersPoolInterface } from './workers_pool';
import { LoggerInterface } from './logger';

import { Processor, ProcessorFactory } from './processor';

interface SyncedModels {
    [characterId: string]: Event;
}

const MAX_ERRORS = 3;

@Inject
export class Manager {
    private stopped: Subject<{}> = new Subject();

    private processors: {
        [characterId: string]: {
            current: Processor,
            pending?: Processor
        }
    } = {};

    private errors: {
        [characterId: string]: number
    } = {};

    constructor(
        private config: Config,
        private eventsSource: EventsSource,
        private catalogsStorage: CatalogsStorageInterface,
        private modelStorage: ModelStorage,
        private eventStorage: EventStorage,
        private pool: WorkersPoolInterface,
        private processorFactory: ProcessorFactory,
        private logger: LoggerInterface
    ) { }

    async init() {
        let catalogs;
        catalogs = await this.catalogsStorage.load();

        this.pool.init().setCatalogs(catalogs);
        this.subscribeEvents();
    }

    async retryAll() {
        let models = keyBy(await this.modelStorage.findAll(), '_id');
        let refresh = await this.eventStorage.listLastRefresh();

        for (let event of refresh) {
            if (models[event.characterId] && models[event.characterId].timestamp < event.timestamp) {
                this.onSyncEvent(event);
            }
        }
    }

    subscribeEvents() {
        this.eventsSource.syncEvents
            .takeUntil(this.stopped)
            .do(this.logEvent)
            .filter(this.filterErroredModels)
            .subscribe(this.onSyncEvent);

        this.eventsSource.retryEvents
            .takeUntil(this.stopped)
            .do(this.logEvent)
            .flatMap(this.queryLastRefresh)
            .subscribe(this.onSyncEvent);

        this.eventsSource.follow();
    }

    logEvent = (event: Event) => {
        switch (event.eventType) {
            case '_RefreshModel':
                this.logger.info('manager', 'refresh event for %s', event.characterId, event);
                break;
            case '_RetryRefresh':
                this.logger.info('manager', 'retry event for %s', event.characterId, event);
                break;
            default:
                this.logger.warn('manager', 'unexpected event for %s', event.characterId, event);
        }
    }

    filterErroredModels = (event: Event) => {
        const characterId = event.characterId;

        if (this.errors[characterId] && this.errors[characterId] >= MAX_ERRORS) {
            this.logger.warn('manager', 'character exceed MAX_ERRORS value');
            return false;
        }

        return true;
    }

    queryLastRefresh = (event: Event) => Observable.fromPromise(this.eventStorage.lastRefresh(event.characterId))

    onSyncEvent = (event: SyncEvent) => {
        const characterId = event.characterId;

        if (this.processors[characterId]) {
            const processors = this.processors[characterId];
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
            this.processors[characterId] = { current: processor };
            processor.pushEvent(event).run().then(this.processorFulfilled, this.processorRejected);
        }
    }

    processorFulfilled = (event: SyncEvent) => {
        const characterId = event.characterId;

        delete this.errors[characterId];
        this.rotateProcessors(characterId);
    }

    processorRejected = (event: SyncEvent) => {
        this.errors[event.characterId] = (this.errors[event.characterId] || 0) + 1;
        this.rotateProcessors(event.characterId);
    }

    rotateProcessors(characterId: string) {
        if (!this.processors[characterId]) return;

        const processors = this.processors[characterId];
        if (processors.pending) {
            processors.current = processors.pending;
            delete processors.pending;
            processors.current.run().then(this.processorFulfilled, this.processorRejected);
        } else {
            delete this.processors[characterId];
        }
    }

    stop() {
        this.stopped.next({});
        return this.pool.drain();
    }
}
