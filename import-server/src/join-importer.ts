import * as moment from "moment";
import * as request from 'request-promise-native';
import * as winston from 'winston';

import { ImportStats } from './stats';
import { config } from './config';

export interface JoinCharacter{
    CharacterId : number,
    UpdatedAt?: string,
    IsActive?: boolean,
    CharacterLink: string
}

export interface JoinGroupInfo {
    CharacterGroupId: number,
    CharacterGroupName: string
}

export interface JoinFieldInfo{
    ProjectFieldId: number,
    FieldName?: string,
    Value: string,
    DisplayString: string
}

export interface JoinCharacterDetail{
    CharacterId : number,
    UpdatedAt: string,
    IsActive: boolean,
    InGame: boolean,
    BusyStatus: string,
    Groups: JoinGroupInfo[],
    Fields : JoinFieldInfo[],
    PlayerUserId: string,
    _id?: string,
    _rev?: string
}

export interface JoinFieldValue{
    ProjectFieldVariantId: number,
    Label: string,
    IsActive: boolean
}

export interface JoinFieldMetadata{
    FieldName: string,
    ProjectFieldId: number,
    IsActive: boolean,
    FieldType: string,
    ValueList: JoinFieldValue[]
}

export interface JoinMetadata{
    ProjectId: number,
	ProjectName: string,
    Fields : JoinFieldMetadata[],
    _id?: string,
    _rev?: string
}

export interface JoinData {
    characters: JoinCharacterDetail[],
    metadata: JoinMetadata
}

export class JoinImporter {

    public access_token = "";

    public metadata: JoinMetadata;

    constructor() {}

    init():Promise<boolean> {
         //Get token
        let reqOpts:any = {
            url: config.joinTokenUrl,
            method : "POST",
            form: {
                grant_type: "password",
                username: config.joinLogin,
                password: config.joinPassword
            },
            timeout: config.requestTimeout,
            json : true
        }

        return request(reqOpts).then( (result:any) => {
            console.log(`Received access token!`);
            this.access_token = result.access_token;
            return true;
        });
    }

    static createJoinCharacter(id: number):JoinCharacter {
        return {
            CharacterId: id,
            CharacterLink: `${config.joinCharactersBasePath}/${id}/`
        };
    }

    //modifiedSince=2017-07-01
    getCharacterList(modifiedSince: moment.Moment ):Promise<JoinCharacter[]> {
        let reqOpts = {
            url: config.joinListUrl,
            qs : {
                modifiedSince: modifiedSince.format("YYYY-MM-DD") + "T" +  modifiedSince.format("HH:mm:00.000")
            },
            method : "GET",
            auth : {
                bearer : this.access_token
            },
            timeout: config.requestTimeout,
            json : true
        };
        return request(reqOpts);
    }

    getCharacter(CharacterLink:string):Promise<JoinCharacterDetail> {
        let reqOpts = {
            url: config.joinBaseUrl + CharacterLink,
            method : "GET",
            auth : {
                bearer : this.access_token
            },
            timeout: config.requestTimeout,
            json : true
        };

        return request(reqOpts);
    }

    getCharacterByID(id:string):Promise<JoinCharacterDetail> {
        let url = `${config.joinCharactersBasePath}/${id}/`;
        return this.getCharacter(url);
    }

    getMetadata():Promise<JoinMetadata> {
         let reqOpts = {
            url: config.joinMetaUrl,
            method : "GET",
            auth : {
                bearer : this.access_token
            },
            timeout: config.requestTimeout,
            json : true
        };

        return request(reqOpts).then( (m:JoinMetadata) => {
            this.metadata = m;
            return m;
        });
    }

}