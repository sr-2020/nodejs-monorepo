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
    sentRefreshEvent(id: string): Promise<any>{
        let timestamp:string = Date.now().toString();

        let event =   {
                characterId: id,
                timestamp: timestamp,
                eventType: "_RefreshModel",
                data: ""
            };

        return this.eventsCon.post(event);
    }
}