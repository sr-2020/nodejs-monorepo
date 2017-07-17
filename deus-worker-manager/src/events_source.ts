import { EventEmitter } from 'events';
import { DBInterface } from './db/interface';
import { Change } from 'nano';
import * as Rx from 'rxjs/Rx';

import { Event, SyncEvent } from 'deus-engine-manager-api';
import { Document } from './db/interface';

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
    private subject: Rx.Subject<Change<Event>>;
    private feed: EventEmitter;

    constructor(private db: DBInterface) {
        this.subject = new Rx.Subject();
    }

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
        return this.events.filter((e) => {
            return Boolean(e && e.eventType === '_RefreshModel');
        }) as any;
    }
}
