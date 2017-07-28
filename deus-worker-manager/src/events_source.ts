import { EventEmitter } from 'events';
import { DBInterface } from './db/interface';
import { Change } from 'nano';
import * as Rx from 'rxjs/Rx';

import { Event, SyncEvent, RetryEvent } from 'deus-engine-manager-api';
import { Document } from './db/interface';

const SYNC_EVENT_TYPE = '_RefreshModel';
const RETRY_EVENT_TYPE = '_RetryRefresh';

type EventDocument = Document & Event;
type SyncEventDocument = Document & SyncEvent;

function docToEvent(e: EventDocument): Event {
    return {
        characterId: e.characterId,
        eventType: e.eventType,
        timestamp: e.timestamp,
        data: e.data
    };
}

export class EventsSource {
    private subject: Rx.Subject<Change<Event>> = new Rx.Subject();
    private feed: EventEmitter;

    constructor(private db: DBInterface) { }

    follow() {
        const params = {
            since: 'now',
            include_docs: true,

            filter: (doc: any, req: any) => {
                if (doc._deleted) {
                    return false;
                }

                return true;
            },

            onChange: (change: Change<Event>) => {
                this.subject.next(change);
            }
        };

        this.feed = this.db.follow(params);
    }

    get observable() { return this.subject; }

    get events(): Rx.Observable<Event> {
        return this.subject.map((change) => change.doc).map(docToEvent);
    }

    get syncEvents(): Rx.Observable<SyncEvent> {
        return this.events.filter((e) => Boolean(e.eventType === SYNC_EVENT_TYPE)) as any;
    }

    get retryEvents(): Rx.Observable<RetryEvent> {
        return this.events.filter((e) => Boolean(e.eventType === RETRY_EVENT_TYPE)) as any;
    }
}
