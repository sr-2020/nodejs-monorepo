import { CharacterParser } from "./character-parser";
import { DeusModel } from "./interfaces/deus-model";
import { AliceAccount } from "./interfaces/alice-account";

import * as winston from "winston";
import { INameParts } from "./alice-exporter";
import { Professions, TradeUnions, Company } from "./interfaces/model";

export interface ConversionResults {
    problems: string[];
    model: DeusModel;
    account: AliceAccount;
}

export function convertAliceModel (character: CharacterParser): ConversionResults {
    const converter = new AliceModelConverter(character);
    return converter.convert();
}

class AliceModelConverter {
    public conversionProblems: string[] = [];
    constructor(
        private character: CharacterParser,
    ) {

    }

    public convert() : ConversionResults {
        try {
            const result = this.convertModelImpl();
            return {
                problems: this.conversionProblems,
                ...result,
            };
        } catch (e) {
            this.conversionProblems.push("Error in converting model " + e);
        }

        if (this.conversionProblems.length > 0)
        {
            return {model: undefined, account: undefined, problems:  this.conversionProblems};
        }
    }

    private convertModelImpl () {
        if (!this.character.isActive)
        {
            this.conversionProblems.push("Not active character");
            return;
        }
        winston.info(`Try to convert model id=${this.character.characterId}`);

        const model: DeusModel = {
            ...this.getEmptyModel(),
            timestamp: Date.now(),
            _id: this.character.characterId.toString(),
            isAlive: true,
            inGame: this.character.inGame,
            login: this.getLogin(),
            ...this.getFullName(2786),
            spaceSuit: this.getSpaceSuit(),
            ...this.getPlanetAndGenome(2787),
            profileType: "human",
            isTopManager: this.getCompanyAccess().some((company) => company.isTopManager),
        };

        const account : AliceAccount = {
            _id: model._id,
            login: model.login,
            password: this.character.joinStrFieldValue(3630) || "0000",
            professions: this.getProfessions(),
            companyAccess: this.getCompanyAccess(),
            jobs: {
                tradeUnion: this.getTradeUnionMembership(),
                companyBonus: this.getCompanies(),
            }
        };

        return {model, account};
    }

    private getEmptyModel() {
        return {
            conditions: [],
            changes: [],
            messages: [],
            modifiers: [],
            timers: [],
            _rev: undefined,
        };
    }

    private getCompanies() {
        const companies : Company[] = [];

        const checkAccess  = (g, companyName) => {
            if (this.character.partOfGroup(g))
            {
                companies.push(companyName);
            }    
        }

        checkAccess(8492, "gd");
        checkAccess(8495, "pre");
        checkAccess(8497, "kkg");
        checkAccess(8498, "mat");
        checkAccess(8499, "mst");

        return companies;

    }

    private getCompanyAccess() {
        return this.getCompanies().map(
            company => {
                return {companyName: company, isTopManager: this.character.partOfGroup(9906)};
            }
        )
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

    private getTradeUnionMembership(): TradeUnions {
        const field = (f) => this.character.hasFieldValue(3438, f);

        const group = (g) => this.character.partOfGroup(g);

        return {
            isBiologist: group(8489) || field(3448),
            isCommunications: group(8486) || field(3445),
            isEngineer: group(8488) || field(3447),
            isNavigator: group(8446) || field(3444),
            isPilot: group(8445) || field(3443),
            isPlanetolog: group(3449) || field(3449),
            isSupercargo: group(8487) || field(3446),
        };
    }

    private getProfessions(): Professions {
        const field = (f) => this.character.hasFieldValue(3438, f);

        const group = (g) => this.character.partOfGroup(g);

        return {
            ...this.getTradeUnionMembership(),
            isIdelogist: group(8556),
            isJournalist: field(3450),
            isSecurity: group(9907),
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