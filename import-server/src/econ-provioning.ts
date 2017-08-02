
import { Observable } from 'rxjs/Rx';
import * as moment from "moment";
import * as request from 'request-promise-native';
import * as winston from 'winston';

import { config } from './config';
import { JoinCharacterDetail, JoinData, JoinFieldInfo, JoinFieldMetadata, JoinFieldValue, JoinGroupInfo, JoinMetadata } from './join-importer'
import { DeusModel, MemoryElement, MindData } from './interfaces/model';
import { AliceExporter } from './alice-exporter';


export class EconomyProvision {

    constructor() { }

    createFullName(model: DeusModel): string {
        let name = "";

        if(model.firstName) { 
            name += model.firstName;
        }

        if(model.lastName){
            name += " " + model.lastName;
        }else if(model.nicName){
            name +=  ` "${model.nicName}"`;
        }

        return name;
    }

    //Послать запрос на регистрацию аккаунтов
    regiterAccount(char: JoinCharacterDetail): Promise<any> {
        
        let password = AliceExporter.joinStrFieldValue(char, 2039);

        console.log(`pass ${password}, ${char.model}`);

        if(char.model.profileType != 'human') {
            return Promise.resolve("Skipping, because not human.");
        }

        if(char.model && char.model.login && password ){
            let accData:any = {
                Login: char.model._id,
                Email: char.model.login,
                Password: password,
                Fullname: this.createFullName(char.model),
            }

            if(char.model.insurance && char.model.insuranceLevel){
                accData.Insurance = char.model.insurance;
                accData.InsuranceLevel = char.model.insuranceLevel;
            }

            if(char.model.corporationId && char.model.salaryLevel){
                accData.Workplace = char.model.corporationId;   
                accData.SalaryLevel = char.model.salaryLevel; 
            }

            if(char.model.corporationAdmin){
                //TODO - добавить передачу галочки о том, что персонаж админ
                accData.IsAdmin = true;
            }

            
            let reqOpts = {
                url: config.economicsApiUrl + "/accounts/register",
                method: "POST",
                body: accData,
                auth: {
                    username : config.economicsLogin,
                    password : config.economicsPassword
                },
                timeout: config.requestTimeout,

                json: true
            };

            //winston.info(`Economy account register: ${JSON.stringify(accData, null, 4)}`);
            
            return request(reqOpts).catch( err => {
                //winston.error(  `Can't register economy account: ${err}!`);
                return `Can't register economy account: ${err}!`;
            })
        }

        //winston.error(`Can't register economy account: no login or password!`);
        return Promise.resolve("Can't register economy account: no login or password");
    }
}