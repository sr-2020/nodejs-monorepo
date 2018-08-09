import * as request from 'request-promise-native';
import * as winston from 'winston';

import { config } from './config';
import { JoinCharacterDetail, JoinData, JoinFieldInfo, JoinFieldMetadata, JoinFieldValue, JoinGroupInfo, JoinMetadata } from './join-importer'

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

    //TODO accept here Accounts (already parsed) instead of JoinCharacterDetail
    //Послать запрос на создание e-mail'ов
    createEmails(chars: JoinCharacterDetail[]): Promise<any>{

        if (!config.mailServerAPIUrl) {
            winston.info("Mail server is not configured, so skipping email provisoining");
            return Promise.resolve();
        }

        let usersList: MailboxData[] = chars.map( c => { 
                let nameParts = null; //AliceExporter.parseFullName(AliceExporter.joinStrFieldValue(c, 496)); 
                return {
                    id : c._id,
                    login: null, //AliceExporter.joinStrFieldValue(c, 1905).split("@")[0],
                    password: null, //AliceExporter.joinStrFieldValue(c, 2039),
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
    }
}