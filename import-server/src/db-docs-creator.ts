/**
 * Скрипт для создания и обновления сопутствующих таблиц:
 *  - effects
 *  - events
 *  
 *  которые не обновляются при импорте таблиц 
 */

import { Observable, BehaviorSubject } from 'rxjs/Rx';

import * as moment from "moment";
import * as PouchDB from 'pouchdb';
import * as winston from 'winston';
import * as arrayUnique from 'array-unique';
import * as clones from 'clones';
import { config } from './config';

import { saveObject } from './helpers'

let effects = require('./catalogs-data/effects.json');
let events = require('./catalogs-data/events.json');
let conditions = require('./catalogs-data/conditions.json');


function saveDatabaseObjects( catalog: string, data: any[] ): Promise<any>{
    const ajaxOpts = {
            auth:{
                username: config.username,
                password: config.password
            }
    };

    if(!config.catalogs[catalog]){
        return Promise.reject(`Unknown catalog ${catalog}!`)
    }

    let db = new PouchDB(`${config.url}${config.catalogs[catalog]}`, ajaxOpts);

    winston.info(`   `);
    winston.info(`Start saving data to ${catalog} = ${config.catalogs[catalog]}`);

    return Observable.from(data)
                .map( doc => {
                    let d = clones(doc);
                    d._id = d.id;
                    delete d.id;
                    return d;
                })
                .flatMap( doc => saveObject(db, doc) )
                .do( res => winston.info(`Saved document: ${JSON.stringify(res)}`) )
                .toArray()
                .toPromise();
}

async function saveDocs(){
    if(effects && effects.effects){
        await saveDatabaseObjects("effects", effects.effects)
                .catch( (err) => winston.error(`Problem in import: ${err}`));
    }

    if(events && events.events){
        await saveDatabaseObjects("events", events.events)
                .catch( (err) => winston.error(`Problem in import: ${err}`));
    }

    if(conditions && conditions.conditions){
        await saveDatabaseObjects("condition", conditions.conditions)
                .catch( (err) => winston.error(`Problem in import: ${err}`));
    }


    process.exit(0);
}

configureLogger();
saveDocs();


function configureLogger(){
    winston.add(winston.transports.File, { 
                filename: config.supportLogFileName,
                level: 'debug',
                json: false
            });

    winston.handleExceptions(new winston.transports.File({
                 filename: 'path/to/exceptions.log',
                handleExceptions: true,
                humanReadableUnhandledException: true,
                level: 'debug',
                json: false
            }));
}