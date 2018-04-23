import { TSMap } from "typescript-map";
import * as PouchDB from 'pouchdb';

export interface Account {
  password: string,
  access?: {id: string, timestamp: number}[],
  pushToken?: string,
}

export interface ViewModel {
  timestamp: number,
}

export class DatabasesContainer {
  constructor(
    private _eventsDb: PouchDB.Database<{}>,
    private _viewmodelDbs: TSMap<string, PouchDB.Database<ViewModel>>,
    private _accountsDb: PouchDB.Database<Account>){}

  public eventsDb() { return this._eventsDb; }
  public accountsDb() { return this._accountsDb; }
  public viewModelDb(type: string = 'default') { return this._viewmodelDbs.get(type); }
}

let _dbContainer: DatabasesContainer;

export function setDatabaseContainer(dbContainer: DatabasesContainer) {
  _dbContainer = dbContainer;
}

export function getDatabaseContainer() {
  return _dbContainer;
}