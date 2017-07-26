import { Observable, BehaviorSubject } from 'rxjs/Rx';

import * as moment from "moment";
import * as PouchDB from 'pouchdb';
import * as request from 'request-promise-native';
import * as google from 'googleapis';
import * as winston from 'winston';
import * as arrayUnique from 'array-unique';

import { config } from './config';
import { DeusModifier } from './interfaces/modifier';
import { DeusCondition } from './interfaces/condition';
import { Predicate } from './interfaces/predicate';

let unique = arrayUnique.immutable;

let sheets = google.sheets('v4');

const effectNames = {
    simpleString: "show-condition",
    notImplemented: "not-implemented",
    changeMindCube: "inst_changeMindCube"
};

const implantClasses = {
    "кибер" : "cyber-implant",
    "биологический" : "bio-implant",
    "подпольный кибер" : "illegal-cyber-implant",
    "подпольный био" : "illegal-bio-implant",
    "вирт" : "virtual"
};


const implantSystems = {
    "для опорно-двигательной системы" : "musculoskeletal",
    "для сердечно-сосудистой системы" : "cardiovascular",
    "для дыхательной системы" : "respiratory",
    "для эндокринной системы" : "endocrine",
    "для лимфатической системы" : "lymphatic",
    "для нервной системы" : "nervous",
    "нервная система" : "nervous"
};

const implantCorp = {
    "jj" : "JJ",
    "s" : "Serenity",
    "pa" : "Panam",
    "lab" : "IllegalLab",
    "5" : "5Corp",
    "x" : "Special"
}

const conditionTypes = {
    "Физиология" : "physiology",
    "Разум"      : "mind"
}

interface GenEffectData{
    position?: string
    value?: string;
    conditionText?: string;
    effectText?: string;
    effectClass?: string;
    conditionType?: string;
}

interface MindEffectData{
    cube?: string;
    value?: string;
    text?: string;
    effectClass?: string;
}

class ImplantData{
    id: string = "";
    name: string  = "";
    class: string  = "";
    system: string  = "";
    desc: string  = "";
    vendor: string = "";

    genEffect: GenEffectData[] = [];

    mindEffect: MindEffectData[] = [];

    rowNumbers: number[] = [];
    

    constructor( row: string[] = null, rowNumber:number = -1 ){
        if(row){
            this.genEffect.push( {} );
            this.mindEffect.push( {});

            this.rowNumbers.push(rowNumber);

            [,this.id, this.name, this.class, this.system, this.desc, 
                this.genEffect[0].position, this.genEffect[0].value, this.genEffect[0].conditionText,this.genEffect[0].effectText, this.genEffect[0].conditionType, this.genEffect[0].effectClass,
                this.mindEffect[0].cube, this.mindEffect[0].value, this.mindEffect[0].text, this.mindEffect[0].effectClass  ] = row;
            
            this.updateCalcFields();
        }
    }

    public join(d: ImplantData): ImplantData{
        let ret = new ImplantData();

        let fields = ["id","name","class","system","desc"];
        fields.forEach( f => this.joinField(f, ret, d) );

        ret.genEffect = Array.from(this.genEffect).concat(d.genEffect).filter( e => (e.effectText || e.conditionText) )
        ret.mindEffect = Array.from(this.mindEffect).concat(d.mindEffect).filter(e => e.text)
        ret.rowNumbers = Array.from(this.rowNumbers).concat( d.rowNumbers );

        ret.updateCalcFields();

        return ret;
    }

    private joinField(f: string, t: ImplantData, d: ImplantData){
        t[f] = this[f] ? this[f] : d[f];
    }

    public updateCalcFields(){
        if(this.id){
            let parts = this.id.split("_");
            if(parts.length>1){
                this.vendor = implantCorp[parts[0].toLowerCase()];
            }
        }
    }

