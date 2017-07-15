import { Observable } from 'rxjs/Rx';
import * as moment from "moment";
import * as PouchDB from 'pouchdb';
import * as request from 'request-promise-native';
import * as chance from 'chance';

import { ImportStats, ImportRunStats } from './stats';
import { config } from './config';
import { JoinCharacterDetail, JoinData, JoinFieldInfo, JoinFieldMetadata, JoinFieldValue, JoinGroupInfo, JoinMetadata } from './join-importer'
import { joinValues } from './join-import-tables';

import { DeusModel } from './interfaces/model';
import { DeusModifier } from './interfaces/modifier';
import { DeusCondition } from './interfaces/condition';
import { DeusEffect } from './interfaces/effect';




export class AliceExporter{
    private con:any = null;
    
    private chance:Chance.SeededChance;
    public model: DeusModel = new DeusModel();

    constructor(private character: JoinCharacterDetail, private metadata:JoinMetadata) {
        this.con = new PouchDB(`${config.url}${config.modelDBName}`);
        this.chance = new Chance(character.CharacterId);
        this.model = new DeusModel();
    }

    export(): Promise<any> {
        
        // let model:any = this.createModel(this.joinChar);

        // return this.con.get( model._id)
        //                 .then( (oldc:any) =>{ 
                            
        //                     return Promise.resolve("exists");
        //                 })
        //                 .catch( () => this.con.put(model) );

        return Promise.resolve(true);
    }

    createModel(): any {
        //ID Alice. CharacterId
        this.model._id = this.character.CharacterId.toString();

        //Login (e-mail). Field: 1905
        this.model.login = this.findStrFieldValue(1905);
        this.model.mail = this.model.login + "@alice.digital";

        //Password. Field: 1905
        this.model.password = this.findStrFieldValue(2039);
        
        //Тип профиля и Поколение. Field: 498. Если не проставлено, выбирается W
        this.setGenerationAndType();

        //Место работы (корпорация). Field: 1977
        this.model.corporation = this.findStrFieldValue(1977);

        //Уровень зарплаты. Field: 1976
        this.model.salaryLevel = this.findNumFieldValue(1976); 

        //Страховка и ее уровень. Field: 1973, 1975
        this.model.insurance = this.findNumFieldValue(1973);
        this.model.insuranceLevel = Number.parseInt( this.findStrFieldValue(1975, true) );
        this.model.insuranceLabel = this.findStrFieldValue(1973, true) + `. Уровень: ${this.model.insuranceLevel}`;

        //Болезни на начало игры. Field: 1949
        //TODO: нужно сгенерировать случайные болезни из списка.
        //Для этого нужен доступный список болезнй в БД, метод поиска по ним и подброра 

        //Геном. Зависит от полей: "Геном" (2042-2053), "Поколение"(498), "Клон"(1948)
        this.setGenome();
        
        //Импланты на начало игры. Field: 1215
        //TODO: нужно получить список ID имплантов из Join (в деталях полей в метаданных)
        //Загрузить детали из БД со списком имплантов и добавить в модель
        //Нужна БД со список имплантов
        this.setImplants();

        //Установить имя песрнажа. Field: 496
        this.setFullName();

        //Воспоминания. Field: 1845,1846,1847
        this.setMemories();
    }

    //Возвращается DisplayString поля, или ""
    //Если convert==true, то тогда возращается выборка по Value из таблицы подставновки
    findStrFieldValue(fieldID: number, convert: boolean = false): string {
        const field = this.character.Fields.find( fi => fi.ProjectFieldId==fieldID);

        if(!field) return "";

        if(!convert){
            return field.DisplayString;
        }else{
            return joinValues.hasOwnProperty(field.Value)? joinValues[field.Value] : "";
        }  
    }

