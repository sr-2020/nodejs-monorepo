import { Observable } from "rxjs/Rx";
import * as PouchDB from "pouchdb";
import * as winston from "winston";
import * as clones from "clones";

import { config } from "./config";
import { JoinCharacterDetail } from "./join-importer";
import { JoinMetadata } from "./join-importer";

import { DeusModel, Professions, ICompanyAccess, ICompany } from "./interfaces/model";
import { DeusEvent } from "./interfaces/events";
import { saveObject } from "./helpers";
import { CharacterParser } from "./character-parser";


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

    public conversionProblems: string[] = [];

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
            winston.warn(`Character(${this.character.characterId}) not converted. Reasons: ${this.conversionProblems.join("; ")}`);
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
            .filter(([, o]: [DeusModel, DeusModel | null]) => {
                if (o && o.inGame) {
                    winston.info(`Character model ${this.model._id} already in game!`);
                    return false;
                }
                return true;
            })

            .map(([thisM,]) => thisM)

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

            .map(() => results)
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
            this.convertModelImpl();
        } catch (e) {
            this.conversionProblems.push("Error in converting model" + e);
        }

        if (this.conversionProblems.length > 0)
        {
            this.model._id = "";
        }
    }

    private convertModelImpl() {
        if (!this.character.isActive)
        {
            this.conversionProblems.push("Not active character");
            return;
        }
        winston.info(`Try to convert model id=${this.character.characterId}`);

        this.model = {
            timestamp: Date.now(),
            _id: this.character.characterId.toString(),
            _rev: undefined,
            isAlive: true,
            inGame: this.character.inGame,
            login: this.getLogin(),
            ...this.getFullName(2786),
            professions: this.getProfessions(),
            spaceSuit: this.getSpaceSuit(),
            ...this.getPlanetAndGenome(2787),
            profileType: "human",
            companyAccess: this.getCompanyAccess(),
            ...this.getEmptyModel(),  
        };

        // TODO: Пофиксить this.getPlanetAndGenome (который по каким-то причинам делает systems=[]) и убрать.
        this.setGenome(2787);

        this.account = {
            _id: this.model._id,
            login: this.model.login,
            password: this.character.joinStrFieldValue(3630) || "0000",
        };
    }

    private getEmptyModel() {
        return {
            conditions: [],
            changes: [],
            messages: [],
            modifiers: [],
            systems: [],
            timers: [],
        };
    }

    private getCompanyAccess() {
        const companyAccess = [];
        
        const group = (g) => this.character.partOfGroup(g);
        
        const checkAccess  = (g, companyName) => {
            if (group(g))
            {
                companyAccess.push({companyName: companyName, isTopManager: group(9906)});
            }    
        }

        checkAccess(8492, "gd");
        checkAccess(8495, "pre");
        checkAccess(8497, "kkg");
        checkAccess(8498, "mat");
        checkAccess(8499, "mst");

        return companyAccess;
    }

    private getPlanetAndGenome(planetFieldId: number) {
        // Локация
        if (!this.character.joinStrFieldValue(planetFieldId)) {
            this.conversionProblems.push(`Missing required field homeworld (${planetFieldId})`);
        }
        else {
            const planet = this.character.joinStrFieldValue(planetFieldId);
            const nucleotides = 
            this.character.joinFieldProgrammaticValue(planetFieldId)
            .split(" ", 7)
            .map((sp) => Number.parseInt(sp, 10));

            const systems = [];
            nucleotides.forEach((element, index) => {
                systems[index] = { value: 0, nucleotide: element, lastModified: 0, present: true};
            });

        return {planet, systems};
        }
    }

    private getLogin() {
        // Защита от цифрового логина
        const login =  this.character.joinStrFieldValue(3631) || ("user" + this.character.characterId);

        if (!login.match(/^[\w\#\$\-\*\&\%\.]{3,30}$/i) || login.match(/^\d+$/i)) {
            this.conversionProblems.push(`Incorrect login ${login}`);
        }

        return login;
    }

    private getSpaceSuit() {
        return {
            on: false,
            oxygenCapacity: 0,
            timestampWhenPutOn: 0,
            diseases: [],
        };
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

    private getFullName(fullNameFieldNumber: number) {
        const name = this.character.joinStrFieldValue(fullNameFieldNumber);
        const parts = this.parseFullName(name);
        return { 
            firstName: parts.firstName, 
            nicName: parts.nicName, 
            lastName: parts.lastName 
        };
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
