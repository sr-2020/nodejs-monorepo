import App from './app'
import * as PouchDB from 'pouchdb';

new App(new PouchDB('http://localhost:5984/events'),
        new PouchDB('http://localhost:5984/viewmodel'),
        15000).listen(8157);