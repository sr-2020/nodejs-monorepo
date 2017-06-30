import * as Path from 'path';
import { isNil, get } from 'lodash';
import * as Pouch from 'pouchdb';
import * as glob from 'glob';
import { DBConnectorInterface, DBInterface, ID, Document, FilterParams } from './interface';

export class PouchConnector implements DBConnectorInterface {
    private cache: { [name: string]: PouchDb } = {};
    private views: any;

    constructor(private adapter: string) {
        this.initViews();
    }

    private initViews() {
        let viewFiles = glob.sync(Path.join(__dirname, 'design_docs', '*.js'))
            .map((f) => Path.basename(f, Path.extname(f)));

        this.views = viewFiles.reduce((vs: any, f) => {
            let { views } = require(`./design_docs/${f}`);
            vs[f] = views;
            return vs;
        }, {});
    }

    use(name: string) {
        if (this.cache[name]) return this.cache[name];
        return this.cache[name] = new PouchDb(name, this.adapter, this.views);
    }
}

export class PouchDb implements DBInterface {
    private db: PouchDB.Database;

    constructor(private dbName: string, adapter: string, private views: any) {
        this.db = new Pouch(this.dbName, { adapter });
    }

    get(id: ID, params: any = {}) {
        return this.db.get(id, params);
    }

    async getOrNull(id: ID, params: any): Promise<Document | null> {
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

    put(doc: Document) {
        if (!isNil(doc._id)) {
            return this.db.put(doc);
        } else {
            return this.db.post(doc);
        }
    }

    remove(id: ID, rev: string) {
        if (isNil(id) || isNil(rev)) {
            return Promise.reject(new Error('Document id or revision not defined in remove'));
        }

        return this.db.remove({ _id: id, _rev: rev });
    }

    view(design: string, view: string, params: any = {}): Promise<any> {
        let v = get(this.views, [design, view]);

        if (v) {
            // XXX
            return (this.db as any).query(v, params);
        }

        return Promise.reject(new Error(`No such view: ${design}/${view}`));
    }

    follow(params: FilterParams) {
        let { onChange, ...otherParams } = params;
        otherParams.live = true;
        let feed = this.db.changes(otherParams);

        if (onChange) {
            feed = feed.on('change', onChange);
        }

        return feed;
    }
}
