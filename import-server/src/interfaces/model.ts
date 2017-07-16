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
    url?: string
}

export interface MindData {
    [index: string]: number[];
}

export class DeusModel{
    _id: string;
    _rev: string;
    mail: string;
    login: string;  //Temporary (move to Accounts)
    profileType: string;    //Тип профиля (human/robot/program)
    firstName: string;
    nicName?: string;
    lastName?:  string;
    sweethome?: string;  //Родная локация
    hp: number;
    maxHp: number;

//Only Human
    sex?: string;
    generation?: string;     //Поколение (A / W / Z / X/Y)
    corporation?: string;    //Место работы
    salaryLevel?: number;    //Уровень зарплаты
    insurance?: number;      //кто выдал страховку (Value из Join)
    insuranceDiplayName?: string; //Название того кто выдал страховку для отображения
    insuranceLevel?: number;      //Уровень страховки (1-4)
    genome?: number[];       //Геном массив из 13 значений
    memory: Array<MemoryElement> = [];  //Воспоминания
    hackingLogin?: string;           //логин хакеров  TODO - не сделано
    hackingProtection?: number;      //Уровень защиты от хакеров
    mind: MindData;         //TODO - пока не сделано

//Only android or programm
    owner?: string;          //Владелец андроида/программы (или создатель?)
    model?: string;      //Модель андроида или программа
    firmware?: string;   //Прошивка андроида. Временное. 

    skills?: Array<any>; 
    timestamp: number = 0;
    conditions: Array<DeusCondition> = [];
    modifiers: Array<DeusModifier> = [];
    timers: Array<any> = [];
}