    //Возвращается Value, которое должно быть цифровым или Number.NaN
    findNumFieldValue(fieldID: number): number {
        const field = this.character.Fields.find( fi => fi.ProjectFieldId==fieldID);

        if(field){
            let value:number = Number.parseInt(field.Value);
            if(!Number.isNaN(value)){
                return value;
            }
        }

        return Number.NaN;
    }

    //Возвращается Value, которое должно быть списком цифр, разделенных запятыми
    //Если в списке встретится что-то не цифровое, в массиве будет Number.NaN
    findNumListFieldValue(fieldID: number): number[]{
        const field = this.character.Fields.find( fi => fi.ProjectFieldId==fieldID);

        if(field) {
            return field.Value.split(',').map( el => Number.parseInt(el) );
        }

        return [];
    }

    //Поколение. Field: 498. Если не проставлено, выбирается W
    //Поколения бывают: 735, 643, 644, 645 (ValueID из списка)
    setGenerationAndType() {
        let generation = this.findStrFieldValue(498, true)
        
        if(!generation){
            generation = "W";
        }

        this.model.generation = generation;

        if(generation == "robot"){
            this.model.profileType = "robot"
        }else if(generation == "program"){
            this.model.profileType = "program"
        }else{
            this.model.profileType = "human"
        }
    }

    //Создает значение поля Геном для модели. 
    //Геном. Зависит от полей: группы "Геном" (2042-2053), "Поколение"(498), "Клон"(1948)
    setGenome(){
        //Снача проставить рандомный геном
        this.setRandomGenome();

        //Теперь пройти по всем полям и проставить их значения, если они есть.
        const FIELD_BASE = 2042;
        for(let n=0;n<12;n++){
            const val = this.findStrFieldValue(FIELD_BASE+n);
            if(val){
                this.model.genome[n] = Number.parseInt( val.split(" ")[0] );
            }
        }

        //Проставить значение "Клон" если оно есть
        if(this.findStrFieldValue(1948)){
            this.model.genome[12] = 1;
        }
    }

    setRandomGenome() {
        //Всего 6 систем (полей генома) которые могут быть предрасположены к болезням
        let genome: number[] = new Array(13).fill(0);

        //Выбрать нужное количество "потенциально больных" систем организма
        let badSystems = 1;
        if(this.model.generation == "W"){
            badSystems = 2;
        }else if(this.model.generation == "Z"){
            badSystems = 3;
        }else{
            badSystems = 4;
        }
        
        while(badSystems>0){
            //Get random system number
            let n = this.chance.integer({min: 0, max: 5});
            if(genome[n] == 0){
                genome[n] = 1;
                badSystems--;
            }
        }

        //Проставить случайные значения в остальные позиции
        for(let i=6;i<12;i++){
            genome[i] = this.chance.integer({min: 0, max: 2});
        } 

        this.model.genome = genome;
    }

    //Получить список имплантов и загрузить их в модель. Field: 1215
    setImplants(){
        // this.findNumListFieldValue().map(
        //     (n) => {  }
        // )
    }

    //Установить имя песрнажа. Field: 496
    setFullName(){
        let nameParts = this.findStrFieldValue(496).split(" ");

        if(nameParts.length > 0){
            this.model.firstName = nameParts[0];

            if(nameParts.length==1){
                this.model.lastName = "";
            }

            if(nameParts.length == 2){
                this.model.lastName = nameParts[1];
            }else if(nameParts.length > 2){
                this.model.nicName = nameParts[1].replace(/^\"|\"$/gi, "");
                this.model.lastName = nameParts.slice(2).join(" ");
            }
        }
    }

    //Воспоминания. Field: 1845,1846,1847
    setMemories(){
        [ this.findStrFieldValue(1845), 
          this.findStrFieldValue(1846), 
          this.findStrFieldValue(1847) ]
        .filter( m => m)
        .forEach( mem =>
            this.model.memory.push(
                {
                    title: mem.substr(0,30) + (mem.length>30 ? "..." : ""),
                    text: mem
                }
            ));  
    }
}   
