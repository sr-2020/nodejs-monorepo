import { Nano, NanoDocument } from "nano";
import { stdCallback } from "../utils";
import deepEqual = require('deep-equal')
import { CatalogsStorage, Catalogs } from "../catalogs_storage";
import { NanoDb, NanoConnector } from "../db/nano";
import { cloneDeep } from "lodash";

export function deepToString(doc: any) {
    let result: any = {};

    for (let k in doc) {
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

export async function createDbIfNotExists(connection: Nano, name: string): Promise<void> {
    const dbExists = await new Promise((resolve, reject) => {
        connection.db.get(name, (err, res) => resolve(!err))
    });

    if (!dbExists) {
        console.log(`Database ${name} is not present, creating`);
        await new Promise((resolve, reject) => {
            connection.db.create(name, stdCallback(resolve, reject));
        });
    } else {
        console.log(`Database ${name} already exists, skipping creation`);
    }
}

async function getOrNull(db: NanoDocument, id: string): Promise<any> {
    return new Promise((resolve, reject) => {
        db.get(id, {}, (err: any, data: any) => {
            if (err) {
                resolve();
            } else {
                resolve(data);
            }
        });
    });
}

async function put(db: NanoDocument, doc: any) {
    return new Promise((resolve, reject) => {
        db.insert(doc, {}, stdCallback(resolve, reject));
    });
}

export async function updateIfDifferent(db: NanoDocument, doc: any) {
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

function catalogDb(connection: Nano, catalogsStorage: CatalogsStorage, catalog: string): NanoDocument | undefined {
    let dbName = catalogsStorage.catalogDbName(catalog);
    if (!dbName) return;

    return connection.use(dbName);
}

export async function importCatalogs(connection: Nano, catalogsStorage: CatalogsStorage, catalogs: Catalogs) {
    console.log("Importing catalogs");
    for (let catalogName in catalogs.data) {
        console.log(`Importing catalog ${catalogName}`);
        let db = catalogDb(connection, catalogsStorage, catalogName);

        if (!db) {
            console.warn(`  Input file for catalog ${catalogName} is present, but such catalog DB is not configured, skipping.`);
            continue;
        }

        for (let doc of catalogs.data[catalogName] as any[]) {
            doc = cloneDeep(doc);
            doc._id = doc.id || doc.eventType;
            delete doc.id;
            await updateIfDifferent(db, doc);
        }
    }
}

const baseTestAccountIndex = 9000;

function getId(index: number): string {
    return (baseTestAccountIndex + index).toString();
}

export async function createAccount(db: NanoDocument, index: number) {
    await updateIfDifferent(db,
    {
        _id: getId(index),
        // First accounts get logins a, b, c, ..., z
        login: (index > 26) ? ('t' + getId(index)) : String.fromCharCode(97 + index),
        password: '1',
    });
}

export async function createModel(db: NanoDocument, modelTemplate: any, index: number) {
    const model = cloneDeep(modelTemplate);
    model._id = getId(index);
    delete model._rev;
    await updateIfDifferent(db, model);
}

export async function createViewModel(db: NanoDocument, viewModelTemplate: any, index: number) {
    const viewModel = cloneDeep(viewModelTemplate);
    viewModel._id = getId(index);
    viewModel.passportScreen.id = getId(index);
    delete viewModel._rev;
    await updateIfDifferent(db, viewModel);
}