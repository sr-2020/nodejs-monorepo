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
import { saveObject } from '../helpers'
import { effectNames, conditionTypes, implantClasses, implantCorp, systems, implantSystems } from './constants'
import { GenEffectData, MindEffectData, ImplantData } from './ImplantData';
import { IllnessData } from './illnessData'
import { ConditionData } from './conditionData'
import { PillData, parsePill } from './pillsData';
import { FirmwareData, parseFirmware } from './firmwareData';

import * as loaders from './loaders';
import { System } from "../interfaces/model";

let unique = arrayUnique.immutable;

interface TablesData {
    implantsData: ImplantData[]
    illnessesData: any[]
    conditionsData: any[]
    pillsData: PillData[]
    firmwareData: FirmwareData[]
}

export class TablesImporter {

    private implantDB: any = null;
    private conditionDB: any = null;
    private pillsDB: any = null;
    private illnessesDB: any = null;

    tablesData: TablesData = {
        implantsData: [],
        illnessesData: [],
        conditionsData: [],
        pillsData: [],
        firmwareData: []
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
    illnesses: DeusCondition[] = [];

    authorize(): Promise<any> {
        return new Promise((resolve, reject) => {
            google.auth.getApplicationDefault((err, authClient) => {
                if (err) return reject(err);

                if (authClient.createScopedRequired && authClient.createScopedRequired()) {
                    var scopes = ['https://www.googleapis.com/auth/spreadsheets'];
                    authClient = authClient.createScoped(scopes);
                }

                resolve(authClient);
            });
        });
    }


    private readonly numberOfSystems = 7;

    private readonly systemsPresence = [
        [0, 0, 1, 1, 0, 0, 1], // Одноклеточные
        [0, 0, 0, 1, 1, 0, 1], // Растения
        [0, 0, 0, 1, 1, 1, 1], // Грибы
        [1, 1, 1, 0, 0, 0, 1], // Членистоногие
        [1, 1, 0, 1, 1, 1, 1], // Моллюски
        [1, 0, 0, 0, 0, 0, 1], // Черви
        [1, 0, 1, 1, 1, 1, 1], // Рыбы
        [1, 1, 1, 0, 1, 1, 1], // Рептилии
        [1, 1, 1, 1, 1, 1, 1], // Птицы
        [1, 1, 1, 1, 1, 1, 1], // Млекопитающие
    ]

    private splitCell(value: string): number[] {
        const result = value.split(' ').map(Number);
        if (result.length != this.numberOfSystems)
            winston.error('Incorrect cell value, not 7 numbers: ' + value);
        return result;
    }

    private assertMatch(values: number[], mask: number[]) {
        for (let i = 0; i < this.numberOfSystems; ++i) {
            if (values[i] != 0 && mask[i] == 0)
                winston.error(`Value is present for missing system. values=${values}, mask=${mask}`);
        }
    }

    private async importXenos(authClient: any) {
        const ajaxOpts = {
            auth: {
                username: config.username,
                password: config.password,
            },

            timeout: 6000 * 1000,
        };

        const con = new PouchDB(`${config.url}${config.workModelDBName}`, {});

        const data = await loaders.xenomorphsDataLoad(authClient);
        data.values.forEach(async (line, rowIndex: number) => {
            if (rowIndex > 10) return;
            const planet = line[0];
            if (planet.length == 0)
                return;

            //winston.info(`Processing planet ${planet}`);
            for (let i = 0; i < this.systemsPresence.length; ++i) {
                const nucleotideString = line[1 + 8 * i];
                if (nucleotideString == '-')
                    continue;

                const systemsMask = this.systemsPresence[i];
                const nucleotide = this.splitCell(nucleotideString);
                this.assertMatch(nucleotide, systemsMask);

                for (let j = 0; j < 5; ++j) {
                    const columnIndex = 1 + 8 * i + j
                    const systemValuesString = line[columnIndex];

                    const systemsValues = this.splitCell(systemValuesString);
                    this.assertMatch(systemsValues, systemsMask);

                    const id = '9' + rowIndex.toString().padStart(3, '0') + columnIndex.toString().padStart(2, '0');

                    const systems: System[] = [];
                    for (let s = 0; s < this.numberOfSystems; ++s)
                        systems.push({lastModified: 0, present: systemsMask[s] == 1, value: systemsValues[s], nucleotide: nucleotide[s]});

                    const model = {
                        _id: id,
                        timestamp: Date.now(),
                        firstName: 'Инопланетный',
                        lastName: 'организм',
                        profileType: 'xenomorph',
                        systems,
                        conditions: [],
                        changes: [],
                        messages: [],
                        modifiers: [],
                        timers: [],
                    }

                    try {
                        await saveObject(con, model, true).toPromise();
                    } catch (e) {
                        winston.error(e);
                    }
                }
            }
        });
        //await loaders.testDataSave(authClient);
        //console.log(JSON.stringify(implants));
    }


    import(): Observable<TablesImporter> {
        const promise = async () => {
            const authClient = await this.authorize();
            winston.info("Authorization success!");

            await Promise.all([
                this.importXenos(authClient),
            ]);
            return this;
        }

        return Observable.fromPromise(promise());
    }
}


let importer = new TablesImporter();

importer.import().subscribe((result) => {
    winston.info(`Import finished. Implants: ${result.tablesData.implantsData.length}, Ilnesses: ${result.tablesData.illnessesData.length}`);
},
    (err) => {
        winston.info('Error in import process: ', err);
    }
);

