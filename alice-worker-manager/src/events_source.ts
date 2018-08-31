import { Event, SyncEvent } from 'alice-model-engine-api';
import * as Rx from 'rxjs/Rx';
import { Config } from './config';
import { DBConnectorInterface, DBInterface } from './db/interface';

export function eventsSourceFactory(config: Config, dbConnector: DBConnectorInterface) {
  return new EventsSource(dbConnector.use(config.db.events));
}

export class EventsSource {
  private subject: Rx.Subject<SyncEvent> = new Rx.Subject();

  constructor(private db: DBInterface) { }

  public follow() {
    const params = {
      since: 'now',
      include_docs: true,

      onChange: (change: PouchDB.Core.ChangesResponseChange<Event>) => {
        if (!change.doc) return;
        const doc = change.doc;
        if (doc._deleted) return;
        if (doc.eventType != '_RefreshModel') return;
        this.subject.next({
          characterId: doc.characterId,
          eventType: '_RefreshModel',
          timestamp: doc.timestamp,
          data: doc.data,
        });
      },
    };

    this.db.follow(params);
  }

  public syncEvents(): Rx.Observable<SyncEvent> {
    return this.subject;
  }
}
