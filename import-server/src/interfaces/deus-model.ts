import { System } from "./model";
import { DeusCondition } from "./condition";
import { DeusModifier } from "./modifier";

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
    public login: string;      // login
    public firstName: string;      // имя
    public nicName?: string;       // ник-нейм
    public lastName?: string;     // фамилия
    public planet?: string;  // Родная локация
    public isAlive: boolean = true;  // Если false = персонаж мертв
    public inGame: boolean = false; // Если true - персонаж в игре, и обновлять при импорте эту модель нельзя

    public profileType: string = "human";

    public systems: System[];

    public spaceSuit: SpaceSuit;

// Техническое
    public timestamp: number = 0;          // дата обновление модели
    public conditions: DeusCondition[] = [];     // состояния
    public modifiers: DeusModifier[] = [];       // модификаторы (импланты\болезни)
    public timers: any[] = [];      // таймеры в модели
    public changes: ChangesElement[] = [];  // Изменения в модели
    public messages: Message[] = [];   // Сообщения игроку
}