    public normolize(){
        this.id = this.id.toLocaleLowerCase();
        this.class = this.class.toLocaleLowerCase();
        this.system = this.system.toLocaleLowerCase();
        this.class = implantClasses[this.class] ? implantClasses[this.class] : "";
        this.system = implantSystems[this.system] ? implantSystems[this.system] : "";
        
        this.desc = this.desc ? this.desc.trim() : "";

        this.genEffect.forEach( eff=>{
            eff.conditionText = eff.conditionText ? eff.conditionText.trim() : "";
            eff.effectText = eff.effectText ? eff.effectText.trim() : "";
            eff.effectClass = eff.effectClass ? eff.effectClass.trim() : "";  
            eff.conditionType = eff.conditionType ? conditionTypes[eff.conditionType] : ""; 
        });

        this.mindEffect.forEach( eff=>{
            eff.text = eff.text ? eff.text.trim() : "";
            eff.value = eff.value ? eff.value.toUpperCase().replace(/\s/ig,'') : "";
            eff.cube = eff.cube ? eff.cube.toUpperCase() : "";
            eff.effectClass = eff.effectClass ? eff.effectClass.trim() : "";  
        });
    }
}

interface TablesData{
    implantsData: ImplantData[];
    illnessesData: any[];
}


export class TablesImporter{

    private implantDB:any = null;
    private conditionDB:any = null;


    tablesData :TablesData = { 
        implantsData : [],
        illnessesData : []
    };

    //Созданные в результате импорта объекты имплантов и состояний
    implants: DeusModifier[] = [];
    impConditions: DeusCondition[] = [];

    constructor() {
        const ajaxOpts = {
                auth:{
                    username: config.username,
                    password: config.password
                }
        };

        this.implantDB = new PouchDB(`${config.url}${config.catalogs.implants}`, ajaxOpts);
        this.conditionDB = new PouchDB(`${config.url}${config.catalogs.condition}`, ajaxOpts);
    }


    authorize(): Promise<any>{
        return new Promise( (resolve, reject) => {
            google.auth.getApplicationDefault((err, authClient) => {
                if(err) reject(err);

                if (authClient.createScopedRequired && authClient.createScopedRequired() ) {
                    var scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
                    authClient = authClient.createScoped(scopes);
                }

                resolve(authClient);
            });
        });
    }

    import(): Observable<TablesImporter> {
        let ret = new BehaviorSubject(null);
        let authClient:any = null;

        return Observable.fromPromise(this.authorize())
                .flatMap( a => {
                    winston.info("Authorization success!");
                    authClient = a; 
                    return this.implantsDataImport(authClient)
                })
                .flatMap( implants => {

                    //Превратить в список объектов ImplantData
                    this.tablesData.implantsData = implants[0].values.filter(row => row[0] == "ready" )
                        .map( (row,i,arr) => new ImplantData(row, i) );

                    // и проставить ID если пустое
                    this.tablesData.implantsData.forEach( (e,i,arr) => { 
                        if(!e.id && i>0 ) e.id = arr[i-1].id; 
                    });
                    
                    //Объединить импланты по полю id
                    let joinedImplants:ImplantData[] = unique(this.tablesData.implantsData.map( i => i.id ))
                            .map( id => this.tablesData.implantsData
                                                 .filter(e => e.id == id)
                                                 //.map( e => {console.log(`id = ${id}`); return id;} )
                                                 .reduce( (prev, cur) => prev.join(cur), new ImplantData())
                            );
                        
                    //Сохранить объединенные импланты
                    this.tablesData.implantsData = joinedImplants;

                    winston.info("Implants table loaded!");
                    return this.illnessesDataImport(authClient);
                })
                .map( illnesses => {
                    this.tablesData.illnessesData = illnesses[0].values.filter(row => row[0] == "ready" );
                    winston.info("Illneses table loaded!");
                    return this.tablesData;
                })
                .do( () => this.createImplants() )
                .flatMap( () => this.saveImplants() )
                .flatMap( () => this.saveConditions() )
                .map( () =>{ 
                    return this;
                })
    }

