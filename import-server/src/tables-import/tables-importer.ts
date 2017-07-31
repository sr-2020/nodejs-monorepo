import { Observable, BehaviorSubject } from 'rxjs/Rx';

import * as moment from "moment";
import * as PouchDB from 'pouchdb';
import * as request from 'request-promise-native';
import * as winston from 'winston';
import * as arrayUnique from 'array-unique';
import * as google from 'googleapis';

import { config } from '../config';
import { DeusModifier } from '../interfaces/modifier';
import { DeusCondition } from '../interfaces/condition';
import { Predicate } from '../interfaces/predicate';
import { saveObject, MindCubesModifier } from '../helpers'
import { effectNames, conditionTypes, implantClasses, implantCorp, systems, implantSystems } from './constants'
import { GenEffectData, MindEffectData, ImplantData } from './ImplantData';
import { ConditionData } from './conditionData'
import { PillData, parsePill } from './pillsData';
import * as loaders from './loaders';

let unique = arrayUnique.immutable;

interface TablesData {
    implantsData: ImplantData[]
    illnessesData: any[]
    conditionsData: any[]
    pillsData: PillData[]
}

export class TablesImporter {

    private implantDB: any = null;
    private conditionDB: any = null;
    private pillsDB: any = null;

    tablesData: TablesData = {
        implantsData: [],
        illnessesData: [],
        conditionsData: [],
        pillsData: []
    };

    //Созданные в результате импорта объекты имплантов, состояний и "модификатор" для показа состояний кубиков сознания
    implants: DeusModifier[] = [];
    conditions: DeusCondition[] = [];
    mindCubeModifier: DeusModifier = {
        _id: "mindcubes_showdata",
        displayName: "internal mind cube conditions modifier",
        class: "_internal",
        effects: ["show-condition"],
        predicates: []
    };

    constructor() {
        const ajaxOpts = {
            auth: {
                username: config.username,
                password: config.password
            }
        };

        this.implantDB = new PouchDB(`${config.url}${config.catalogs.implants}`, ajaxOpts);
        this.conditionDB = new PouchDB(`${config.url}${config.catalogs.condition}`, ajaxOpts);
        this.pillsDB = new PouchDB(`${config.url}${config.catalogs.pills}`, ajaxOpts);
    }


    authorize(): Promise<any> {
        return new Promise((resolve, reject) => {
            google.auth.getApplicationDefault((err, authClient) => {
                if (err) return reject(err);

                if (authClient.createScopedRequired && authClient.createScopedRequired()) {
                    var scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
                    authClient = authClient.createScoped(scopes);
                }

                resolve(authClient);
            });
        });
    }

    private async importImplants(authClient: any) {
        const implants = await loaders.implantsDataLoad(authClient);

        // Превратить в список объектов ImplantData
        this.tablesData.implantsData = implants[0].values
            .filter(row => row[0] == "ready")
            .map((row, i, arr) => new ImplantData(row, i));

        // и проставить ID если пустое
        this.tablesData.implantsData.forEach((e, i, arr) => {
            if (!e.id && i > 0) e.id = arr[i - 1].id;
        });

        //Объединить импланты по полю id
        let joinedImplants: ImplantData[] = unique(this.tablesData.implantsData.map(i => i.id))
            .map(id => this.tablesData.implantsData
                .filter(e => e.id == id)
                //.map( e => {console.log(`id = ${id}`); return id;} )
                .reduce((prev, cur) => prev.join(cur), new ImplantData())
            );

        //Сохранить объединенные импланты
        this.tablesData.implantsData = joinedImplants;

        winston.info("Implants table loaded!");
    }

    private async importIllnesses(authClient: any) {
        const illnesses = await loaders.illnessesDataLoad(authClient);
        this.tablesData.illnessesData = illnesses[0].values.filter(row => row[0] == "ready");
        winston.info("Illneses table loaded!");
    }

    private async importConditions(authClient: any) {
        const conditions = await loaders.conditionsDataLoad(authClient);

        this.tablesData.conditionsData = conditions[0].values
            .map((row, i) => new ConditionData(row, i))
            .filter(condData => condData.title);

        winston.info("Conditions table loaded!");
    }

