import { TSMap } from "typescript-map";
import * as PouchDB from 'pouchdb';
import { Token } from "typedi";
import { Connection } from "../connection";

export interface AccessEntry {
  id: string;
  timestamp: number;
}

export interface Account {
  _id: string;
  login?: string,
  password: string,
  access?: AccessEntry[],
  pushToken?: string,
  roles?: string[];
}

export interface ViewModel {
  timestamp: number;
  [key: string]: any;
}

export interface TransactionRequest {
  sender: string;
  receiver: string;
  amount: number;
  description?: string;
}

export interface TransactionDocument extends TransactionRequest {
  timestamp: number;
}

export interface BalancesDocument {
  [key: string]: number;
}

export interface DatabasesContainerInterface {
  // TODO: Make private, provide accessors
  connections: TSMap<string, Connection>,

  eventsDb(): PouchDB.Database<{}>,
  accountsDb(): PouchDB.Database<Account>,
  viewModelDb(type: string): PouchDB.Database<ViewModel>,
  economyDb(): PouchDB.Database<TransactionDocument | BalancesDocument>,
}

export const DatabasesContainerToken = new Token<DatabasesContainerInterface>();

export class DatabasesContainer implements DatabasesContainerInterface{
  public connections = new TSMap<string, Connection>();

  constructor(
    protected _eventsDb: PouchDB.Database<{ timestamp: number }>,
    protected _viewmodelDbs: TSMap<string, PouchDB.Database<ViewModel>>,
    protected _accountsDb: PouchDB.Database<Account>,
    protected _economyDb: PouchDB.Database<TransactionDocument | BalancesDocument>){
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
  public economyDb() { return this._economyDb; }
}