    private implantsDataImport(authClient): Observable<any>{
         var request = {
            spreadsheetId: '1703sXU-akDfn9dsnt19zQjvRrSs7kePPGDkcX0Zz-bY',
            range: 'Implants!A5:R1000',
            valueRenderOption: 'FORMATTED_VALUE',
            dateTimeRenderOption: 'SERIAL_NUMBER',
            auth: authClient,
        };

        let sheetsGet = <Function>Observable.bindNodeCallback(sheets.spreadsheets.values.get);

        return sheetsGet(request);
    }

    private illnessesDataImport(authClient): Observable<any>{
         var request = {
            spreadsheetId: '1703sXU-akDfn9dsnt19zQjvRrSs7kePPGDkcX0Zz-bY',
            range: "illnesses!A4:S100",
            valueRenderOption: 'FORMATTED_VALUE',
            dateTimeRenderOption: 'SERIAL_NUMBER',
            auth: authClient,
        };

        let sheetsGet = <Function>Observable.bindNodeCallback(sheets.spreadsheets.values.get);

        return sheetsGet(request);
    }

    
    private saveImplants(): Promise<any[]>{
         return Observable.from( this.implants )
            .flatMap( implant => {
                return this.implantDB.get(implant._id).then( existImp => { 
                    implant._rev = existImp._rev;
                    return this.implantDB.put(implant);
                })
                .catch( () => { 
                    return this.implantDB.put(implant);
                } )
            })
            .toArray()
            .do( (results)=>{
                winston.info(`Saved ${results.length} implants`);
            })
            .toPromise();
    }   

    private saveConditions(): Promise<any[]>{
         return Observable.from( this.impConditions )
            .flatMap( condition => {
                return this.conditionDB.get(condition._id).then( existImp => { 
                    condition._rev = existImp._rev;
                    return this.conditionDB.put(condition);
                })
                .catch( () => { 
                    return this.conditionDB.put(condition);
                } )
            })
            .toArray()
            .do( (results)=>{
                winston.info(`Saved ${results.length} conditions`);
            })
            .toPromise();
    } 

    //Верификация данных по импланту
    private verifyImplantData(d: ImplantData): boolean{
        if(!d.id.match(/^[\w\-]+$/i)){
            winston.error(`Implant ${d.id} incorrect id`);
            return false;
        }

        if(!d.class){
            winston.error(`Implant ${d.id} incorrect class`);
            return false;
        }

       if(!d.system){
            winston.error(`Implant ${d.id} incorrect (or no) system`);
        }

        d.genEffect.forEach( eff => {
            if(eff.position && !eff.position.match(/^\d\d?$/i)){
                winston.error(`Implant ${d.id} incorrect genom position (one-two digit)`);
                return false;
            }

            if(eff.value && !eff.value.match(/^\d$/i)){
                winston.error(`Implant ${d.id} incorrect genom value (one digit)`);
                return false;
            }
        });

        d.mindEffect.forEach( eff => {
            if(eff.cube && !eff.cube.match(/^[ABCDEFG]\d$/i)){
                winston.error(`Implant ${d.id} incorrect mind cube name (format A1)`);
                return false;
            }

            if(eff.value && !eff.value.match(/^\d\d?\-\d\d?$/i)){
                winston.error(`Implant ${d.id} incorrect mind cube (format 0-99)`);
                return false;
            }
        });

        return true;
    }