    private async importPills(authClient: any) {
        const pillsData = await loaders.pillsDataLoad(authClient);
        this.tablesData.pillsData = pillsData.values.map(parsePill).filter((p) => Boolean(p));
        winston.info("Pills table loaded!");
    }

    import(): Observable<TablesImporter> {
        const promise = async () => {
            const authClient = await this.authorize();
            winston.info("Authorization success!");

            await Promise.all([
                this.importImplants(authClient),
                this.importIllnesses(authClient),
                this.importConditions(authClient),
                this.importPills(authClient)
            ]);

            this.createImplants();
            this.createMindConditions();
            this.implants.push(this.mindCubeModifier);

            await this.saveImplants();
            await this.saveConditions();
            await this.savePills();

            return this;
        }

        return Observable.fromPromise(promise());
    }

    /**
     *  Сохранить импланты в БД, с обновлением существующих
     */
    private saveImplants(): Promise<any[]> {
        return Observable.from(this.implants)
            .flatMap(implant => saveObject(this.implantDB, implant))
            .toArray()
            .do((results) => {
                winston.info(`Saved ${results.length} implants`);
            })
            .toPromise();
    }

    /**
     *  Сохранить созданные Conditions в БД, с обновлением существующих
     */
    private saveConditions(): Promise<any[]> {
        return Observable.from(this.conditions)
            .flatMap(condition => saveObject(this.conditionDB, condition))
            .toArray()
            .do((results) => {
                winston.info(`Saved ${results.length} conditions`);
            })
            .toPromise();
    }

    private savePills(): Promise<any[]> {
        return Observable.from(this.tablesData.pillsData)
            .flatMap((pill) => saveObject(this.pillsDB, pill))
            .toArray()
            .do((results) => winston.info(`Saved ${results.length} pills`))
            .toPromise();
    }

    /**
     * Обработать данные по "состояниям" кубиков
     */
    private createMindConditions() {
        let condIdTable: any = {};

        //Пройти по всем импортированным строчкам состояний (для кубиков сознания и не только, если будут)
        this.tablesData.conditionsData.forEach((condData: ConditionData) => {
            if ((condData.title && condData.cube) || (condData.title && condData.id)) {
                let id = condData.id;

                //Если в строке нет ID для состояния, то сгенерировать его из названия кубика
                if (!id) {
                    let nextNum = condIdTable[condData.cube];
                    if (!nextNum) {
                        nextNum = 1;
                        condIdTable[condData.cube] = nextNum;
                    }

                    id = `mcube-condition-${condData.cube}-${nextNum}`;
                    condIdTable[condData.cube] += 1;
                }

                //Создать объект "состояния" и положить его в список состояний для записи в БД (общий с состояниями имплнатов)
                this.createCondition(id, condData.title, condData.details, "mind");

                //Если это было состояния для кубика сознания, то записать в предикаты для общего модификатора показа состояний
                //запись про показ данного сосояния при данном наборе кубиков
                //Перед этим еще проверить параметры состояния на валидность
                if (condData.cube && this.verirfyMindConditionData(condData)) {
                    let p: Predicate = {
                        variable: condData.cube,
                        value: condData.value,
                        effect: effectNames.simpleString,
                        params: { condition: id }
                    }

                    this.mindCubeModifier.predicates.push(p);
                }
            }
        });

        //console.log( JSON.stringify(this.mindCubeModifier.predicates, null, 4) );
        //console.log( JSON.stringify(this.conditions.filter( c => c._id.startsWith("mcube-condition-A0")), null, 4) );
    }

    /**
     *  Верификация данных по одному значению кубика сознания 
     */
    private verirfyMindConditionData(d: ConditionData): boolean {
        if (d.id && !d.id.match(/^[\w\-]+$/i)) {
            winston.error(`Condition ${d.id} incorrect id`);
            return false;
        }

        if (d.cube && !d.cube.match(/^[A-G]\d$/i)) {
            winston.error(`Condition ${d.cube} incorrect mind cube selector`);
            return false;
        }

        if (d.value && !d.value.match(/^\d\d?-\d\d?\d?$/i)) {
            winston.error(`Condition ${d.value} incorrect selector value`);
            return false;
        }

        return true;
    }


