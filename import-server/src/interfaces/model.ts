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

export interface MemoryElement {
    title: string,
    text?: string,
    url?: string,
    mID?: string,
}

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

export class DeusModel{
    _id: string;        //id в БД == JoinRPG ID
    _rev: string;       //rev в БД техническое  
    mail: string;       //loging@alice.digital
    login: string;      //login
    profileType: string;    //Тип профиля (human/robot/program)
    firstName: string;      //имя
    nicName?: string;       //ник-нейм
    lastName?:  string;     //фамилия
    sweethome?: string;  //Родная локация
    hp: number;         //количество хитов
    maxHp: number;      //макстмальное количество хитов персонажа
    maxSecondsInVr: number;  //Максимальное время в VR
    isAlive: boolean = true;  //Если false = персонаж мертв
    inGame: boolean = false; //Если true - персонаж в игре, и обновлять при импорте эту модель нельзя

//Только для типа профиля "human"
    sex?: string;            //пол
    generation?: string;     //Поколение (A / W / Z / X/Y)
    corporation?: string;    //Место работы
    corporationId?: string;    //Место работы (ID компании для экономики)
    salaryLevel?: number;    //Уровень зарплаты
    corporationAdmin?: boolean; //Является администратором места работы (для экономики)
    insurance: string;      //кто выдал страховку (формат для внешних систем)
    insuranceDiplayName?: string; //Название того кто выдал страховку для отображения
    insuranceLevel?: number;      //Уровень страховки (1-4)
    genome?: number[];       //Геном массив из 13 значений
    memory: Array<MemoryElement> = [];  //Воспоминания
    hackingLogin?: string;           //логин хакеров
    hackingProtection?: number;      //Уровень защиты от хакеров
    mind?: MindData;                  //кубики сознания
    systems?: number[];         //физиологические системы организма

//Only android or programm
    owner?: string;          //Владелец андроида/программы
    creator?: string;       //Создатель андроида/программы
    model?: string;      //Модель андроида или программа
    firmware?: string;   //Прошивка андроида. Временное. 

//Хакеры
    lockReduction?: number;
    proxyRegen?: number;
    maxProxy?: number;

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
