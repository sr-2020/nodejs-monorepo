import { DBInterface, Document, ID } from './db/interface';
import { stdCallback } from './utils';

export default class ModelStorage {
    constructor(private db: DBInterface) { };

    find(id: ID): Promise<Document> {
        return this.db.get(id);
    }

    async store(doc: any): Promise<Document> {
        if (!doc._rev) {
            let stored = await this.db.getOrNull(doc._id);
            if (stored) {
                doc._rev = stored._rev;
            }
        }

        return this.db.put(doc);
    }
}
