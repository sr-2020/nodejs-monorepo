import { Observable } from 'rxjs/Rx';
import * as moment from "moment";
import * as PouchDB from 'pouchdb';
import * as request from 'request-promise-native';
import * as chance from 'chance';
import * as winston from 'winston';
import * as uuid from 'uuid/v4';
import * as clones from 'clones';

import { ImportStats, ImportRunStats } from './stats';
import { config } from './config';
import { JoinCharacterDetail, JoinData, JoinFieldInfo, JoinFieldMetadata, JoinFieldValue, JoinGroupInfo, JoinMetadata } from './join-importer'
import { joinValues, insuranceSourceIT } from './join-import-tables';

import { DeusModel, MemoryElement, MindData } from './interfaces/model';
import { DeusModifier } from './interfaces/modifier';
import { DeusCondition } from './interfaces/condition';
import { DeusEffect } from './interfaces/effect';
import { DeusEvent } from './interfaces/events';
import { mindModelData } from './mind-model-stub';
import { CatalogsLoader } from './catalogs-loader';
import { saveObject, DamageModifier } from './helpers'

const PHYS_SYSTEMS_NUMBER = 6;

interface IAliceAccount {
    _id: string;
    _rev?: string;
    password: string;
    login: string;
}

export interface INameParts{
    firstName: string,
    nicName:  string,
    lastName: string,
    fullName: string
};


export class AliceExporter{
    private con:any = null;
    private accCon:any = null;
    private eventsCon:any = null;
    
    
    private chance:Chance.SeededChance;
    public model: DeusModel = new DeusModel();

    private eventsToSend: DeusEvent[] = [];

    public account: IAliceAccount = { _id:"", password: "", login: "" };

    constructor(private character: JoinCharacterDetail,
                private metadata: JoinMetadata,
                private catalogs: CatalogsLoader,
                public isUpdate: boolean = true) {

        const ajaxOpts = {
                auth:{
                    username: config.username,
                    password: config.password
                }
        };

        this.con = new PouchDB(`${config.url}${config.modelDBName}`, ajaxOpts);
        this.accCon = new PouchDB(`${config.url}${config.accountDBName}`, ajaxOpts);
        this.eventsCon = new PouchDB(`${config.url}${config.eventsDBName}`, ajaxOpts);      

        this.chance = new chance(character.CharacterId);

        this.createModel();
    }

    export(): Promise<any> {

        if(!this.model._id){
            return Promise.reject(`AliceExporter.export(): ${this.character._id} Incorrect model ID or problem in conversion!`);
        }

        let results:any = {
            clearEvents: null,
            account: null,
            model: null,
            saveEvents: null
        };

        let refreshEvent = {
                            characterId : this.model._id,
                            eventType : "_RefreshModel",
                            timestamp : this.model.timestamp+100,
                            data : {}
                        };

        if(this.eventsToSend.length){
            refreshEvent.timestamp = this.eventsToSend[ this.eventsToSend.length-1 ].timestamp+100;
        }

        this.eventsToSend.push(refreshEvent);

        //Очистить очередь
        return Observable.from([this])
                    .flatMap( () => this.clearEvents() )
                    .do( result => results.clearEvents = result.length )

                    .flatMap( () => saveObject(this.con, this.model, this.isUpdate) )
                    .do( result => results.model = result.ok ? "ok" : "error" )
                    
                    .flatMap( () => this.eventsToSend.length ? this.eventsCon.bulkDocs(this.eventsToSend) : Observable.from([ [] ]) )
                    .do( (result:any) => results.saveEvents = result.length )

                    .flatMap( () => (this.account.login && this.account.password) ? saveObject(this.accCon, this.account, this.isUpdate) : Promise.resolve(false) )
                    .do( result => results.account = result.ok ? "ok" : "error" )
                    
                    .map( result => results )
                    .toPromise();


        // //Create or update Profile 
        // let profilePromise = saveObject(this.con, this.model, this.isUpdate);

        // //Put events for model
        // let eventsPromise = Promise.resolve([]);
        // if(this.eventsToSend.length) { eventsPromise = this.eventsCon.bulkDocs(this.eventsToSend) }

        // //Create or update account record
        // let accPromise = Promise.resolve(false);
        // if(this.account.login && this.account.password){
        //     accPromise = saveObject(this.accCon, this.account, this.isUpdate);
        // }
        
        // return Promise.all([profilePromise, accPromise, eventsPromise]);
    }

