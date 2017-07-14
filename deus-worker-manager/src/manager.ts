import { Inject } from './di';
import { isNil } from 'lodash';
import { Subscription } from 'rxjs';

import { DBConnectorInterface } from './db/interface';

import { Config } from './config';
import { EventsSource, Event, SyncEvent } from './events_source';
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
    private eventsSourceSubscription: Subscription;

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

    subscribeEvents() {
        this.eventsSourceSubscription = this.eventsSource.syncEvents.subscribe((event: SyncEvent) => {
            this.logger.info('manager', 'refresh event for %s', event.characterId, event);
            const characterId = event.characterId;

            if (this.errors[characterId] && this.errors[characterId] >= MAX_ERRORS) {
                this.logger.warn('manager', 'character exceed MAX_ERRORS value');
                return;
            }

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
        });

        this.eventsSource.follow();
    }

    processorFulfilled = (event: SyncEvent) => {
        const characterId = event.characterId;

        delete this.errors[characterId];

        if (this.processors[characterId]) {
            const processors = this.processors[characterId];
            if (processors.pending) {
                processors.current = processors.pending;
                delete processors.pending;
                processors.current.run().then(this.processorFulfilled);
            } else {
                delete this.processors[characterId];
            }
        }
    }

    processorRejected = (event: SyncEvent) => {
        this.errors[event.characterId] = (this.errors[event.characterId] || 0) + 1;
    }

    stop() {
        if (!this.eventsSourceSubscription) return;

        this.eventsSourceSubscription.unsubscribe();
        return this.pool.drain();
    }
}
