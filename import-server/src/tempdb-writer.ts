import { Observable } from 'rxjs/Rx';
import * as moment from "moment";
import * as PouchDB from 'pouchdb';
import * as request from 'request-promise-native';

import { ImportStats } from './stats';
import { config } from './config';
import { JoinCharacterDetail, JoinData, JoinFieldInfo, JoinFieldMetadata, JoinFieldValue, JoinGroupInfo, JoinMetadata } from './join-importer'


export async function tempDbStoreData(characters: JoinCharacterDetail[], metadata: JoinMetadata): Promise<any> {
    console.log( "Start tempDbStoreData" );
    
    let con = new PouchDB(`${config.url}${config.tempDbName}`);

    //Проставить название полей (больше метаданные не нужны)
    characters.forEach( c => setFieldsNames(c, metadata) );

    for(let character of characters){
        character._id = character.CharacterId.toString();

        let oldDoc  = await con.get(character.CharacterId.toString())
                                .catch(()=>{ return null; });

        if(oldDoc){
            character._rev = oldDoc._rev;
            let result = await con.put(character);
            console.log(`Updated object id: ${character.CharacterId}, ` + JSON.stringify(result) );   
        }else{
            let result = await con.put(character);
            console.log(`Created object id: ${character.CharacterId}, ` + JSON.stringify(result) );  
        }
    }

}

function setFieldsNames(c: JoinCharacterDetail, metadata: JoinMetadata){
    c.Fields.forEach( (f) => {
        let fmeta = metadata.Fields.find( v => v.ProjectFieldId == f.ProjectFieldId );
        f.FieldName = fmeta ? fmeta.FieldName : "";
    } );
}