import { Observable } from 'rxjs/Rx';
import * as moment from "moment";
import * as PouchDB from 'pouchdb';
import * as request from 'request-promise-native';

import { ImportStats, ImportRunStats } from './stats';
import { config } from './config';
import { JoinCharacterDetail, JoinData, JoinFieldInfo, JoinFieldMetadata, JoinFieldValue, JoinGroupInfo, JoinMetadata } from './join-importer'



export class TempDbWriter {

   private con:any = null;

    constructor() {
        this.con = new PouchDB(`${config.url}${config.tempDbName}`);
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
            importTime: s.importTime.format("x"),
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
            let ret = new ImportRunStats( moment(s.importTime, "x") );
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
                            return this.con.put(s);
                        })
                        .catch( () => this.con.put(s) );

    }

    getMetadata(): Promise<JoinMetadata | null>{
        return this.con.get(this.metadataDocID)
                        .catch( () => Promise.resolve(null) );

    }
}