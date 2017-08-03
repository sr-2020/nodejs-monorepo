import * as Pouch from 'pouchdb';
import { MapperInterface } from './mapper';
import { config } from '../config';

export class Processor {
    private db: PouchDB.Database;

    constructor(private mapper: MapperInterface) {
        const ajaxOpts = {
            auth: {
                username: config.username,
                password: config.password
            }
        };

        this.db = new Pouch(`${config.url}${config.modelDBName}`, ajaxOpts);
    }

    async run() {
        let lastId;
        while (true) {
            let params: any = {
                include_docs: true,
                limit: 100
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

            let pending = docs.rows
                .map((row) => row.doc)
                .filter((doc) => this.mapper.filter(doc))
                .map((doc) => this.mapper.map(doc));

            await Promise.all(pending);

            if (docs.rows.length < 100) {
                break;
            }

            lastId = docs.rows[docs.rows.length - 1].doc._id;
        }
    }
}
