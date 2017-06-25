import App from './app'
import * as PouchDB from 'pouchdb';
import { TSMap } from "typescript-map";


const viewmodelDbs = new TSMap<string, PouchDB.Database<{ timestamp: number }>>([
        ['mobile', new PouchDB('http://localhost:5984/view-models-dev2')],
        ['default', new PouchDB('http://localhost:5984/accounts-dev2')]
]);

new App(new PouchDB('http://localhost:5984/events-dev2'),
        viewmodelDbs,
        new PouchDB('http://localhost:5984/accounts-dev2'),
        15000).listen(8157);