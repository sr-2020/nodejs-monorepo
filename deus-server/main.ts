import App from './app'
import * as PouchDB from 'pouchdb';
import { TSMap } from "typescript-map";
import * as config from '../configs/deus-server'

const authOptions = { auth: { username: config.username, password: config.password } };

const viewmodelDbs = new TSMap<string, PouchDB.Database<{ timestamp: number }>>(
        config.dbs.viewModels.map(v => [v[0], new PouchDB(v[1], authOptions)]));

new App(new PouchDB(config.dbs.events, authOptions),
        viewmodelDbs,
        new PouchDB(config.dbs.accounts, authOptions),
        config.viewmodelUpdateTimeout).listen(config.port);