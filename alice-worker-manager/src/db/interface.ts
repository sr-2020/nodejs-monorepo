export type ID = string;

export interface PutableDocument {
  _id?: ID;
  _rev?: string;
  [key: string]: any;
}

export interface Document extends PutableDocument {
  _id: ID;
}

export interface FilterParams {
  filter?: string | ((doc: any, req: any) => boolean);
  onChange?: (value: PouchDB.Core.ChangesResponseChange<{}>) => any;
  [key: string]: any;
}

export interface DBConnectorInterface {
  use(name: string): DBInterface;
}

export interface DBInterface {
  get(id: ID, params?: any): Promise<Document>;
  getOrNull(id: ID, params?: any): Promise<Document | null>;
  list(params?: any): Promise<any>;
  put(doc: PutableDocument): Promise<any>;
  remove(id: ID, rev: string): Promise<any>;
  follow(params: FilterParams): void;

  createIndex(options: PouchDB.Find.CreateIndexOptions);
  query<T>(options: PouchDB.Find.FindRequest<T>): Promise<PouchDB.Find.FindResponse<T>>;
  // Destroys the whole database! Make sure you know what are you doing.
  destroy(): Promise<void>;
}
