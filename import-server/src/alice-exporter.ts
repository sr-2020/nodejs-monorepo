import { Observable } from "rxjs/Rx";
import * as moment from "moment";
import * as PouchDB from "pouchdb";
import * as request from "request-promise-native";
import * as chance from "chance";
import * as winston from "winston";
import * as uuid from "uuid/v4";
import * as clones from "clones";

import { ImportStats } from "./stats";
import { config } from "./config";
import { JoinCharacterDetail, JoinData, JoinFieldInfo, JoinFieldMetadata } from "./join-importer";
import { JoinFieldValue, JoinGroupInfo, JoinMetadata } from "./join-importer";

import { DeusModel, MindData, Professions } from "./interfaces/model";
import { DeusModifier } from "./interfaces/modifier";
import { DeusCondition } from "./interfaces/condition";
import { DeusEffect } from "./interfaces/effect";
import { DeusEvent } from "./interfaces/events";
import { mindModelData } from "./mind-model-stub";
import { saveObject } from "./helpers";
import { CharacterParser } from "./character-parser";

const PHYS_SYSTEMS_NUMBER = 6;

interface IAliceAccount {
    _id: string;
    _rev?: string;
    password: string;
    login: string;
}

export interface INameParts {
    firstName: string;
    nicName: string;
    lastName: string;
    fullName: string;
}

export class AliceExporter {

    public model: DeusModel = new DeusModel();
    public account: IAliceAccount = { _id: "", password: "", login: "" };

    private con: any = null;
    private accCon: any = null;
    private eventsCon: any = null;

    private eventsToSend: DeusEvent[] = [];

    private character: CharacterParser;

    constructor(character: JoinCharacterDetail,
                metadata: JoinMetadata,
                public isUpdate: boolean = true,
                public ignoreInGame: boolean = false) {

        const ajaxOpts = {
            auth: {
                username: config.username,
                password: config.password,
            },

            timeout: 6000 * 1000,
        };

        this.con = new PouchDB(`${config.url}${config.modelDBName}`, ajaxOpts);
        this.accCon = new PouchDB(`${config.url}${config.accountDBName}`, ajaxOpts);
        this.eventsCon = new PouchDB(`${config.url}${config.eventsDBName}`, ajaxOpts);

        this.character = new CharacterParser(character, metadata);

        this.createModel();
    }

