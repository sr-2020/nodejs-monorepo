import * as Pouch from 'pouchdb';
import { config } from '../config';
import { MapperInterface } from './mapper';

export default class DeleteAccounts implements MapperInterface {
  private accountsDb: PouchDB.Database;

  constructor() {
    const ajaxOpts = {
      auth: {
        username: config.username,
        password: config.password,
      },
    };

    this.accountsDb = new Pouch(`${config.url}${config.accountDBName}`, ajaxOpts);
  }

  public filter(doc: any) {
    return !doc.inGame;
  }

  public async map(doc: any) {
    console.log(doc._id);
    try {
      await this.accountsDb.remove(doc._id);
    } catch (e) { }
  }
}
