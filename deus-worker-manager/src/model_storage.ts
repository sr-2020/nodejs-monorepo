import { DBInterface, Document, ID } from './db/interface';

export class ModelStorage {
    constructor(private db: DBInterface) { }

    find(id: ID): Promise<Document> {
        return this.db.get(id);
    }

    async findAll(ids: ID[]): Promise<Document[]> {
        let result = await this.db.list({ keys: ids, include_docs: true });
        return result.rows.map((r) => r.doc);
    }

    async store(doc: any) {
        if (!doc._rev) {
            let stored = await this.db.getOrNull(doc._id);
            if (stored) {
                doc._rev = stored._rev;
            }
        }

        return this.db.put(doc);
    }
}
