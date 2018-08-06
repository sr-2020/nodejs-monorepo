import { DeusModifier } from "./modifier";
import { DeusCondition } from "./condition";

export interface MindData {
    [index: string]: number[];
}

export interface ChangesElement {
    mID: string;
    text: string;
    timestamp: string;
}

export interface Message {
    mID: string;
    title: string;
    text: string;
}

export interface ISystem {
    value: number;
    nucleotide: number;
    lastModified: number;
    present: boolean;
}

export interface Professions {
    isPilot: boolean;
    isNavigator: boolean;
    isCommunications: boolean;
    isSupercargo: boolean;
    isEngineer: boolean;
    isBiologist: boolean;
    isPlanetolog: boolean;
    isJournalist: boolean;
    isIdelogist: boolean;
    isTopManager: boolean;
    isSecurity: boolean;
    isManager: boolean;
}

export interface SpaceSuit {
    on: boolean;
    oxygenCapacity: number;
    timestampWhenPutOn: number;
    diseases: any[];
}

export class DeusModel {
    // tslint:disable-next-line:variable-name
    public _id: string;        // id в БД == JoinRPG ID
    // tslint:disable-next-line:variable-name
    public _rev: string;       // rev в БД техническое
    public mail: string;       // loging@alice.digital
    public login: string;      // login
    public firstName: string;      // имя
    public nicName?: string;       // ник-нейм
    public lastName?: string;     // фамилия
    public planet?: string;  // Родная локация
    public isAlive: boolean = true;  // Если false = персонаж мертв
    public inGame: boolean = false; // Если true - персонаж в игре, и обновлять при импорте эту модель нельзя

    public profileType: string = "human";

    public sex?: string;            // пол
    public systems: ISystem[];

    public professions: Professions;

    public spacesuit: SpaceSuit;

// Техническое
    public validateErrors?: string[];      // Ошибки валидации (если не пустое, в БД модель не пишутся)
    public timestamp: number = 0;          // дата обновление модели
    public conditions: DeusCondition[] = [];     // состояния
    public modifiers: DeusModifier[] = [];       // модификаторы (импланты\болезни)
    public timers: any[] = [];      // таймеры в модели
    public changes: ChangesElement[] = [];  // Изменения в модели
    public messages: Message[] = [];   // Сообщения игроку
}
