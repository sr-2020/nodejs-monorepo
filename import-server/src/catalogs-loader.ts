import { Observable } from 'rxjs/Rx';
import * as moment from "moment";
import * as PouchDB from 'pouchdb';
import * as request from 'request-promise-native';

import { config } from './config';


export class CatalogsLoader {

    public catalogs:any = {}

    constructor() {}

    public async load(){

        for(let alias in config.catalogs){
            let db = new PouchDB(`${config.url}${config.catalogs[alias]}`);
            let docs = await db.allDocs( {include_docs: true} );

            this.catalogs[alias] = docs.rows;
        }
    }   

    findElement( catalogName: string, id: string ): any {
        if(this.catalogs[catalogName]){
            return this.catalogs[catalogName].find( e => e._id==id )
        }

        return undefined ;
    }

}