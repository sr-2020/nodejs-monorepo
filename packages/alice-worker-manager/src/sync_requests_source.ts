import { ModelMetadata, SyncRequest } from 'alice-model-engine-api';
import * as Rx from 'rxjs';
import { Config } from './config';
import { DBConnectorInterface, DBInterface } from './db/interface';

export function eventsSourceFactory(config: Config, dbConnector: DBConnectorInterface) {
  return new MetadataSyncRequestsSource(dbConnector.use(config.db.metadata));
}

export interface SyncRequestsSource {
  follow(): void;
  syncRequests(): Rx.Observable<SyncRequest>;
}

export class MetadataSyncRequestsSource implements SyncRequestsSource {
  private subject = new Rx.Subject<SyncRequest>();

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
          scheduledUpdateTimestamp: doc.scheduledUpdateTimestamp,
        });
      },
    };

    this.db.follow(params);
  }

  public syncRequests(): Rx.Observable<SyncRequest> {
    return this.subject;
  }
}
