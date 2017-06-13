import App from './app'
import * as PouchDB from 'pouchdb';

new App(new PouchDB('http://localhost:5984/events-dev2'),
        new PouchDB('http://localhost:5984/view-models-dev2'),
        15000).listen(8157);