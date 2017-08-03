import { Observable } from 'rxjs/Rx';
import * as moment from "moment";
import * as PouchDB from 'pouchdb';
import * as request from 'request-promise-native';
import * as winston from 'winston';


import { ImportStats, ImportRunStats } from './stats';
import { config } from './config';
import { JoinCharacterDetail, JoinData, JoinFieldInfo, JoinFieldMetadata, JoinFieldValue,
         JoinGroupInfo, JoinMetadata, JoinImporter, JoinCharacter } from './join-importer'

/**
 * Класс для блокировки или удаления некорректных моделей в БД 
 * 
 */

export class DBModelsProcessor {
    private dbcon:any = null;

    constructor(){
        const ajaxOpts = {
            auth: {
                username: config.username,
                password: config.password
            }
        };

        this.dbcon = new PouchDB(`${config.url}${config.modelDBName}`, ajaxOpts);
    }

    //public processAll( f : (model: ) )

}