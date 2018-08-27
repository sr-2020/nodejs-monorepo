import { isNil } from 'lodash';
import { Nano, NanoDocument } from 'nano';
import nano = require('nano');
import { Config } from '../config';
import { Inject } from '../di';
import { stdCallback } from '../utils';

import { DBConnectorInterface, DBInterface, Document, FilterParams, ID } from './interface';

@Inject
export class NanoConnector implements DBConnectorInterface {
    private url: string;
    private connection: Nano;
    private cache: { [name: string]: NanoDb } = {};

    constructor(config: Config) {
        this.url = config.db.url;
    }

    public use(name: string) {
        if (!this.connection) {
            this.connection = nano(this.url);
        }

        if (this.cache[name]) return this.cache[name];

        return this.cache[name] = new NanoDb(this.connection, name);
    }
}

export class NanoDb implements DBInterface {
    private db: NanoDocument;

    constructor(private connection: Nano, private dbName: string) {
        this.db = this.connection.use(dbName);
    }

    public get(id: ID, params: any): Promise<Document> {
        return new Promise((resolve, reject) => {
            this.db.get(id, params, stdCallback(resolve, reject));
        }) as Promise<Document>;
    }

    public async getOrNull(id: ID, params: any): Promise<Document | null> {
        try {
            return await this.get(id, params);
        } catch (e) {
            if (e.statusCode == 404 || e.status == 404) {
                return null;
            } else {
                throw e;
            }
        }
    }

    public list(params?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db.list(params, stdCallback(resolve, reject));
        });
    }

    public put(doc: Document) {
        return new Promise((resolve, reject) => {
            this.db.insert(doc, {}, stdCallback(resolve, reject));
        });
    }

    public remove(id: ID, rev: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (isNil(id) || isNil(rev)) {
                return reject(new Error('Document id or revision not defined in remove'));
            }

            this.db.destroy(id, rev, stdCallback(resolve, reject));
        });
    }

    public view(design: string, view: string, params: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db.view(design, view, params, stdCallback(resolve, reject));
        });
    }

    public follow(params: FilterParams) {
        const { filter, onChange, ...otherParams } = params;

        if (typeof filter == 'string') {
            otherParams.filter = filter;
        }

        const feed = this.connection.db.follow(this.dbName, otherParams);

        if (typeof filter == 'function') {
            feed.filter = filter;
        }

        if (onChange) {
            feed.on('change', onChange);
        }

        feed.follow();

        return feed;
    }
}
