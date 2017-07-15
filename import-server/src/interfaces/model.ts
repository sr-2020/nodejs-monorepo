import { DeusModifier } from './modifier';
import { DeusCondition } from './condition';

export interface IDeusModel {
        _id: string,
        _rev?: string,
        memory?: Array<any>,
        firstName: string,
        lastName:  string,
        skills?: Array<any>,
        sex: string,
        corporation?: string,
        hp: number,
        maxHp: number,
        mind: any,
        timestamp: number,
        conditions: Array<DeusCondition>,
        modifiers: Array<DeusModifier>,
        age: number,
        timers: Array<any>
};

export interface MemoryElement {
    title: string,
    text?: string,
    url?: string
}

export class DeusModel implements IDeusModel {
    _id: string;
    _rev: string;
    mail: string;
    password: string; //Temporary (move to Accounts)
    login: string;  //Temporary (move to Accounts)
    profileType: string;    //Тип профиля (текстовый)
    corporation: string;
    salaryLevel: number;
    insurance: number;  //кто выдал страховку (Value из Join)
    insuranceLabel: string; //текстовое описание (сконвертированное значение Value через таблицу)
    insuranceLevel: number; //Уровень страховки (сконвертированное значение через таблицу: 1-4)
    generation: string; //Текстовое название поколения из Join без слова "Поколение"
    genome: number[];        //Геном
    memory: Array<MemoryElement> = [];
    firstName: string;
    nicName: string;
    lastName:  string;
    skills: Array<any> = [];
    sex: string;
    hp: number;
    maxHp: number;
    mind: any = {}
    timestamp: number; 
    conditions: Array<DeusCondition> = []
    modifiers: Array<DeusModifier> = []
    age: number;
    timers: Array<any> = []

    constructor(){}
}