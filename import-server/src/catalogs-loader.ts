import { Observable } from 'rxjs/Rx';
import * as moment from "moment";
import * as PouchDB from 'pouchdb';
import * as request from 'request-promise-native';
import * as winston from 'winston';
import * as clones from 'clones';
import * as ignoreCase from 'ignore-case';


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
                            let doc = clones(row.doc);
                            doc.id = doc._id;
                            delete doc._id;
                            delete doc._rev;
                            return  doc; 
                        });
        }
    }   

    findElement( catalogName: string, id: string ): any {
        //console.log(`findElements: ${catalogName}  ${id}`);
        //if(catalogName == "effects") { console.log( this.catalogs[catalogName].map(e => e.id).join(","))  };
        if(this.catalogs[catalogName]){
            return this.catalogs[catalogName].find( e => ignoreCase.equals(e.id, id) );
        }

        return undefined ;
    }

}