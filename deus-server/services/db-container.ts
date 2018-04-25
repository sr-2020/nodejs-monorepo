import { TSMap } from "typescript-map";
import * as PouchDB from 'pouchdb';
import { Token } from "typedi";
import { Connection } from "../connection";

export interface Account {
  password: string,
  access?: {id: string, timestamp: number}[],
  pushToken?: string,
}

export interface ViewModel {
  timestamp: number,
}

export interface DatabasesContainerInterface {
  // TODO: Make private, provide accessors
  connections: TSMap<string, Connection>,

  eventsDb(): PouchDB.Database<{}>,
  accountsDb(): PouchDB.Database<Account>,
  viewModelDb(type: string): PouchDB.Database<ViewModel>,
}

export const DatabasesContainerToken = new Token<DatabasesContainerInterface>();

export class DatabasesContainer implements DatabasesContainerInterface{
  public connections = new TSMap<string, Connection>();

  constructor(
    private _eventsDb: PouchDB.Database<{}>,
    private _viewmodelDbs: TSMap<string, PouchDB.Database<ViewModel>>,
    private _accountsDb: PouchDB.Database<Account>){
      const options = { since: 'now', live: true, include_docs: true, return_docs: false };
      this.viewModelDb('mobile').changes(options)
        .on('change', (change) => {
          if (!change.doc)
            return;

          if (this.connections.has(change.doc._id))
            this.connections.get(change.doc._id).onViewModelUpdate(change.doc);
        });
    }

  public eventsDb() { return this._eventsDb; }
  public accountsDb() { return this._accountsDb; }
  public viewModelDb(type: string = 'default') { return this._viewmodelDbs.get(type); }
}
