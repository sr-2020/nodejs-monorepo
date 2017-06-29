import { EventEmitter } from 'events';
import { DBInterface } from './db/interface';
import { Change } from 'nano';
import * as Rx from 'rxjs/Rx';

export interface Event {
    _id: string,
    eventType: string,
    timestamp: number,
    characterId: string,
    data: any
}

export default class EventsSource {
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

    get events() {
        return this.subject.map((change) => change.doc);
    }

    get refreshModelEvents() {
        return this.events.filter((e) => {
            return Boolean(e && e.eventType === '_RefreshModel');
        });
    }
}
