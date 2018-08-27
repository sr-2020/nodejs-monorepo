import { EventEmitter } from 'events';
import { get, isNil } from 'lodash';
import * as Pouch from 'pouchdb';
import { getAllDesignDocs } from '../db_init/design_docs_helper';
import { Inject } from '../di';
import { DBConnectorInterface, DBInterface, Document, FilterParams, ID } from './interface';

@Inject
export class PouchConnector implements DBConnectorInterface {
    private cache: { [name: string]: PouchDb } = {};
    private views: any;

    constructor(private adapter: string) {
        this.initViews();
    }

    public use(name: string): DBInterface {
        if (this.cache[name]) return this.cache[name];
        return this.cache[name] = new PouchDb(name, this.adapter, this.views);
    }

    private initViews() {
        const designDocs = getAllDesignDocs();

        this.views = designDocs.reduce((vs: any, doc) => {
            const { views } = doc;
            vs[(doc._id as string).slice('_design/'.length)] = views;
            return vs;
        }, {});
    }
}

export class PouchDb implements DBInterface {
    private db: PouchDB.Database;

    constructor(private dbName: string, adapter: string, private views: any) {
        this.db = new Pouch(this.dbName, { adapter });
    }

    public get(id: ID, params: any = {}) {
        return this.db.get(id, params);
    }

    public async getOrNull(id: ID, params: any): Promise<Document | null> {
        try {
            return await this.get(id, params);
        } catch (e) {
            if (e.status == 404) {
                return null;
            } else {
                throw e;
            }
        }
    }

    public list(params?: any): Promise<any> {
        return this.db.allDocs(params);
    }

    public put(doc: Document) {
        if (!isNil(doc._id)) {
            return this.db.put(doc);
        } else {
            return this.db.post(doc);
        }
    }

    public remove(id: ID, rev: string) {
        if (isNil(id) || isNil(rev)) {
            return Promise.reject(new Error('Document id or revision not defined in remove'));
        }

        return this.db.remove({ _id: id, _rev: rev });
    }

    public view(design: string, view: string, params: any = {}): Promise<any> {
        const v = get(this.views, [design, view]);

        if (v) {
            // XXX
            return (this.db as any).query(v, params);
        }

        return Promise.reject(new Error(`No such view: ${design}/${view}`));
    }

    public follow(params: FilterParams): EventEmitter {
        const { onChange, ...otherParams } = params;
        otherParams.live = true;
        let feed = this.db.changes(otherParams);

        if (onChange) {
            feed = feed.on('change', onChange);
        }

        return feed as any;
    }
}
