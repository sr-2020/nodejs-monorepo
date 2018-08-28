import deepEqual = require('deep-equal');
import { cloneDeep } from 'lodash';
import { Catalogs, CatalogsStorage } from '../catalogs_storage';
import { Config } from '../config';
import { DBInterface } from '../db/interface';
import { PouchConnector, PouchDb } from '../db/pouch';

export function dbName(config: Config, alias: string): string {
    if (alias == 'defaultViewModels') return config.viewModels.default;
    return config.db[alias] || config.objects[alias];
}

export function deepToString(doc: any) {
    const result: any = {};

    // tslint:disable-next-line:forin
    for (const k in doc) {
        switch (typeof (doc[k])) {
            case 'function':
                result[k] = doc[k].toString();
                break;
            case 'object':
                result[k] = deepToString(doc[k]);
                break;
            default:
                result[k] = doc[k];
        }
    }

    return result;
}

export async function createDbIfNotExists(config: Config, name: string): Promise<void> {
    new PouchConnector(config).use(name);
}

async function getOrNull(db: PouchDB.Database, id: string): Promise<any> {
    return new Promise((resolve, _) => {
        db.get(id, {}, (err: any, data: any) => {
            if (err) {
                resolve();
            } else {
                resolve(data);
            }
        });
    });
}

async function put(db: PouchDB.Database, doc: any) {
    return new Promise((resolve, reject) => {
        db.put(doc, {}, (err: any, data: any) => {
            if (err) {
                console.error('Error while putting document into db: ', err);
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

export async function updateIfDifferent(db: PouchDB.Database, doc: any) {
    const existing = await getOrNull(db, doc._id);
    if (existing) {
        doc._rev = existing._rev;
    }
    if (existing && deepEqual(existing, doc, { strict: true })) {
        console.log(`  Same document for id=${doc._id} already present, skipping update`);
        return;
    }
    console.log(`  Updating document for id=${doc._id}`);
    await put(db, doc);
}

function catalogDb(config: Config, catalogsStorage: CatalogsStorage, catalog: string): DBInterface | undefined {
    const databaseName = catalogsStorage.catalogDbName(catalog);
    if (!databaseName) return;

    return new PouchConnector(config).use(databaseName);
}

export async function importCatalogs(config: Config, catalogsStorage: CatalogsStorage, catalogs: Catalogs) {
    console.log('Importing catalogs');
    // tslint:disable-next-line:forin
    for (const catalogName in catalogs.data) {
        console.log(`Importing catalog ${catalogName}`);
        const db = catalogDb(config, catalogsStorage, catalogName);

        if (!db) {
            console.warn(
                `  Input file for catalog ${catalogName} is present, but such catalog DB is not configured, skipping.`);
            continue;
        }

        for (let doc of catalogs.data[catalogName] as any[]) {
            doc = cloneDeep(doc);
            doc._id = doc.id || doc.eventType;
            delete doc.id;
            await updateIfDifferent((db as PouchDb).db, doc);
        }
    }
}

const baseTestAccountIndex = 9000;

function getId(index: number): string {
    return (baseTestAccountIndex + index).toString();
}

export async function createAccount(db: PouchDB.Database, index: number) {
    let login = 't' + getId(index);
    let password = '1';
    const roles: string[] = [];
    // TODO: Get password from environment variable?
    if (index == 0) {
        login = 'admin';
        password = 'admin';
        roles.push('admin');
    }
    // First accounts get logins a, b, c, ..., z
    if (index > 0 && index <= 26) login = String.fromCharCode(96 + index);
    await updateIfDifferent(db,
    {
        _id: getId(index),
        login,
        password,
        roles,
    });
}

export async function createModel(db: PouchDB.Database, modelTemplate: any, index: number) {
    const model = cloneDeep(modelTemplate);
    model._id = getId(index);
    delete model._rev;
    await updateIfDifferent(db, model);
}

export async function createViewModel(db: PouchDB.Database, viewModelTemplate: any, index: number) {
    const viewModel = cloneDeep(viewModelTemplate);
    viewModel._id = getId(index);
    // TODO: Separate function for different viewmodels?
    if (viewModel.passportScreen != undefined)
        viewModel.passportScreen.id = getId(index);
    delete viewModel._rev;
    await updateIfDifferent(db, viewModel);
}

export async function createBalanceRecord(db: PouchDB.Database, index: number) {
    let doc = await getOrNull(db, 'balances');
    if (!doc) {
        doc = { _id: 'balances' };
    }
    doc[getId(index)] = 9000;
    await put(db, doc);
}
