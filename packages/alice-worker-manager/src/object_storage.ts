import { flatten, get, set } from 'lodash';
import { Config } from './config';
import { DBConnectorInterface, Document } from './db/interface';

export interface ObjectStorageInterface {
  newId(): number;
  aquire(lockId: number, keys: Array<[string, string]>): Promise<{ [db: string]: { [key: string]: Document } }>;
  store(lockId: number, aquired: any): Promise<void>;
  release(lockId: number): void;
}

export class ObjectStorage implements ObjectStorageInterface {
  private storage: {
    [db: string]: {
      [id: string]: {
        lockId: number,
        obj: Document | null | undefined,
      },
    },
  } = {};

  private nextId: number = 0;

  constructor(private config: Config,
              private dbConnector: DBConnectorInterface) { }

  public newId() { return this.nextId++; }

  public async aquire(lockId: number, keys: Array<[string, string]>) {
    const result: { [db: string]: { [id: string]: Document } } = {};

    const pending = keys.map(async (key) => {
      if (get(result, key)) return;
      const obj = await this.aquireOne(lockId, key[0], key[1]);
      if (obj) {
        set(result, key, obj);
      }
    });

    await Promise.all(pending);

    return result;
  }

  public store(lockId: number, aquired: any) {
    const pending = Object.keys(aquired).map((db) => {
      return Object.keys(aquired[db]).map((id) => {
        return this.storeOne(lockId, db, id, aquired[db][id]);
      });
    });

    return Promise.all(flatten(pending)).then(() => { /* pass */ });
  }

  public release(lockId: number) {
    // tslint:disable-next-line:forin
    for (const db in this.storage) {
      for (const id in this.storage[db]) {
        if (this.storage[db][id].lockId == lockId) delete this.storage[db][id];
      }
    }
  }

  private async aquireOne(lockId: number, alias: string, id: string): Promise<Document | null | undefined> {
    const locked = get(this.storage, [alias, id]);
    if (locked) {
      if (locked.lockId == lockId) {
        return locked; // TODO(aeremin): should it be locked.obj?
      } else {
        return;
      }
    }

    let dbName = this.config.objects[alias];

    if (!dbName) return;
    if (this.config.db[dbName]) dbName = this.config.db[dbName];

    const db = this.dbConnector.use(dbName);

    const obj = await db.getOrNull(id);

    set(this.storage, [alias, id], { lockId, obj });

    return obj;
  }

  private storeOne(lockId: number, alias: string, id: string, obj: any): Promise<void> {
    const locked = get(this.storage, [alias, id]);
    if (!locked || !(locked.lockId == lockId)) {
      return Promise.reject(null);
    }

    let dbName = this.config.objects[alias];

    if (!dbName) return Promise.reject(null);
    if (this.config.db[dbName]) dbName = this.config.db[dbName];

    const db = this.dbConnector.use(dbName);

    return db.put(obj);
  }
}

export class BoundObjectStorage {
  private lockId: number;

  constructor(private objectStorage: ObjectStorageInterface, lockId?: number) {
    this.lockId = lockId || objectStorage.newId();
  }

  public aquire(keys: Array<[string, string]>) {
    return this.objectStorage.aquire(this.lockId, keys);
  }

  public store(aquired: any) {
    return this.objectStorage.store(this.lockId, aquired);
  }

  public release() {
    this.objectStorage.release(this.lockId);
  }
}
