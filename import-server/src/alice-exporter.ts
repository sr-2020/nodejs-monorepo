import { Observable } from 'rxjs/Rx';
import * as moment from "moment";
import * as PouchDB from 'pouchdb';
import * as request from 'request-promise-native';
import * as chance from 'chance';
import * as winston from 'winston';
import * as uuid from 'uuid/v4';
import * as clones from 'clones';

import { ImportStats, ImportRunStats } from './stats';
import { config } from './config';
import { JoinCharacterDetail, JoinData, JoinFieldInfo, JoinFieldMetadata, JoinFieldValue, JoinGroupInfo, JoinMetadata } from './join-importer'

import { DeusModel, MindData, Professions } from './interfaces/model';
import { DeusModifier } from './interfaces/modifier';
import { DeusCondition } from './interfaces/condition';
import { DeusEffect } from './interfaces/effect';
import { DeusEvent } from './interfaces/events';
import { mindModelData } from './mind-model-stub';
import { CatalogsLoader } from './catalogs-loader';
import { saveObject } from './helpers'
import { CharacterParser } from './character-parser';

const PHYS_SYSTEMS_NUMBER = 6;

interface IAliceAccount {
    _id: string;
    _rev?: string;
    password: string;
    login: string;
}

export interface INameParts {
    firstName: string,
    nicName: string,
    lastName: string,
    fullName: string
};


export class AliceExporter {
    private con: any = null;
    private accCon: any = null;
    private eventsCon: any = null;


    public model: DeusModel = new DeusModel();

    private eventsToSend: DeusEvent[] = [];

    public account: IAliceAccount = { _id: "", password: "", login: "" };

    private characterParsed: CharacterParser;

    constructor(private character: JoinCharacterDetail,
        metadata: JoinMetadata,
        private catalogs: CatalogsLoader,
        public isUpdate: boolean = true,
        public ignoreInGame: boolean = false) {

        const ajaxOpts = {
            auth: {
                username: config.username,
                password: config.password
            },

            timeout: 6000 * 1000,
        };

        this.con = new PouchDB(`${config.url}${config.modelDBName}`, ajaxOpts);
        this.accCon = new PouchDB(`${config.url}${config.accountDBName}`, ajaxOpts);
        this.eventsCon = new PouchDB(`${config.url}${config.eventsDBName}`, ajaxOpts);

        this.characterParsed = new CharacterParser(this.character, metadata);

        this.createModel();
    }

    export(): Promise<any> {
        
        if (!this.model._id) {
            winston.warn(`AliceExporter.export(): ${this.character._id} Incorrect model ID or problem in conversion!`);
            return Promise.resolve();
        }

        winston.info(`Will export converted Character(${this.model._id})`);

        let results: any = {
            clearEvents: null,
            account: null,
            model: null,
            saveEvents: null
        };

        let refreshEvent = {
            characterId: this.model._id,
            eventType: "_RefreshModel",
            timestamp: this.model.timestamp + 100,
            data: {}
        };

        if (this.eventsToSend.length) {
            refreshEvent.timestamp = this.eventsToSend[this.eventsToSend.length - 1].timestamp + 100;
        }

        this.eventsToSend.push(refreshEvent);

        let oldModel = Observable
        .fromPromise(this.con.get(this.model._id))
        .catch((err) => {
            winston.info(`Model doesnt exist`, err);
            return Observable.of(null);
        });

        if(this.ignoreInGame){
            winston.info(`Ovveride inGame flag for id=${this.model._id}`);
            oldModel = Observable.of(null);
        }

        let thisModel = Observable.of(this.model);

        return Observable.zip(thisModel, oldModel, (a, b) => [a, b])
            // ===== Проверка InGame для для случая обновления ==============================
            .filter(([thisModel, oldModel]: [DeusModel, DeusModel | null]) => {
                if (oldModel && oldModel.inGame) {
                    winston.info(`Character model ${this.model._id} already in game!`);
                    return false;
                }
                return true;
            })

            .map(([thisModel, oldModel]) => thisModel)

//            .flatMap(() => this.clearEvents())
//            .do(result => results.clearEvents = result.length)

            .flatMap(() => saveObject(this.con, this.model, this.isUpdate))
            .do(result => results.model = result.ok ? "ok" : "error")

//            .flatMap(() => this.eventsToSend.length ? this.eventsCon.bulkDocs(this.eventsToSend) : Observable.from([[]]))
//            .do((result: any) => results.saveEvents = result.length)

            .flatMap(() => {
                if (this.account.login && this.account.password) {
                    return saveObject(this.accCon, this.account, this.isUpdate) 
                }
                else {
                    winston.warn(`Cannot provide account for Character(${this.model._id})`, this.account)
                    return Promise.resolve(false);
                }
            })
            .do(result => results.account = result.ok ? "ok" : "error")

            .map(result => results)
            .toPromise();

    }