    public export(): Promise<any> {

        if (!this.model._id) {
            winston.warn(`AliceExporter.export(): ${this.character.characterId} problem in conversion!`);
            return Promise.resolve();
        }

        winston.info(`Will export converted Character(${this.model._id})`);

        const results: any = {
            clearEvents: null,
            account: null,
            model: null,
            saveEvents: null,
        };

        const refreshEvent = {
            characterId: this.model._id,
            eventType: "_RefreshModel",
            timestamp: this.model.timestamp + 100,
            data: {},
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

        if (this.ignoreInGame) {
            winston.info(`Ovveride inGame flag for id=${this.model._id}`);
            oldModel = Observable.of(null);
        }

        const thisModel = Observable.of(this.model);

        return Observable.zip(thisModel, oldModel, (a, b) => [a, b])
            // ===== Проверка InGame для для случая обновления ==============================
            .filter(([t, o]: [DeusModel, DeusModel | null]) => {
                if (o && o.inGame) {
                    winston.info(`Character model ${this.model._id} already in game!`);
                    return false;
                }
                return true;
            })

            .map(([thisM, old]) => thisM)

            .flatMap(() => this.clearEvents())
            .do((result) => results.clearEvents = result.length)

            .flatMap(() => saveObject(this.con, this.model, this.isUpdate))
            .do((result) => results.model = result.ok ? "ok" : "error")

            .flatMap(() =>
                this.eventsToSend.length ? this.eventsCon.bulkDocs(this.eventsToSend) : Observable.from([[]]))
            .do((result: any) => results.saveEvents = result.length)

            .flatMap(() => {
                if (this.account.login && this.account.password) {
                    return saveObject(this.accCon, this.account, this.isUpdate);
                } else {
                    winston.warn(`Cannot provide account for Character(${this.model._id})`, this.account);
                    return Promise.resolve(false);
                }
            })
            .do((result) => results.account = result.ok ? "ok" : "error")

            .map((result) => results)
            .toPromise();

    }

    /**
     * Очистка очереди события для данного персонажа (если они были)
     */
    public clearEvents(): Observable<any> {
        const selector = {
            selector: { characterId: this.model._id },
            limit: 10000,
        };

        return Observable.from(this.eventsCon.find(selector))
            .flatMap((result: any) => {
                return this.eventsCon.bulkDocs(
                    result.docs.map((x) => {
                        const x2 = clones(x);
                        x2._deleted = true;
                        return x2;
                    }),
                );
            });
    }

    private createModel() {
        try {
            winston.info(`Try to convert model id=${this.character.characterId}`);

            this.model.timestamp = Date.now();

            // ID Alice. CharacterId
            this.model._id = this.character.characterId.toString();

            // Персонаж жив
            this.model.isAlive = true;

            // Состояние "в игре"
            this.model.inGame = this.character.inGame;

            // Login (e-mail).
            // Защита от цифрового логина
            this.model.login =  this.character.joinStrFieldValue(3631) || ("user" + this.model._id);

            if (!this.model.login.match(/^[\w\#\$\-\*\&\%\.]{4,30}$/i) || this.model.login.match(/^\d+$/i)) {
                winston.warn(`can't convert id=${this.character.characterId} incorrect login=\"${this.model.login}\"`);
                this.model.login = "";
            }

            this.model.mail = this.model.login + "@alice.digital";

            // Установить имя песрнажа.
            this.setFullName(2786);

            if (!this.character.joinStrFieldValue(2787)) {
                // Prevent to import
                winston.info(`Character(${this.character.characterId}) hasn't been filled fully and skipped.`);
                this.model._id = "";
                return;
            }

            // Локация
            this.model.planet = this.character.joinStrFieldValue(2787);

            this.setGenome(2787);

            this.model.professions = this.getProfessions();

            // Заглушка для скафандра, должна быть в каждой модели
            this.model.spaceSuit = {
                on: false,
                oxygenCapacity: 0,
                timestampWhenPutOn: 0,
                diseases: [],
            };

            this.account = {
                _id: this.model._id,
                login: this.model.login,
                password: this.character.joinStrFieldValue(3630) || "0000",
            };

        } catch (e) {
            winston.info(`Error in converting model id=${this.character.characterId}: ` + e);
            this.model._id = "";
        }
    }

    // Создает значение поля Геном для модели.
    private setGenome(fieldID: number) {
        const nucleotides =
            this.character.joinFieldProgrammaticValue(fieldID)
            .split(" ", 7)
            .map((sp) => Number.parseInt(sp, 10));

        this.model.systems = [];
        nucleotides.forEach((element, index) => {
            this.model.systems[index] = { value: 0, nucleotide: element, lastModified: 0, present: true};
        });
    }

    private getProfessions(): Professions {
        const field = (f) => this.character.hasFieldValue(3438, f);

        const group = (g) => this.character.partOfGroup(g);

        return {
            isBiologist: group(8489) || field(3448),
            isCommunications: group(8486) || field(3445),
            isEngineer: group(8488) || field(3447),
            isIdelogist: group(8556),
            isJournalist: field(3450),
            isNavigator: group(8446) || field(3444),
            isPilot: group(8445) || field(3443),
            isPlanetolog: group(3449) || field(3449),
            isSecurity: group(9907),
            isSupercargo: group(8487) || field(3446),
            isTopManager: group(9906),
            isManager: group(8491),
        };
    }

    private setFullName(fullNameFieldNumber: number) {
        const name = this.character.joinStrFieldValue(fullNameFieldNumber);
        const nameParts: INameParts = this.parseFullName(name);

        this.model.firstName = nameParts.firstName;
        this.model.nicName = nameParts.nicName;
        this.model.lastName = nameParts.lastName;
    }

    // Установить имя песрнажа.
    private parseFullName(name: string): INameParts {
        const ret: INameParts = {
            firstName: "",
            nicName: "",
            lastName: "",
            fullName: name,
        };

        let parts = name.match(/^(.*?)\s\"(.*?)\"\s(.*)$/i);

        // Формат имени Имя "Ник" Фамилия
        if (parts) {
            ret.firstName = parts[1];
            ret.nicName = parts[2];
            ret.lastName = parts[3];
            return ret;
        }

        // Формат имени Имя "Ник"
        parts = name.match(/^(.*?)\s\"(.*?)\"\s*$/i);

        if (parts) {
            ret.firstName = parts[1];
            ret.nicName = parts[2];
            ret.lastName = "";
            return ret;
        }

        // Формат имени Имя Фамилия
        parts = name.match(/^(.*?)\s(.*)$/i);

        if (parts) {
            ret.firstName = parts[1];
            ret.lastName = parts[2];
            ret.nicName = "";
            return ret;
        }

        // Формат имени - только имя
        ret.firstName = name;
        ret.nicName = "";
        ret.lastName = "";

        return ret;
    }
}
