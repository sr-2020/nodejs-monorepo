import { Observable } from 'rxjs/Rx';
import * as moment from "moment";
import * as request from 'request-promise-native';
import * as winston from 'winston';

import { config } from './config';
import { JoinCharacterDetail, JoinData, JoinFieldInfo, JoinFieldMetadata, JoinFieldValue, JoinGroupInfo, JoinMetadata } from './join-importer'
import { DeusModel, MemoryElement, MindData } from './interfaces/model';
import { AliceExporter } from './alice-exporter';

interface MailboxData {
    id: string,
    login: string,
    password: string,
    fullName: string,
    firstName: string,
    lastName: string
}

export class MailProvision {
    private eventsCon:any = null;

    constructor() {
    }

    //Послать запрос на создание e-mail'ов
    createEmails(chars: JoinCharacterDetail[]): Promise<any>{

        let usersList: MailboxData[] = chars.map( c => { 
                let nameParts = AliceExporter.parseFullName(AliceExporter.joinStrFieldValue(c, 496)); 
                return {
                    id : c._id,
                    login: AliceExporter.joinStrFieldValue(c, 1905).split("@")[0],
                    password: AliceExporter.joinStrFieldValue(c, 2039),
                    fullName: nameParts.fullName,
                    firstName: nameParts.firstName,
                    lastName: nameParts.lastName
                }
        }).filter( u => u.login && u.password );

        let reqOpts:any = {
            url: config.mailServerAPIUrl,
            method : "POST",
            body: { users : usersList },
            timeout: config.requestTimeout,
            json : true
        }

        return request(reqOpts);
        //return Promise.resolve('{ "type": "moke" }');
    }
}