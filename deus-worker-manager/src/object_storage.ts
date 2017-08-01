import { get, set, flatten } from 'lodash';
import { Inject } from './di';
import { DBConnectorInterface, Document, ID } from './db/interface';
import { Config } from './config';

const DB_SEPARATOR = '/';

export interface ObjectStorageInterface {
    newId(): number
    aquire(lockId: number, keys: [string, string][]): Promise<{ [db: string]: { [key: string]: Document } }>
    store(lockId: number, aquired: any): Promise<void>
    release(lockId: number): void
}

@Inject
export class ObjectStorage implements ObjectStorageInterface {
    private storage: {
        [db: string]: {
            [id: string]: {
                lockId: number,
                obj: Document | null | undefined
            }
        }
    } = {};

    private nextId: number = 0;

    constructor(private config: Config, private dbConnector: DBConnectorInterface) { }

    newId() { return this.nextId++; }

    async aquireOne(lockId: number, alias: string, id: string): Promise<Document | null | undefined> {
        let locked = get<any>(this.storage, [alias, id]);
        if (locked) {
            if (locked.lockId == lockId) {
                return locked;
            } else {
                return;
            }
        }

        let dbName = this.config.objects[alias];

        if (!dbName) return;
        if (this.config.db[dbName]) dbName = this.config.db[dbName];

        let db = this.dbConnector.use(dbName);

        let obj = await db.getOrNull(id);

        set(this.storage, [alias, id], { lockId, obj });

        return obj;
    }

    async aquire(lockId: number, keys: [string, string][]) {
        let result: { [db: string]: { [id: string]: Document } } = {};

        let pending = keys.map(async (key) => {
            if (get(result, key)) return;
            let obj = await this.aquireOne(lockId, key[0], key[1]);
            if (obj) {
                set(result, key, obj);
            }
        });

        await Promise.all(pending);

        return result;
    }

    storeOne(lockId: number, alias: string, id: string, obj: any): Promise<void> {
        let locked = get<any>(this.storage, [alias, id]);
        if (!locked || !(locked.lockId == lockId)) {
            return Promise.reject(null);
        }

        let dbName = this.config.objects[alias];

        if (!dbName) return Promise.reject(null);
        if (this.config.db[dbName]) dbName = this.config.db[dbName];

        let db = this.dbConnector.use(dbName);

        return db.put(obj);
    }

    store(lockId: number, aquired: any) {
        let pending = Object.keys(aquired).map((db) => {
            return Object.keys(aquired[db]).map((id) => {
                return this.storeOne(lockId, db, id, aquired[db][id]);
            });
        });

        return Promise.all(flatten(pending)).then(() => { });
    }

    release(lockId: number) {
        for (let db in this.storage) {
            for (let id in this.storage[db]) {
                if (this.storage[db][id].lockId == lockId) delete this.storage[db][id];
            }
        }
    }
}

export class BoundObjectStorage {
    private lockId: number;

    constructor(private objectStorage: ObjectStorageInterface, lockId?: number) {
        this.lockId = lockId || objectStorage.newId();
    }

    aquire(keys: [string, string][]) {
        return this.objectStorage.aquire(this.lockId, keys);
    }

    store(aquired: any) {
        return this.objectStorage.store(this.lockId, aquired);
    }

    release() {
        this.objectStorage.release(this.lockId);
    }
}
