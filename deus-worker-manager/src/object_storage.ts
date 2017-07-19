import { Inject } from './di';
import { DBConnectorInterface, Document, ID } from './db/interface';
import { Config } from './config';

const DB_SEPARATOR = '/';

export interface ObjectStorageInterface {
    newId(): number
    aquire(lockId: number, keys: string[]): Promise<{ [key: string]: Document }>
    store(lockId: number, aquired: any): Promise<void>
    release(lockId: number): void
}

@Inject
export class ObjectStorage implements ObjectStorageInterface {
    private storage: {
        [key: string]: {
            lockId: number,
            obj: Document | null | undefined
        }
    } = {};

    private nextId: number = 0;

    constructor(private config: Config, private dbConnector: DBConnectorInterface) { }

    newId() { return this.nextId++; }

    async aquireOne(lockId: number, key: string): Promise<Document | null | undefined> {
        if (this.storage[key]) {
            if (this.storage[key].lockId == lockId) {
                return this.storage[key].obj;
            } else {
                return;
            }
        }

        let [alias, id] = key.split(DB_SEPARATOR, 2);

        let dbName = this.config.objects[alias];

        if (!dbName) return;
        if (this.config.db[dbName]) dbName = this.config.db[dbName];

        let db = this.dbConnector.use(dbName);

        let obj = await db.getOrNull(id);

        this.storage[key] = { lockId, obj };

        return obj;
    }

    async aquire(lockId: number, keys: string[]) {
        let result: { [key: string]: Document } = {};

        let pending = keys.map(async (key) => {
            let obj = await this.aquireOne(lockId, key);
            if (obj) {
                result[key] = obj;
            }
        });

        await Promise.all(pending);

        return result;
    }

    storeOne(lockId: number, key: string, obj: any): Promise<void> {
        if (!this.storage[key] || !(this.storage[key].lockId == lockId)) {
            return Promise.reject(null);
        }

        let [alias, id] = key.split(DB_SEPARATOR, 2);

        let dbName = this.config.objects[alias];

        if (!dbName) return Promise.reject(null);
        if (this.config.db[dbName]) dbName = this.config.db[dbName];

        let db = this.dbConnector.use(dbName);

        return db.put(obj);
    }

    store(lockId: number, aquired: any) {
        let pending = Object.keys(aquired).map((key) => {
            return this.storeOne(lockId, key, aquired[key]);
        });

        return Promise.all(pending).then(() => { });
    }

    release(lockId: number) {
        for (let key in this.storage) {
            if (this.storage[key].lockId == lockId) delete this.storage[key];
        }
    }
}

export class BoundObjectStorage {
    private lockId: number;

    constructor(private objectStorage: ObjectStorageInterface, lockId?: number) {
        this.lockId = lockId || objectStorage.newId();
    }

    aquire(keys: string[]) {
        return this.objectStorage.aquire(this.lockId, keys);
    }

    store(aquired: any) {
        return this.objectStorage.store(this.lockId, aquired);
    }

    release() {
        this.objectStorage.release(this.lockId);
    }
}
