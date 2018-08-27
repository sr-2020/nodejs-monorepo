import { cloneDeep, get } from 'lodash';
import { CatalogsConfigDb, CatalogsConfigFiles, Config } from './config';
import { DBConnectorInterface } from './db/interface';
import { Inject } from './di';
import { requireDir } from './utils';

interface CatalogObject {
    id: string;
    [key: string]: any;
}

export interface Catalogs {
    timestamp: number;
    data: {
        [catalog: string]: CatalogObject[],
    };
}

export interface CatalogsStorageInterface {
    load(): Promise<Catalogs>;
    loadFromFiles(dir: string): Catalogs;
    loadFromDb(): Promise<Catalogs>;
}

@Inject
export class CatalogsStorage implements CatalogsStorageInterface {
    constructor(private config: Config, private dbConnector: DBConnectorInterface) { }

    public catalogDbName(catalog: string): string | undefined {
        let dbName: string = get(this.config, ['catalogs', 'db', catalog]);
        if (!dbName) return;

        if (this.config.db[dbName]) dbName = this.config.db[dbName];

        return dbName;
    }

    public async loadCatalog(catalog: string): Promise<CatalogObject[]> {
        const dbName = this.catalogDbName(catalog);
        if (!dbName) return [];

        const db = this.dbConnector.use(dbName);

        const records: any[] = (await db.list({ include_docs: true })).rows.map((r) => r.doc);

        const data = records.map((doc) => {
            doc = cloneDeep(doc);

            doc.id = doc._id;
            delete doc._id;
            delete doc._rev;

            return doc;
        });

        return data;
    }

    public async loadFromDb(): Promise<Catalogs> {
        if (!('db' in this.config.catalogs)) return { timestamp: Date.now(), data: {} };

        const catalogs = this.config.catalogs as CatalogsConfigDb;

        const data = {};

        // tslint:disable-next-line:forin
        for (const catalog in catalogs.db) {
            data[catalog] = await this.loadCatalog(catalog);
        }

        return { timestamp: Date.now(), data };
    }

    public loadFromFiles(dir: string): Catalogs {
        return Object.freeze({ timestamp: Date.now(), data: requireDir(dir) });
    }

    public load() {
        if ('db' in this.config.catalogs) {
            return this.loadFromDb();
        } else {
            return Promise.resolve(this.loadFromFiles((this.config.catalogs as CatalogsConfigFiles).path));
        }
    }
}
