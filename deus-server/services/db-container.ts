import { TSMap } from "typescript-map";
import * as PouchDB from 'pouchdb';
import { Token } from "typedi";

export interface Account {
  password: string,
  access?: {id: string, timestamp: number}[],
  pushToken?: string,
}

export interface ViewModel {
  timestamp: number,
}

export interface DatabasesContainerInterface {
  eventsDb(): PouchDB.Database<{}>,
  accountsDb(): PouchDB.Database<Account>,
  viewModelDb(type: string): PouchDB.Database<ViewModel>,
}

export const DatabasesContainerToken = new Token<DatabasesContainerInterface>();

export class DatabasesContainer implements DatabasesContainerInterface{
  constructor(
    private _eventsDb: PouchDB.Database<{}>,
    private _viewmodelDbs: TSMap<string, PouchDB.Database<ViewModel>>,
    private _accountsDb: PouchDB.Database<Account>){}

  public eventsDb() { return this._eventsDb; }
  public accountsDb() { return this._accountsDb; }
  public viewModelDb(type: string = 'default') { return this._viewmodelDbs.get(type); }
}
