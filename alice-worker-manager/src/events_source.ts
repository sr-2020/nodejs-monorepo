import { ModelMetadata, SyncEvent } from 'alice-model-engine-api';
import * as Rx from 'rxjs/Rx';
import { Config } from './config';
import { DBConnectorInterface, DBInterface } from './db/interface';

export function eventsSourceFactory(config: Config, dbConnector: DBConnectorInterface) {
  return new MetadataSyncEventsSource(dbConnector.use(config.db.metadata));
}

export interface SyncEventsSource {
  follow(): void;
  syncEvents(): Rx.Observable<SyncEvent>;
}

export class MetadataSyncEventsSource implements SyncEventsSource {
  private subject: Rx.Subject<SyncEvent> = new Rx.Subject();

  constructor(private db: DBInterface) { }

  public follow() {
    const params = {
      include_docs: true,

      onChange: (change: PouchDB.Core.ChangesResponseChange<ModelMetadata>) => {
        if (!change.doc) return;
        const doc = change.doc;
        if (doc._deleted) return;
        this.subject.next({
          characterId: doc._id,
          eventType: '_RefreshModel',
          timestamp: doc.scheduledUpdateTimestamp,
        });
      },
    };

    this.db.follow(params);
  }

  public syncEvents(): Rx.Observable<SyncEvent> {
    return this.subject;
  }
}
