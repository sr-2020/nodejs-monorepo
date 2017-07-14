import { cloneDeep } from 'lodash';
import { Inject } from './di';
import { DBInterface } from './db/interface';
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
}

@Inject
export class CatalogsStorage implements CatalogsStorageInterface {
    constructor(private db?: DBInterface) { }

    async load(): Promise<Catalogs> {
        if (!this.db) throw new Error('Catalogs db is not configured');

        let records: any[] = (await this.db.list({ include_docs: true })).rows.map((r) => r.doc);

        let data = records.reduce((catalogs, doc) => {
            if (!doc.catalog) return catalogs;

            doc = cloneDeep(doc);

            let catalog = doc.catalog;
            let id = doc._id;

            delete doc.catalog;
            delete doc._id;
            delete doc._rev;

            if (!catalogs[catalog]) catalogs[catalog] = [];
            catalogs[catalog].push(doc);

            return catalogs;
        }, {});

        return Object.freeze({ timestamp: Date.now(), data });
    }

    loadFromFiles(dir: string): Catalogs {
        return Object.freeze({ timestamp: Date.now(), data: requireDir(dir) });
    }
}
