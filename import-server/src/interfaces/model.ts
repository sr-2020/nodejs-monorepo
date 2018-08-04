import { DeusModifier } from './modifier';
import { DeusCondition } from './condition';

// export interface IDeusModel {
//         _id: string,
//         _rev?: string,
//         memory?: Array<any>,
//         firstName: string,
//         lastName:  string,
//         skills?: Array<any>,
//         sex: string,
//         corporation?: string,
//         hp: number,
//         maxHp: number,
//         mind: any,
//         timestamp: number,
//         conditions: Array<DeusCondition>,
//         modifiers: Array<DeusModifier>,
//         age: number,
//         timers: Array<any>
// };

export interface MindData {
    [index: string]: number[];
}

export interface ChangesElement {
    mID: string,
    text: string,
    timestamp: string
}

export interface Message {
    mID: string,
    title: string,
    text: string
}

export interface ISystem {
    value: number, 
    nucleotide: number,
    lastModified: number,
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
}

export class DeusModel{
    _id: string;        //id в БД == JoinRPG ID
    _rev: string;       //rev в БД техническое  
    mail: string;       //loging@alice.digital
    login: string;      //login
    firstName: string;      //имя
    nicName?: string;       //ник-нейм
    lastName?:  string;     //фамилия
    planet?: string;  //Родная локация
    isAlive: boolean = true;  //Если false = персонаж мертв
    inGame: boolean = false; //Если true - персонаж в игре, и обновлять при импорте эту модель нельзя

    profileType: string = "human";

    sex?: string;            //пол
    systems: Array<ISystem>;

    professions: Professions;

//Техническое
    validateErrors?: string[];      //Ошибки валидации (если не пустое, в БД модель не пишутся)
    skills?: Array<any>;            //если бует использоваться
    timestamp: number = 0;          //дата обновление модели
    conditions: Array<DeusCondition> = [];     //состояния
    modifiers: Array<DeusModifier> = [];       //модификаторы (импланты\болезни)
    timers: Array<any> = [];      //таймеры в модели
    changes: ChangesElement[] = [];  //Изменения в модели
    messages: Message[] = [];   //Сообщения игроку
}
