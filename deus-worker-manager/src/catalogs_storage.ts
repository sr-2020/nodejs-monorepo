import { cloneDeep, get } from 'lodash';
import { Inject } from './di';
import { Config, CatalogsConfigDb, CatalogsConfigFiles } from './config';
import { DBConnectorInterface } from './db/interface';
import { requireDir } from './utils';

interface CatalogObject {
    id: string
    [key: string]: any
}

export interface Catalogs {
    timestamp: number
    data: {
        [catalog: string]: CatalogObject[]
    }
}

export interface CatalogsStorageInterface {
    load(): Promise<Catalogs>
    loadFromFiles(dir: string): Catalogs
    loadFromDb(): Promise<Catalogs>
}

@Inject
export class CatalogsStorage implements CatalogsStorageInterface {
    constructor(private config: Config, private dbConnector: DBConnectorInterface) { }

    catalogDbName(catalog: string): string | undefined {
        let dbName = get<Config, string>(this.config, ['catalogs', 'db', catalog]);
        if (!dbName) return;

        if (this.config.db[dbName]) dbName = this.config.db[dbName];

        return dbName;
    }

    async loadCatalog(catalog: string): Promise<CatalogObject[]> {
        let dbName = this.catalogDbName(catalog);
        if (!dbName) return [];

        const db = this.dbConnector.use(dbName);

        let records: any[] = (await db.list({ include_docs: true })).rows.map((r) => r.doc);

        let data = records.map((doc) => {
            doc = cloneDeep(doc);

            let id = doc._id;

            delete doc.catalog;
            delete doc._id;
            delete doc._rev;

            return doc;
        });

        return data;
    }

    async loadFromDb(): Promise<Catalogs> {
        if (!('db' in this.config.catalogs)) return { timestamp: Date.now(), data: {} };

        let catalogs = this.config.catalogs as CatalogsConfigDb;

        let data = {};

        for (let catalog in catalogs.db) {
            data[catalog] = await this.loadCatalog(catalog);
        }

        return { timestamp: Date.now(), data };
    }

    loadFromFiles(dir: string): Catalogs {
        return Object.freeze({ timestamp: Date.now(), data: requireDir(dir) });
    }

    load() {
        if ('db' in this.config.catalogs) {
            return this.loadFromDb();
        } else {
            return Promise.resolve(this.loadFromFiles((this.config.catalogs as CatalogsConfigFiles).path));
        }
    }
}
