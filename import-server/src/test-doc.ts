import { Observable } from 'rxjs/Rx';
import * as moment from "moment";
import * as PouchDB from 'pouchdb';
import * as request from 'request-promise-native';
import * as winston from 'winston';


import { ImportStats, ImportRunStats } from './stats';
import { config } from './config';
import { JoinCharacterDetail, JoinData, JoinFieldInfo, JoinFieldMetadata, JoinFieldValue, JoinGroupInfo, JoinMetadata } from './join-importer'

let con = new PouchDB(`${config.url}${config.tempDbName}`);

con.get("10244").then( (doc) => {
     console.log(JSON.stringify(doc));
})
.catch( (e) => {
    console.log("error: " + JSON.stringify(e));
});