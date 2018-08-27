import { DBInterface, Document, ID } from './db/interface';

export class ModelStorage {
    constructor(private db: DBInterface) { }

    public find(id: ID): Promise<Document> {
        return this.db.get(id);
    }

    public async findAll(ids?: ID[]): Promise<Document[]> {
        const params: any = { include_docs: true };
        if (ids) {
            params.keys = ids;
        }
        const result = await this.db.list(params);
        return result.rows.map((r) => r.doc);
    }

    public async store(doc: any) {
        if (!doc._rev) {
            const stored = await this.db.getOrNull(doc._id);
            if (stored) {
                doc._rev = stored._rev;
            }
        }

        return this.db.put(doc);
    }
}