    //Создать импланты и их состояния для сохранения в БД
    private createImplants(){

        //Прости по всем импортированным из таблицы и обработанным данным об эффектах
        this.tablesData.implantsData.forEach( impData => { 
            
            //Нормолизовать данные
            impData.normolize();

            //Верефицировать данные 
            if(this.verifyImplantData(impData)){
                winston.info(`Create implant: ${impData.id} from ${impData.vendor}`)

                //Создать новый модификатор типа "имплант" (класс берем из данных)
                let implant:DeusModifier = {
                    _id : impData.id,
                    displayName: impData.name,
                    class: impData.class,
                    system: impData.system,
                    effects: [],
                    predicates: []
                };

                //Пройти по всем эффектам зависящим от генома
                impData.genEffect.forEach( (e, i) => {
                    //Создать новый предикат для пары условие-эффект
                    let p: Predicate = { variable: "", value: "", effect: "", params : null  };
                    if(e.position && e.value){
                        p.variable = `Z${e.position}`;
                        p.value = e.value;
                    }

                    //Нати данные по "эффету" для данной пары. Если надо создать дополнительные состояния
                    [p.effect, p.params] = this.findGenEffect(e, i, impData);

                     if(p.effect){
                        if(!implant.effects.find( e => e == p.effect)){
                            implant.effects.push(p.effect);
                        }
                    }

                    implant.predicates.push(p);
                });

                //Пройти по всем эффектам зависящим от сознания (постоянным)
                impData.mindEffect.forEach( (e, i) => {
                    //Создать новый предикат для пары условие-эффект
                    let p: Predicate = { variable: "", value: "", effect: "", params : null  };

                    if(e.cube && e.value){
                        p.variable = e.cube;
                        p.value = e.value;
                    }

                    //Нати данные по "эффету" для данной пары. Если надо создать дополнительные состояния
                    [p.effect, p.params] = this.findMindEffect(e, i, impData);

                    if(p.effect && p.effect != effectNames.changeMindCube){
                        if(!implant.effects.find( e => e == p.effect)){
                            implant.effects.push(p.effect);
                        }
                    }
                    
                    implant.predicates.push(p);
                });

                //Добавить имплант в список
                this.implants.push(implant);
            }
        });
    
    }


    //Находит параметры эффекта под класс пришедший из данных. Создает дополнительные записи conditions если нужно
    private findGenEffect( effData: GenEffectData, i: number, impData:ImplantData ): [string, any]{
        if(effData.effectClass == "simpleString"){
            let conditionName = `${impData.id}-${i}`;
            this.createCondition(conditionName, null, effData.conditionText, effData.conditionType);

            return [effectNames.simpleString, { condition: conditionName } ];
        }

        return ["", {}];
    }

    //Находит параметры эффекта под класс пришедший из данных. Создает дополнительные записи conditions если нужно
    private findMindEffect( effData: MindEffectData, i: number, impData:ImplantData ): [string, any]{   
        if(effData.effectClass == "changeMindCube"){
            let changeText = effData.text.toUpperCase().replace(/\s/ig,'');

            if(this.validateChangeMindText(changeText)){
                return [effectNames.changeMindCube, { change: changeText } ];            
            }else{
                winston.error(`Incorrect change mind cube text in ${impData.id}: ${changeText}`);
            }
        }

        return ["", {}];
    }

    private validateChangeMindText(text: string): boolean{
        
        text.split(',').forEach(el => {
            if(!el.match(/^([ABCDEFG]\d)([\-\+\=])(\d\d?)$/i)){
                return false;
            }
        });

        return true;
    }

    private createCondition(id: string, text: string, details: string, condType: string): DeusCondition{
        let cond:DeusCondition = { _id : id, text: text, details: details };
        
        if(!cond.text){
            cond.text = details.split(".")[0];
        }

        if(condType){
            cond.class = condType;
        }

        this.impConditions.push(cond);
        
        return cond;
    }

}


let importer = new TablesImporter();

importer.import().subscribe((result) => { 
            winston.info(`Import finished. Implants: ${result.tablesData.implantsData.length}, Ilnesses: ${result.tablesData.illnessesData.length}` );
            //winston.info(JSON.stringify(result.implantsData.slice(0,10), null, 4));
            winston.info(JSON.stringify(result.implants.slice(0,2),null, 4));
            //winston.info(JSON.stringify(result.impConditions.slice(0,30),null, 4));
            
        },
        (err) => {
            winston.info('Error in import process: ', err);
        });