    //Верификация данных по импланту
    private verifyImplantData(d: ImplantData): boolean {
        if (!d.id.match(/^[\w\-]+$/i)) {
            winston.error(`Implant ${d.id} incorrect id`);
            return false;
        }

        if (!d.class) {
            winston.error(`Implant ${d.id} incorrect class`);
            return false;
        }

        if (!d.system) {
            winston.error(`Implant ${d.id} incorrect (or no) system`);
        }

        d.genEffect.forEach(eff => {
            if (eff.position && !eff.position.match(/^\d\d?$/i)) {
                winston.error(`Implant ${d.id} incorrect genom position (one-two digit)`);
                return false;
            }

            if (eff.value && !eff.value.match(/^\d$/i)) {
                winston.error(`Implant ${d.id} incorrect genom value (one digit)`);
                return false;
            }
        });

        d.mindEffect.forEach(eff => {
            if (eff.cube && !eff.cube.match(/^[ABCDEFG]\d$/i)) {
                winston.error(`Implant ${d.id} incorrect mind cube name (format A1)`);
                return false;
            }

            if (eff.value && !eff.value.match(/^\d\d?\-\d\d?$/i)) {
                winston.error(`Implant ${d.id} incorrect mind cube (format 0-99)`);
                return false;
            }
        });

        return true;
    }

