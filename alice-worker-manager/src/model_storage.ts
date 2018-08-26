import { DBInterface, Document, ID } from './db/interface';

export class ModelStorage {
    constructor(private db: DBInterface) { }

    find(id: ID): Promise<Document> {
        return this.db.get(id);
    }

    async findAll(ids?: ID[]): Promise<Document[]> {
        let params: any = { include_docs: true };
        if (ids) {
            params.keys = ids;
        }
        let result = await this.db.list(params);
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