    /**
     * Очистка очереди события для данного персонажа (если они были)
     */
    clearEvents(): Observable<any> {
        let selector = {
            selector: { characterId: this.model._id },
            sort: [{ characterId: "desc" },
            { timestamp: "desc" }],
            limit: 10000
        };

        return Observable.from(this.eventsCon.find(selector))
            .flatMap((result: any) => {
                return this.eventsCon.bulkDocs(
                    result.docs.map((x) => {
                        let x2 = clones(x);
                        x2._deleted = true
                        return x2;
                    })
                );
            })
    }

    private createModel() {
        try {
            winston.info(`Try to convert model id=${this.character.CharacterId}`);

            this.model.timestamp = Date.now();

            //ID Alice. CharacterId
            this.model._id = this.character.CharacterId.toString();
            this.account._id = this.model._id;

            //Персонаж жив
            this.model.isAlive = true;

            //Состояние "в игре"
            this.model.inGame = this.character.InGame;

            //Login (e-mail). 
            //Защита от цифрового логина
            this.model.login =  this.characterParsed.joinStrFieldValue(3631);

            if (this.model.login == "")
            {
                this.model.login = "user" + this.model._id;
            }

            if (!this.model.login.match(/^[\w\#\$\-\*\&\%\.]{4,30}$/i) || this.model.login.match(/^\d+$/i)) {
                winston.warn(`ERROR: can't convert id=${this.character.CharacterId} incorrect login=\"${this.model.login}\"`);
                //this.model._id = "";
                //return;
                this.model.login = "";
            }

            this.account.login = this.model.login;

            if (this.model.login) {
                this.model.mail = this.model.login + "@alice.digital";
            } else {
                this.model.mail = "";
            }

            //Password. 
            this.account.password = this.characterParsed.joinStrFieldValue(3630);

            if (this.account.password == "")
            {
                this.account.password = "0000";
            }

            //Установить имя песрнажа. 
            this.setFullName(2786);
            
            if (!this.characterParsed.joinStrFieldValue(2787)) 
            {
                //Prevent to import
                winston.info(`Character(${this.character.CharacterId}) hasn't been filled fully and skipped.`)
                this.model._id = "";
                return;
            }

            //Локация  
            this.model.planet = this.characterParsed.joinStrFieldValue(2787);

            this.setGenome(2787);

            this.model.professions = this.getProfessions();

            winston.info(`Character(${this.character.CharacterId}) was converted`, this.model, this.account);

        } catch (e) {
            winston.info(`Error in converting model id=${this.character.CharacterId}: ` + e);
            this.model._id = "";
        }
    } 

    //Создает значение поля Геном для модели. 
    setGenome(fieldID: number) {
        const nucleotides = this.characterParsed.joinFieldProgrammaticValue(fieldID).split(" ", 7).map(sp => Number.parseInt(sp));

        this.model.systems = [];
        nucleotides.forEach((element, index) => {
            this.model.systems[index] = { value: 0, nucleotide: element, lastModified: 0};
        });
    }

    getProfessions() : Professions {
        const groupOrField = (group, field) => this.characterParsed.hasFieldValue(3438, field) || this.characterParsed.partOfGroup(group);

        return {
            isBiologist: groupOrField(8489, 3448),
            isCommunications: groupOrField(8486, 3445),
            isEngineer: groupOrField(8488, 3447),
            isIdelogist: groupOrField(8556, -1),
            isJournalist: groupOrField(-1, 3450),
            isNavigator: groupOrField(8446, 3444),
            isPilot: groupOrField(8445, 3443),
            isPlanetolog: groupOrField(8490, 3449),
            isSecurity: groupOrField(9907, -1),
            isSupercargo: groupOrField(8487, 3446),
            isTopManager: groupOrField(9906, -1),
        };
    }

    setFullName(fullNameFieldNumber: number) {
        const name = this.characterParsed.joinStrFieldValue(fullNameFieldNumber);
        let nameParts: INameParts = AliceExporter.parseFullName(name);

        this.model.firstName = nameParts.firstName;
        this.model.nicName = nameParts.nicName;
        this.model.lastName = nameParts.lastName;
    }

    //Установить имя песрнажа. 
    public static parseFullName(name: string): INameParts {
        let ret: INameParts = {
            firstName: "",
            nicName: "",
            lastName: "",
            fullName: name
        };

        let parts = name.match(/^(.*?)\s\"(.*?)\"\s(.*)$/i);

        //Формат имени Имя "Ник" Фамилия
        if (parts) {
            ret.firstName = parts[1];
            ret.nicName = parts[2];
            ret.lastName = parts[3];
            return ret;
        }

        //Формат имени Имя "Ник"
        parts = name.match(/^(.*?)\s\"(.*?)\"\s*$/i);

        if (parts) {
            ret.firstName = parts[1];
            ret.nicName = parts[2];
            ret.lastName = "";
            return ret;
        }

        //Формат имени Имя Фамилия
        parts = name.match(/^(.*?)\s(.*)$/i);

        if (parts) {
            ret.firstName = parts[1];
            ret.lastName = parts[2];
            ret.nicName = "";
            return ret;
        }

        //Формат имени - только имя
        ret.firstName = name;
        ret.nicName = "";
        ret.lastName = "";

        return ret;
    }
}   