    //Создать импланты и их состояния для сохранения в БД
    private createImplants() {

        //Прости по всем импортированным из таблицы и обработанным данным об эффектах
        this.tablesData.implantsData.forEach(impData => {

            //Нормолизовать данные
            impData.normolize();

            //Верефицировать данные 
            if (this.verifyImplantData(impData)) {
                winston.info(`Create implant: ${impData.id} from ${impData.vendor}`)

                //Создать новый модификатор типа "имплант" (класс берем из данных)
                let implant: DeusModifier = {
                    _id: impData.id,
                    displayName: impData.name,
                    class: impData.class,
                    system: impData.system,
                    details: impData.desc,
                    effects: [],
                    predicates: []
                };

                //Пройти по всем эффектам зависящим от генома
                impData.genEffect.forEach((e, i) => {

                    //Получить все эффекты, зависимые от этой позиции в геноме 
                    //(список опредяется тем, что импортировано из таблицы - класс и описание эффекта)
                    this.findGenEffect(e, i, impData).forEach((effectData, i) => {
                        let p: Predicate = {
                            variable: `Z${e.position}`,
                            value: e.value,
                            effect: effectData.name,
                            params: effectData.params
                        };

                        //Нати данные по "эффету" для данной пары. Если надо - добавить в список эффектов
                        if (p.effect != effectNames.changeMaxHp) {
                            if (!implant.effects.find(e => e == p.effect)) {
                                implant.effects.push(p.effect);
                            }
                        }

                        //Добавить предикат в общий список для импланта
                        implant.predicates.push(p);
                    })
                });

                //Пройти по всем эффектам зависящим от сознания (постоянным)
                impData.mindEffect.forEach((e, i) => {
                    //Создать новый предикат для пары условие-эффект
                    let p: Predicate = { variable: "", value: "", effect: "", params: null };

                    if (e.cube && e.value) {
                        p.variable = e.cube;
                        p.value = e.value;
                    }

                    //Нати данные по "эффету" для данной пары. Если надо создать дополнительные состояния
                    //TODO: Переделать распакову в группу предикатов
                    [p.effect, p.params] = this.findMindEffect(e, i, impData);

                    if (p.effect && p.effect != effectNames.changeMindCube) {
                        if (!implant.effects.find(e => e == p.effect)) {
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
    //Обновление: возвращается массив [{ effectName, params },...{ effectName, params }]
    private findGenEffect(effData: GenEffectData, i: number, impData: ImplantData): { name: string, params: any }[] {
        let ret = [];

        //Предполагаем, что если в описании эффект заполнено поле conditionText то оно означает показываемое состояние
        //и не зависит от остальных типов эффектов
        if (effData.conditionText) {
            let conditionName = `${impData.id}-${i}`;
            this.createCondition(conditionName, null, effData.conditionText, effData.conditionType);

            ret.push({ name: effectNames.simpleString, params: { condition: conditionName } });
        }

        //Изменение HP. Реализуются псевдо-эффектом "change-max-hp"
        if (effData.effectClass == "changeMaxHp") {
            if (effData.effectText) {
                let parts = effData.effectText.replace(/\s/i, '').match(/^maxHP\+(\d)/i);
                if (parts) {
                    ret.push({ name: effectNames.changeMaxHp, params: { maxHp: Number(parts[1]) } });
                }
            }
        }

        //Восставновление HP в легком ранении
        if (effData.effectClass == "HealingHp") {
            if (effData.effectText) {
                let parts = effData.effectText.replace(/\s/i, '').match(/^recoveryRate=(\d+)/i);
                if (parts) {
                    ret.push({ name: effectNames.recoveryHp, params: { recoveryRate: Number(parts[1]) } });
                }
            }
        }

        //Восставновление HP в тяжелом ранении 
        if (effData.effectClass == "HealigFromZero") {
            if (effData.effectText) {
                let parts = effData.effectText.replace(/\s/i, '').match(/^recoveryTime=(\d+)/i);
                if (parts) {
                    ret.push({ name: effectNames.recoveryFromZero, params: { recoveryTime: Number(parts[1]) } });
                }
            }
        }

        //Эффекты типа "изменить простую переменную в модели"
        if (effData.effectClass == "change-properties") {
            if (effData.effectText) {
                let operations = effData.effectText.replace(/\s/i, '');
                let correct = operations.split(',').every(op => op.match(/^([\w\d]+)[\+\-\=](\d+)$|^([\w\d]+)\=\"(.*)\"$/i) != null);

                if (correct) {
                    ret.push({ name: effectNames.changeProperties, params: { operations } });
                } else {
                    winston.error(`Can't validate change-properties operations "${operations}" for: ${impData.id}`);
                }
            }
        }


        return ret;
    }

    //Находит параметры эффекта под класс пришедший из данных. Создает дополнительные записи conditions если нужно
    private findMindEffect(effData: MindEffectData, i: number, impData: ImplantData): [string, any] {
        if (effData.effectClass == "changeMindCube") {
            let changeText = effData.text.toUpperCase().replace(/\s/ig, '');

            if (this.validateChangeMindText(changeText)) {
                return [effectNames.changeMindCube, { change: changeText }];
            } else {
                winston.error(`Incorrect change mind cube text in ${impData.id}: ${changeText}`);
            }
        }

        return ["", {}];
    }

    private validateChangeMindText(text: string): boolean {

        text.split(',').forEach(el => {
            if (!el.match(/^([ABCDEFG]\d)([\-\+\=])(\d\d?)$/i)) {
                return false;
            }
        });

        return true;
    }

    private createCondition(id: string, text: string, details: string, condType: string): DeusCondition {
        let cond: DeusCondition = { _id: id, text: text, details: details };

        if (!cond.text) {
            cond.text = details.split(".")[0];
        }

        cond.class = condType ? condType : "physiology";

        this.conditions.push(cond);

        return cond;
    }

}


let importer = new TablesImporter();

importer.import().subscribe((result) => {
    winston.info(`Import finished. Implants: ${result.tablesData.implantsData.length}, Ilnesses: ${result.tablesData.illnessesData.length}`);
    //winston.info(JSON.stringify(result.implantsData.slice(0,10), null, 4));

    // result.implants.filter(imp => imp._id == "lab_maninthemiddle").forEach(imp => 
    //             winston.info(JSON.stringify(imp, null, 4))   
    //         );

    // result.conditions.filter(cond => cond._id.startsWith("lab_maninthemiddle")).forEach(cond => 
    //         winston.info(JSON.stringify(cond, null, 4))   
    //     );


    //winston.info(JSON.stringify(result.implants.slice(0,10), null, 4));
    //winston.info(JSON.stringify(result.impConditions.slice(0,30),null, 4));

},
    (err) => {
        winston.info('Error in import process: ', err);
    });

