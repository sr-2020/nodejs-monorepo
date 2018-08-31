import { Event } from 'alice-model-engine-api';
import { Config } from './config';
import { DBConnectorInterface, DBInterface } from './db/interface';

export function eventStorageFactory(config: Config, dbConnector: DBConnectorInterface) {
  return new EventStorage(dbConnector.use(config.db.events));
}

export class EventStorage {
  constructor(private db: DBInterface) {
    db.createIndex({ index: { fields: ['characterId', 'timestamp'] } });
  }

  public range(characterId: string, since: number, till: number): Promise<Event[]> {
    return this._range(characterId, since, till);
  }

  public async removeOlderThan(characterId: string, till: number): Promise<void> {
    const docs = await this._range(characterId, 0, till);
    await Promise.all(docs.map((doc) => {
      if (doc._rev)
        this.db.remove(doc._id, doc._rev);
    }));
  }

  public store(event: any) {
    event.timestamp = Number(event.timestamp);
    return this.db.put(event);
  }

  private async _range(characterId: string,
                       since: number, till: number): Promise<Array<PouchDB.Core.ExistingDocument<Event>>> {
    if (since >= till) return [];

    const result = await this.db.query<Event>({
      selector: {
        $and: [
          {
            characterId,
          },
          {
            timestamp: {
              $gte: since,
            },
          },
          {
            timestamp: {
              $lte: till,
            },
          },
        ],
      },
    });
    return result.docs;
  }
}
