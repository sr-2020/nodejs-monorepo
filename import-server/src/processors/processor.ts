import * as Pouch from 'pouchdb';
import { config } from '../config';
import { MapperInterface } from './mapper';

export class Processor {
    private db: PouchDB.Database;

    constructor(private mapper: MapperInterface) {
        const ajaxOpts = {
            auth: {
                username: config.username,
                password: config.password,
            },
        };

        this.db = new Pouch(`${config.url}${config.modelDBName}`, ajaxOpts);
    }

    public async run() {
        let lastId;
        let total = 0;

        while (true) {
            const params: any = {
                include_docs: true,
                limit: 100,
            };

            if (lastId) {
                params.start_key = lastId;
                params.skip = 1;
            }

            let docs;

            try {
                docs = await this.db.allDocs(params);
            } catch (e) {
                console.error(e);
                throw e;
            }

            const pending = docs.rows
                .map((row) => row.doc)
                .filter((doc) => this.mapper.filter(doc))
                .map((doc) => this.mapper.map(doc));

            total += pending.length;

            try {
                await Promise.all(pending);
            } catch (e) {
                console.log(e);
                throw e;
            }

            const lastDoc = docs.rows[docs.rows.length - 1].doc;
            if (docs.rows.length < 100 || !lastDoc) {
                break;
            }

            lastId = lastDoc._id;
        }

        return total;
    }
}
