import { Observable } from 'rxjs/Rx';
import * as moment from "moment";
import * as PouchDB from 'pouchdb';
//import * as pouchdbAuth from 'pouchdb-authentication';
import * as request from 'request-promise-native';
import * as winston from 'winston';


import { ImportStats, ImportRunStats } from './stats';
import { config } from './config';
import { JoinCharacterDetail, JoinData, JoinFieldInfo, JoinFieldMetadata, JoinFieldValue,
         JoinGroupInfo, JoinMetadata, JoinImporter, JoinCharacter } from './join-importer'



export class TempDbWriter {

    private con:any = null;

    private exceptionIds = ["JoinMetadata", "lastImportStats"];

    constructor() {
        //PouchDB.plugin(pouchdbAuth);
        const ajaxOpts = {
                auth:{
                    username: config.username,
                    password: config.password
                }
        };

        this.con = new PouchDB(`${config.url}${config.tempDbName}`, ajaxOpts);
    }
    
    setFieldsNames(c: JoinCharacterDetail, metadata: JoinMetadata): JoinCharacterDetail{
        c.Fields.forEach( (f) => {
            let fmeta = metadata.Fields.find( v => v.ProjectFieldId == f.ProjectFieldId );
            f.FieldName = fmeta ? fmeta.FieldName : "";
        } );

        return c;
    }

    saveCharacter( c: JoinCharacterDetail ): Promise<any>{
        c._id = c.CharacterId.toString();
        
        return this.con.get(c._id)
                        .then( (oldc:JoinCharacterDetail) =>{ 
                            c._rev = oldc._rev;
                            return this.con.put(c);
                        })
                        .catch( () => this.con.put(c) );
    }

    public lastStatsDocID = "lastImportStats";

    saveLastStats(s:ImportRunStats): Promise<any>{

        let stats:any = {
            _id: this.lastStatsDocID,
            importTime: s.importTime.format("YYYY-MM-DDTHH:mm"),
            imported: s.imported,
            created: s.created,
            updated: s.updated
        };

        return this.con.get(this.lastStatsDocID)
                        .then( (oldc:JoinCharacterDetail) =>{ 
                            stats._rev = oldc._rev;
                            return this.con.put(stats);
                        })
                        .catch( () => this.con.put(stats) );

    }

    getLastStats():Promise<ImportRunStats>{
        return this.con.get(this.lastStatsDocID).then((s:any) => {
            let ret = new ImportRunStats( moment(s.importTime, "YYYY-MM-DDTHH:mm") );
            ret.created = s.created;
            ret.imported = s.imported;
            ret.updated = s.updated;
            return ret;
         })
        .catch( ()=>{
             return (new ImportRunStats( moment([1900,0,1]) ));
         })
    }

    public metadataDocID = "JoinMetadata";

    saveMetadata(s:JoinMetadata): Promise<any>{
        s._id = this.metadataDocID;

        return this.con.get(this.metadataDocID)
                        .then( (oldc:JoinMetadata) =>{ 
                            s._rev = oldc._rev;
                            winston.info("Metadata saved!");
                            return this.con.put(s);
                        })
                        .catch( () => this.con.put(s) );

    }

    getMetadata(): Promise<JoinMetadata | null>{
        return this.con.get(this.metadataDocID)
                        .catch( () => Promise.resolve(null) );

    }

    getCacheCharactersList(): Promise<JoinCharacter[]>{
        return this.con.allDocs().then( (docs) => {
            return docs.rows
            .filter( (doc:any) => !this.exceptionIds.find(e => e == doc.id ) )
            .map( (doc) => JoinImporter.createJoinCharacter(doc.id) );
        })
    }

    getCacheCharacter(id: string): Promise<JoinCharacterDetail>{
        return this.con.get(id);
    }
}