/* tslint:disable no-console */

import * as path from 'path';
import * as meow from 'meow';
import { Nano, NanoDatabase, NanoDocument } from 'nano';
import * as nano from 'nano';
import { stdCallback, requireDir, delay } from '../utils';
import { Config, CatalogsConfigDb } from '../config';
import { createDbIfNotExists, deepToString, updateIfDifferent, importCatalogs, createAccount, createModel, createViewModel, dbName, createBalanceRecord } from './util';
import { CatalogsStorage } from '../catalogs_storage';
import { NanoConnector } from '../db/nano';
import * as express from 'express';
import { getAllDesignDocs } from './design_docs_helper';

const cli = meow(`
Usage
$ ${path.basename(__filename)} -c <path-to-config>
`);

if (!cli.flags.c) {
    cli.showHelp(1);
}

const CONFIG_PATH = cli.flags.c;

const config = require(CONFIG_PATH) as Config;

const connection = nano(config.db.url);
const connector = new NanoConnector(config);

const dbNames: string[] = [
    '_global_changes', '_metadata', '_replicator', '_users',
    config.db.events, config.db.models, config.db.workingModels, config.db.accounts, config.db.economy
];

if (config.catalogs && ('db' in config.catalogs)) {
    const dbMappingConfig = (config.catalogs as CatalogsConfigDb).db;
    for (const dbName in dbMappingConfig)
        dbNames.push(dbMappingConfig[dbName]);
}

if (config.viewModels) {
    for (const dbName in config.viewModels)
        dbNames.push(config.viewModels[dbName]);
}

if (config.objects) {
    for (const dbName in config.objects)
        dbNames.push(config.objects[dbName]);
}

console.log("Following DBs should be present:");
console.log(dbNames);

const designDocs = getAllDesignDocs();
console.log("Found following design docs:");
console.log(designDocs.map((doc) => doc._id));

async function createDesignDoc(doc: any): Promise<void> {
    let dbNames = doc.dbs;
    delete (doc.dbs);
    const designDocFunctionsStringified = deepToString(doc);
    await Promise.all(dbNames.map(alias => updateIfDifferent(connection.use(dbName(config, alias)), designDocFunctionsStringified)));
}

async function createDesignDocs(): Promise<void> {
    await delay(10000);
    for (const ddoc of designDocs) {
        console.log(JSON.stringify(ddoc));
        await delay(3000);
        await createDesignDoc(ddoc);
    }
}


const catalogsPath = path.join(config.pool.workerArgs[0], '..', '..', 'catalogs');
const catalogsStorage = new CatalogsStorage(config, connector);
const catalogs = catalogsStorage.loadFromFiles(catalogsPath);
const dataSamplePath = path.join(process.cwd(), config.pool.workerArgs[0], '..', '..', 'data_samples');

async function createHumanSampleData() {
    const modelTemplate = require(path.join(dataSamplePath, 'model.json'));
    const viewModelTemplate = require(path.join(dataSamplePath, 'view-model.json'));
    console.log(`Using following templates: model=${JSON.stringify(modelTemplate)}, viewmodel=${JSON.stringify(viewModelTemplate)}`);
    for (let index = 0; index < 1000; ++index) {
        await Promise.all([
            createAccount(connection.use(config.db.accounts), index),
            createModel(connection.use(config.db.models), modelTemplate, index),
            createModel(connection.use(config.db.workingModels), modelTemplate, index),
            createViewModel(connection.use(config.viewModels['default']), viewModelTemplate, index),
            createBalanceRecord(connection.use(config.db.economy), index),
        ]);
    }
};

async function createMedicSampleData() {
    const medicModelTemplate = require(path.join(dataSamplePath, 'medic-model.json'));
    const medicViewModelTemplate = require(path.join(dataSamplePath, 'medic-view-model.json'));
    console.log(`Using following templates: medic-model=${JSON.stringify(medicModelTemplate)}, medic-viewmodel=${JSON.stringify(medicViewModelTemplate)}`);
    for (let index = 1000; index < 1010; ++index) {
        await Promise.all([
            createAccount(connection.use(config.db.accounts), index),
            createModel(connection.use(config.db.models), medicModelTemplate, index),
            createModel(connection.use(config.db.workingModels), medicModelTemplate, index),
            createViewModel(connection.use(config.viewModels['default']), medicViewModelTemplate, index),
        ]);
    }
}

async function createSampleData() {
    console.log("Creating sample data");
    await createHumanSampleData();
    await createMedicSampleData();
}

Promise.all(dbNames.map(name => createDbIfNotExists(connection, name)))
    .then(() => createDesignDocs())
    .then(() => importCatalogs(connection, catalogsStorage, catalogs))
    .then(() => createSampleData())
    .then(() => console.log('Done!'));


