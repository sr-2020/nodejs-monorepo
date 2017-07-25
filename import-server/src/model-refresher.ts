import { Observable } from 'rxjs/Rx';
import * as moment from "moment";
import * as PouchDB from 'pouchdb';

import { config } from './config';
import { JoinCharacterDetail, JoinData, JoinFieldInfo, JoinFieldMetadata, JoinFieldValue, JoinGroupInfo, JoinMetadata } from './join-importer'


export class ModelRefresher{
    private eventsCon:any = null;

    constructor() {

        const ajaxOpts = {
                auth:{
                    username: config.username,
                    password: config.password
                }
        };

        this.eventsCon = new PouchDB(`${config.url}${config.eventsDBName}`, ajaxOpts);        

    }

    //Послать _Refresh событие для экспортрованной модели, что бы сформировалась Work/ViewModel
    sentRefreshEvent(char: JoinCharacterDetail): Promise<any>{
        let timestamp = Date.now();

        if(char.model && char.model.timestamp){
            timestamp = char.model.timestamp + 1000;
        }

        let event =   {
                characterId: char._id,
                timestamp,
                eventType: "_RefreshModel",
                data: ""
            };

        return this.eventsCon.post(event);
    }
}