import { Observable } from 'rxjs/Rx';
import * as moment from "moment";
import * as PouchDB from 'pouchdb';
import * as request from 'request-promise-native';
import * as winston from 'winston';

import { config } from './config';


export class CatalogsLoader {

    public catalogs:any = {}

    constructor() {}

    public async load(){

        const ajaxOpts = {
            auth:{
                username: config.username,
                password: config.password
            }
        };

        for(let alias in config.catalogs){
            let db = new PouchDB(`${config.url}${config.catalogs[alias]}`, ajaxOpts);
            let docs = await db.allDocs( {include_docs: true} );

            this.catalogs[alias] = docs.rows.map((row:any) => {
                            let id = row.doc._id;
                            delete row.doc._id;
                            delete row.doc._rev;
                            return  { id, ...row.doc }; 
                        });
        }
    }   

    findElement( catalogName: string, id: string ): any {
        let idl = id.toLowerCase();
        if(this.catalogs[catalogName]){
            return this.catalogs[catalogName].find( e => e.id==idl)
        }

        return undefined ;
    }

}