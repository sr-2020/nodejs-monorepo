import * as moment from "moment";
import * as request from 'request-promise-native';

import { ImportStats } from './stats';
import { config } from './config';

interface JoinCharacter{
    CharacterId : number,
    UpdatedAt: string,
    IsActive: boolean,
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
    Fields : JoinFieldMetadata[]
}

export interface JoinData {
    characters: JoinCharacterDetail[],
    metadata: JoinMetadata
}

export async function loadJoinRPGData(lastRequestTime:any = null): Promise<JoinData> {
    console.log( "Start loadJoinRPGData" );
    
    //Get token
    let reqOpts:any = {
        url: config.joinTokenUrl,
        method : "POST",
        form: {
            grant_type: "password",
            username: config.joinLogin,
            password: config.joinPassword
        },
        timeout: 30000,
        json : true
    }

    const access_token = (await request(reqOpts)).access_token;
    console.log(`Received access token!`);  


    //Get characters list
    reqOpts = {
        url: config.joinListUrl,
        method : "GET",
        auth : {
            bearer : access_token
        },
        timeout: 30000,
        json : true
    };

    let charList:JoinCharacter[] = await request(reqOpts);
    
    console.log(`Received character list: ${charList.length} characters`);  

    //TODO: remove in prod
    //charList = [ charList[0], charList[1], charList[2], charList[3] ];

    //Get Characters details
    let characters: JoinCharacterDetail[] = [];

    let pooledReq = request.defaults({ 
            pool: { maxSockets: 50 },
            timeout: 30000,
            json : true,
            auth : { bearer : access_token },
            method : "GET"
        });

    let MAX_CONNECTIONS = 20;
    let awaitArray: Promise<any>[] = [];

    for(let c of charList){

        if(awaitArray.length == MAX_CONNECTIONS){
            console.log(`Wait for connetions...`);  
            await Promise.all(awaitArray);
            awaitArray = [];
        }

        reqOpts = {
            url: config.joinBaseUrl + c.CharacterLink,
        };

        console.log(`Try to import character id: ${c.CharacterId}`);
        awaitArray.push(
            pooledReq(reqOpts).then( (character:JoinCharacterDetail) =>{
                                        console.log(`Imported character: ${character.CharacterId}`); 
                                        characters.push(character);
                                    }
                                )
        )
    }

    //Get metadata
     //Get characters list
    reqOpts = {
        url: config.joinMetaUrl,
        method : "GET",
        auth : {
            bearer : access_token
        },
        timeout: 30000,
        json : true
    };

    let metadata:JoinMetadata = await request(reqOpts);

    //console.log(JSON.stringify(metadata,null,4));
    
    console.log( "Finish loadJoinRPGData" );

    return { characters: characters, metadata: metadata };
}