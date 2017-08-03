import * as Pouch from 'pouchdb';
import { MapperInterface } from './mapper';
import { config } from '../config';

export default class DeleteAccounts implements MapperInterface {
    private accountsDb: PouchDB.Database;

    constructor() {
        const ajaxOpts = {
            auth: {
                username: config.username,
                password: config.password
            }
        };

        this.accountsDb = new Pouch(`${config.url}${config.accountDBName}`, ajaxOpts);
    }

    filter(doc) {
        return !doc.inGame;
    }

    async map(doc) {
        console.log(doc._id);
        try {
            await this.accountsDb.remove(doc._id)
        } catch (e) { }
    }
}
