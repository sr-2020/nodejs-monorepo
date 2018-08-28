import * as Rx from 'rxjs/Rx';
import { DBInterface } from './db/interface';

import { Event, RetryEvent, SyncEvent } from 'alice-model-engine-api';

const SYNC_EVENT_TYPE = '_RefreshModel';
const RETRY_EVENT_TYPE = '_RetryRefresh';

function docToEvent(e: PouchDB.Core.ExistingDocument<Event>): Event {
    return {
        characterId: e.characterId,
        eventType: e.eventType,
        timestamp: e.timestamp,
        data: e.data,
    };
}

export class EventsSource {
    private subject: Rx.Subject<PouchDB.Core.ChangesResponseChange<Event>> = new Rx.Subject();

    constructor(private db: DBInterface) { }

    public follow() {
        const params = {
            since: 'now',
            include_docs: true,

            filter: (doc: any, _req: any) => {
                if (doc._deleted) {
                    return false;
                }

                return true;
            },

            onChange: (change: PouchDB.Core.ChangesResponseChange<Event>) => {
                this.subject.next(change);
            },
        };

        this.db.follow(params);
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