    /**
     * Очистка очереди события для данного персонажа (если они были)
     */
    clearEvents(): Observable<any> {
         let selector = {
                selector:{ characterId: this.model._id },
                sort: [  {characterId :"desc"},
                         {timestamp :"desc"} ],
                limit: 10000
            };

        return Observable.from( this.eventsCon.find(selector) )
                    .flatMap( (result:any) => {
                            return this.eventsCon.bulkDocs(
                                result.docs.map( (x) =>  {
                                                let x2 = clones(x);
                                                x2._deleted = true
                                                return x2;
                                            })
                            );
                    })
    }

    private createModel(){
        try{
            winston.info(`Try to convert model id=${this.character.CharacterId}`);

            this.model.timestamp = Date.now();
            this.model.modifiers.push( new DamageModifier() );

            //ID Alice. CharacterId
            this.model._id = this.character.CharacterId.toString();
            this.account._id =  this.model._id;

            //Персонаж жив
            this.model.isAlive = true;

            //Login (e-mail). Field: 1905
            //Защита от цифрового логина
             this.model.login = this.findStrFieldValue(1905).split("@")[0].toLowerCase();

            if(!this.model.login.match(/^[\w\#\$\-\*\&\%\.]{4,30}$/i) || this.model.login.match(/^\d+$/i) ) {
                winston.info(`ERROR: can't convert id=${this.character.CharacterId} incorrect login=\"${this.model.login}\"`);
                //this.model._id = "";
                //return;
                this.model.login = "";
            }
           
            this.account.login = this.model.login;

            if(this.model.login){
                this.model.mail = this.model.login + "@alice.digital";
            }else{
                this.model.mail = "";
            }

            //Password. Field: 1905
            this.account.password = this.findStrFieldValue(2039);
            
            //Тип профиля и Поколение. Field: 498. Если не проставлено, выбирается W
            this.setGenerationAndType();
            
            //Установить имя песрнажа. Field: 496
            this.setFullName();
            
            //Локация  Field: 501
            this.model.sweethome = this.findStrFieldValue(501);


            //Блок данных возможных только для типа профиля "Human"
            if(this.model.profileType=="human"){    
                //Физиология - системы
                this.model.systems = new Array<number>(PHYS_SYSTEMS_NUMBER);
                this.model.systems.fill(1);

                //Пол персонажа Field: 696
                this.model.sex = this.findStrFieldValue(696,true);

                //Место работы (корпорация). Field: 2017 
                const corpVar = this.findNumFieldValue(2017);
                if(corpVar){                
                    this.model.corporation = this.findStrFieldValue(2017);
                    this.model.corporationId = this.convertToDescription(2017,corpVar);

                    if(this.findBoolFieldValue(2070)){
                        this.model.corporationAdmin = true;
                    }
                }

                //Уровень зарплаты. Field: 1976
                this.model.salaryLevel = Number.parseInt(this.findStrFieldValue(1976, true));

                //Страховка и ее уровень. Field: 1973, 1975
                const insuranceVal = this.findNumFieldValue(1973);
                if(insuranceVal) {
                    this.model.insurance = insuranceSourceIT[insuranceVal];
                    this.model.insuranceLevel = Number.parseInt( this.findStrFieldValue(1975, true) );
                    this.model.insuranceDiplayName = this.findStrFieldValue(1973, true) + `, Уровень: ${this.model.insuranceLevel}`;
                }

                //TODO: модель сознания. Кубики
                this.setMindModel();

                //Болезни на начало игры. Field: 1949
                //TODO: нужно сгенерировать случайные болезни из списка.
                //Для этого нужен доступный список болезнй в БД, метод поиска по ним и подброра 

                //Геном. Зависит от полей: "Геном" (2042-2053), "Поколение"(498), "Клон"(1948)
                this.setGenome();

                //Воспоминания. Field: 1845,1846,1847
                this.setMemories([1845,1846,1847]);

                //Профиль хакера. Field: 1652
                this.model.hackingLogin = this.findStrFieldValue(1652);

                //Защта от хакерства  Field: 1649
                this.model.hackingProtection = Number.parseInt( this.findStrFieldValue(1649, true) );

                //Поля для хакеров (ставим всем)
                this.model.lockReduction = 100;
                this.model.proxyRegen = 100;
                this.model.maxProxy = 100;

                //Максимальное время в VR (секунды)
                this.model.maxSecondsInVr = 7200;
            }
            
            //Блок данных только для профиля андроида или программы
            if( this.model.profileType=="robot" ||
                this.model.profileType=="program") {

                //Создатель (для андроидов и программ) Field: 1829
                this.model.creator = this.findStrFieldValue(1829);

                //Владелец (для андроидов и программ) Field: 1830
                this.model.owner = this.findStrFieldValue(1830);

                //Модель андроида (или еще чего-нибудь) Field: 1906
                //TODO: это точно надо переделывать в какой-то внятный список ID моделей
                this.model.model = this.findStrFieldValue(1906);

                //Прошивка андроида. Field: 1907
                //TODO: это точно надо переделывать в какой-то внятный список ID моделей
                this.model.firmware = this.findStrFieldValue(1906);    

                //Сохраненные данные. Field: 1845,1846,1847
                this.setMemories([1848,1849,1850]);

                //Максимальное время в VR (секунды)
                this.model.maxSecondsInVr = 82800;
            }
        
            //Импланты на начало игры. Field: 1215
            //TODO: нужно получить список ID имплантов из Join (в деталях полей в метаданных)
            //Загрузить детали из БД со списком имплантов и добавить в модель
            //Нужна БД со список имплантов
            this.setImplants();

            //начальное количество хитов
            this.model.maxHp = 2;
            this.model.hp = 2;
 

        }catch(e){
            winston.info(`Error in converting model id=${this.character.CharacterId}: ` + e);
            this.model._id = "";
        }
    }

    public static joinStrFieldValue(character: JoinCharacterDetail, 
                                    fieldID: number,
                                    convert: boolean = false): string {

        const field = character.Fields.find( fi => fi.ProjectFieldId==fieldID);

        if(!field) return "";

        if(!convert){
            return field.DisplayString.trim();
        }else{
            return joinValues.hasOwnProperty(field.Value)? joinValues[field.Value] : "";
        }  
    }
    public static joinNumFieldValue(character: JoinCharacterDetail, 
                                    fieldID: number ): number {

        const field = character.Fields.find( fi => fi.ProjectFieldId==fieldID);

        if(field){
            let value:number = Number.parseInt(field.Value);
            if(!Number.isNaN(value)){
                return value;
            }
        }

        return Number.NaN; 
    }

    //Возвращается DisplayString поля, или ""
    //Если convert==true, то тогда возращается выборка по Value из таблицы подставновки
    findStrFieldValue(fieldID: number, convert: boolean = false): string {
        return AliceExporter.joinStrFieldValue(this.character, fieldID, convert);
    }

    //Возвращается Value, которое должно быть цифровым или Number.NaN
    findNumFieldValue(fieldID: number): number {
        return AliceExporter.joinNumFieldValue(this.character, fieldID);
    }

    //Возвращается Value, которое должно булевым. 
    //Если значение поля "on" => true, иначе false
    findBoolFieldValue(fieldID: number): boolean {
        let text  = AliceExporter.joinStrFieldValue(this.character, fieldID, false);
        return (text == 'on');  
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

    //Конвертирует числовое ID значения поля мультивыбора в Description для этого значения
    //при конвертации убирает HTML-теги
    convertToDescription(fieldID: number, variantID: number): string {
        let field = this.metadata.Fields.find( f => f.ProjectFieldId == fieldID );

        if(field && field.ValueList){

            let value = field.ValueList.find( fv => fv.ProjectFieldVariantId == variantID );
            if(value){
                return value.Description.replace(/\<(.*?)\>/ig, '')
            }
        }

        return null;
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
            if(val && this.model.genome){
                this.model.genome[n] = Number.parseInt( val.split(" ")[0] );
            }
        }

        //Проставить значение "Клон" если оно есть
        if(this.findStrFieldValue(1948)){
            if(this.model.genome) this.model.genome[12] = 1;
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

    //Получить список имплантов и загрузить их в модель. Field: 2015
    //Фактически посылает персонажу набор событий add-implant для добавления при первом рефреше
    setImplants(){
        let time =  this.model.timestamp + 100;
        
        this.findNumListFieldValue(2015)
                .map( id => this.convertToDescription(2015, id) )
                .filter( sId => sId )
                .forEach( sID => this.eventsToSend.push( {
                            characterId : this.model._id,
                            eventType : "add-implant",
                            timestamp : time+=1,
                            data : { id: sID }
                        }));
    }

    setFullName(){
        const name = this.findStrFieldValue(496);
        let nameParts:INameParts = AliceExporter.parseFullName(name);

        this.model.firstName = nameParts.firstName;
        this.model.nicName = nameParts.nicName;
        this.model.lastName = nameParts.lastName;
    }

    //Установить имя песрнажа. Field: 496
    public static parseFullName(name:string): INameParts{
        let ret:INameParts = {
            firstName: "",
            nicName:  "",
            lastName: "",
            fullName: name
        };

        let parts = name.match(/^(.*?)\s\"(.*?)\"\s(.*)$/i);

        //Формат имени Имя "Ник" Фамилия
        if(parts){
            ret.firstName = parts[1];
            ret.nicName = parts[2];
            ret.lastName = parts[3];
            return ret;
        }

        //Формат имени Имя "Ник"
        parts = name.match(/^(.*?)\s\"(.*?)\"\s*$/i);

        if(parts){
            ret.firstName = parts[1];
            ret.nicName = parts[2];
            ret.lastName = "";
            return ret;
        }

        //Формат имени Имя Фамилия
        parts = name.match(/^(.*?)\s(.*)$/i);

        if(parts){
            ret.firstName = parts[1];
            ret.lastName = parts[2];
            ret.nicName = "";
            return ret;
        }
        
        //Формат имени - только имя
        ret.firstName = name;
        ret.nicName = "";
        ret.lastName = "";

        return ret;
    }

    //Воспоминания/сохраненные данные. Список полей передается
    setMemories( fields: number[] ){
        fields.map( n => this.findStrFieldValue(n) )
        .filter( m => m)
        .forEach( m => m.split("#######################").forEach( mem => 
                            this.model.memory.push(
                                {
                                    title: mem.substr(0,60) + (mem.length>60 ? "..." : ""),
                                    text: mem,
                                    mID: uuid()
                                }
                            ))
        );  
    }

    //Установка модели кубиков сознания. Field value: 2054, 2055
    setMindModel(){
        this.model.mind = {};

        //Установить случайные значения во все элементы
        Object.keys(mindModelData).forEach( (line:string) => {
            this.model.mind[line] = mindModelData[line].names.map( () =>
                this.chance.integer({min: 40, max: 59})
            );
        })

        //Установить некоторые элементы в зависимости от поколения
        if(this.model.generation == "W"){
            this.model.mind.D[4] = this.chance.integer({min: 60, max: 69});
        }else if(this.model.generation == "Z"){
            this.model.mind.D[5] = this.chance.integer({min: 30, max: 39});
        }else if(this.model.generation == "A"){
            this.model.mind.C[6] = this.chance.integer({min: 30, max: 39});
            this.model.mind.E[1] = this.chance.integer({min: 60, max: 69});
        }

        //Установить кастомный кубик, если он задан
        let cName = this.findStrFieldValue(2054);
        let cValue = this.findStrFieldValue(2055);

        if(cName && cValue){
            let value = Number.parseInt(cValue);
            if(!Number.isNaN(value))
                this.model.mind[cName.charAt(0)][Number.parseInt(cName.charAt(1))] = value;
        }
    }
}   
