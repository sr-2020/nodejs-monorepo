import { Config } from './config';
import { DBConnectorInterface, DBInterface, Document, ID } from './db/interface';

export class ModelStorageBase {
  constructor(private db: DBInterface) {}

  public async find(id: ID): Promise<Document> {
    const result = await this.db.get(id);
    return { ...result, modelId: result._id };
  }

  public async findAll(ids?: ID[]): Promise<Document[]> {
    const params: any = { include_docs: true };
    if (ids) {
      params.keys = ids;
    }
    const result = await this.db.list(params);
    return result.rows.map((r) => ({ ...r.doc, modelId: r.doc._id }));
  }

  public async store(doc: any) {
    doc._id = doc.modelId;
    if (!doc._rev) {
      const stored = await this.db.getOrNull(doc._id);
      if (stored) {
        doc._rev = stored._rev;
      }
    }

    return this.db.put(doc);
  }
}

export class ModelStorage extends ModelStorageBase {
  constructor(c: Config, dbConnector: DBConnectorInterface) {
    super(dbConnector.use(c.db.models));
  }
}

// tslint:disable-next-line:no-unused
export class WorkingModelStorage extends ModelStorageBase {
  constructor(c: Config, dbConnector: DBConnectorInterface) {
    super(dbConnector.use(c.db.workingModels));
  }
}
