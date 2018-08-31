import { Event, ModelMetadata, SyncEvent } from 'alice-model-engine-api';
import * as Rx from 'rxjs/Rx';
import { Config } from './config';
import { DBConnectorInterface, DBInterface } from './db/interface';

export function eventsSourceFactory(config: Config, dbConnector: DBConnectorInterface) {
  const metadataDb = config.db.metadata;
  if (metadataDb)
    return new MetadataSyncEventsSource(dbConnector.use(metadataDb));
  else
    return new RefreshModelSyncEventsSource(dbConnector.use(config.db.events));
}

export interface SyncEventsSource {
  follow(): void;
  syncEvents(): Rx.Observable<SyncEvent>;
}

export class RefreshModelSyncEventsSource implements SyncEventsSource {
  private subject: Rx.Subject<SyncEvent> = new Rx.Subject();

  constructor(private db: DBInterface) { }

  public follow() {
    const params = {
      include_docs: true,
      filter: '_view',
      view: 'character/refresh-events',

      onChange: (change: PouchDB.Core.ChangesResponseChange<Event>) => {
        if (!change.doc) return;
        const doc = change.doc;
        if (doc._deleted) return;
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
