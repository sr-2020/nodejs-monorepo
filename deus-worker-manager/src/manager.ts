import { Inject } from './di';
import { isNil } from 'lodash';
import { Subscription } from 'rxjs';

import { DBConnectorInterface } from './db/interface';

import { Config } from './config';
import { EventsSource, Event, SyncEvent } from './events_source';
import { ModelStorage } from './model_storage';
import { ViewModelStorage } from './view_model_storage';
import { EventStorage } from './event_storage';
import { WorkersPoolInterface } from './workers_pool';
import { LoggerInterface } from './logger';

import { Processor, ProcessorFactory } from './processor';

interface SyncedModels {
    [characterId: string]: Event;
}

@Inject
export class Manager {
    private eventsSourceSubscription: Subscription;

    private processors: {
        [characterId: string]: {
            current: Processor,
            pending?: Processor
        }
    } = {};

    constructor(
        private config: Config,
        private eventsSource: EventsSource,
        private pool: WorkersPoolInterface,
        private processorFactory: ProcessorFactory,
        private logger: LoggerInterface
    ) { }

    init() {
        this.subscribeEvents();
    }

    subscribeEvents() {
        this.eventsSourceSubscription = this.eventsSource.syncEvents.subscribe((event: SyncEvent) => {
            this.logger.info('manager', 'refresh event for %s', event.characterId, event);
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
                processor.pushEvent(event).run().then(this.processorFinished);
                this.processors[characterId] = { current: processor };
            }
        });

        this.eventsSource.follow();
    }

    processorFinished = (event: SyncEvent) => {
        const characterId = event.characterId;
        if (this.processors[characterId]) {
            const processors = this.processors[characterId];
            if (processors.pending) {
                processors.current = processors.pending;
                delete processors.pending;
                processors.current.run().then(this.processorFinished);
            } else {
                delete this.processors[characterId];
            }
        }
    }

    stop() {
        if (!this.eventsSourceSubscription) return;

        this.eventsSourceSubscription.unsubscribe();
        return this.pool.drain();
    }
}
