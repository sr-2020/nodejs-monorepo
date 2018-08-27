/* tslint:disable no-console */
import * as meow from 'meow';
import * as nano from 'nano';
import * as path from 'path';
import { CatalogsStorage } from '../catalogs_storage';
import { CatalogsConfigDb, Config } from '../config';
import { NanoConnector } from '../db/nano';
import { delay } from '../utils';
import { getAllDesignDocs } from './design_docs_helper';
import { createAccount, createBalanceRecord, createDbIfNotExists, createModel,
    createViewModel, dbName, deepToString, importCatalogs, updateIfDifferent } from './util';

const cli = meow(`
Usage
$ ${path.basename(__filename)} -c <path-to-config>
`);

if (!cli.flags.c) {
    cli.showHelp(1);
}

const CONFIG_PATH = cli.flags.c;

// tslint:disable-next-line:no-var-requires
const config = require(CONFIG_PATH) as Config;

const connection = nano(config.db.url);
const connector = new NanoConnector(config);

const databasesNames: string[] = [
    '_global_changes', '_metadata', '_replicator', '_users',
    config.db.events, config.db.models, config.db.workingModels, config.db.accounts, config.db.economy,
];

if (config.catalogs && ('db' in config.catalogs)) {
    const dbMappingConfig = (config.catalogs as CatalogsConfigDb).db;
    // tslint:disable-next-line:no-shadowed-variable
    for (const databaseName in dbMappingConfig)
        databasesNames.push(dbMappingConfig[databaseName]);
}

if (config.viewModels) {
    for (const databaseName in config.viewModels)
        databasesNames.push(config.viewModels[databaseName]);
}

if (config.objects) {
    for (const databaseName in config.objects)
        databasesNames.push(config.objects[databaseName]);
}

console.log('Following DBs should be present:');
console.log(databasesNames);

const designDocs = getAllDesignDocs();
console.log('Found following design docs:');
console.log(designDocs.map((doc) => doc._id));

async function dropEventsDb(): Promise<void> {
    await new Promise((resolve) => {
        connection.db.destroy(config.db.events, (err) => resolve(err));
    });
}

async function createDesignDoc(doc: any): Promise<void> {
    const dbNames = doc.dbs;
    delete (doc.dbs);
    const designDocFunctionsStringified = deepToString(doc);
    await Promise.all(dbNames.map(
        (alias) => updateIfDifferent(connection.use(dbName(config, alias)), designDocFunctionsStringified)));
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
    console.log(`Using following templates:\n` +
        `model=${JSON.stringify(modelTemplate)}\n` +
        `viewmodel=${JSON.stringify(viewModelTemplate)}`);
    for (let index = 0; index < 150; ++index) {
        await Promise.all([
            createAccount(connection.use(config.db.accounts), index),
            createModel(connection.use(config.db.models), modelTemplate, index),
            createModel(connection.use(config.db.workingModels), modelTemplate, index),
            createViewModel(connection.use(config.viewModels.default), viewModelTemplate, index),
            createBalanceRecord(connection.use(config.db.economy), index),
        ]);
    }
}

async function createMedicSampleData() {
    const medicModelTemplate = require(path.join(dataSamplePath, 'medic-model.json'));
    const medicViewModelTemplate = require(path.join(dataSamplePath, 'medic-view-model.json'));
    console.log(`Using following templates:\n` +
        `medic-model=${JSON.stringify(medicModelTemplate)}\n` +
        `medic-viewmodel=${JSON.stringify(medicViewModelTemplate)}`);
    for (let index = 1000; index < 1010; ++index) {
        await Promise.all([
            createAccount(connection.use(config.db.accounts), index),
            createModel(connection.use(config.db.models), medicModelTemplate, index),
            createModel(connection.use(config.db.workingModels), medicModelTemplate, index),
            createViewModel(connection.use(config.viewModels.default), medicViewModelTemplate, index),
        ]);
    }
}

async function createSampleData() {
    console.log('Creating sample data');
    await createHumanSampleData();
    await createMedicSampleData();
}

async function run(): Promise<void> {
    await dropEventsDb();
    await Promise.all(databasesNames.map((name) => createDbIfNotExists(connection, name)));
    await createDesignDocs();
    await importCatalogs(connection, catalogsStorage, catalogs);
    await createSampleData();
}

run().then(() => console.log('Done!'));
