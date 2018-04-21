import { TSMap } from "typescript-map";

export class DatabasesContainer {
  constructor(
    private _eventsDb: PouchDB.Database<any>,
    private _viewmodelDbs: TSMap<string, PouchDB.Database<any>>,
    private _accountsDb: PouchDB.Database<any>){}

  public eventsDb() { return this._eventsDb; }
  public accountsDb() { return this._accountsDb; }
  public viewModelDb(type: string = 'default') { return this._viewmodelDbs.get(type); }
}