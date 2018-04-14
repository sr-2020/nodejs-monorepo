/* tslint:disable no-console */

import * as path from 'path';
import * as meow from 'meow';
import { Nano, NanoDatabase, NanoDocument } from 'nano';
import * as nano from 'nano';
import * as glob from 'glob';
import * as Path from 'path';
import { stdCallback, requireDir } from '../utils';
import { Config, CatalogsConfigDb } from '../config';
import { createDbIfNotExists, deepToString, updateIfDifferent, importCatalogs, createAccount, createModel, createViewModel } from './util';
import { CatalogsStorage } from '../catalogs_storage';
import { NanoConnector } from '../db/nano';
import * as express from 'express';

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

const dbNames: string[] = [config.db.events, config.db.models, config.db.workingModels, config.db.accounts];

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

const designDocs = glob.sync(Path.join(__dirname, 'design_docs', '*.js'))
    .map((f) => Path.basename(f, Path.extname(f)));

console.log("Found following design docs:");
console.log(designDocs);

async function createDesignDoc(docName: string): Promise<void> {
    const designDocObject = require('./design_docs/' + docName);
    const designDocFunctionsStringified = deepToString(designDocObject);
    designDocFunctionsStringified._id = `_design/${docName}`;
    let dbNames = designDocObject.dbs;
    delete (designDocFunctionsStringified.dbs);
    await Promise.all(dbNames.map(dbName => updateIfDifferent(connection.use(dbName), designDocFunctionsStringified)));
}

const catalogsPath = Path.join(config.pool.workerArgs[0], '..', '..', 'catalogs');
const catalogsStorage = new CatalogsStorage(config, connector);
const catalogs = catalogsStorage.loadFromFiles(catalogsPath);
const dataSamplePath = Path.join(process.cwd(), config.pool.workerArgs[0], '..', '..', 'data_samples');

async function createSampleData() {
    const modelTemplate = require(Path.join(dataSamplePath, 'model.json'));
    const viewModelTemplate = require(Path.join(dataSamplePath, 'view-model.json'));
    for (let index = 0; index < 100; ++index) {
        await Promise.all([
            createAccount(connection.use(config.db.accounts), index),
            createModel(connection.use(config.db.models), modelTemplate, index),
            // TODO: Support case of many viewmodel
            createViewModel(connection.use(config.viewModels['default']), viewModelTemplate, index)
        ]);
    }
}

Promise.all(dbNames.map(name => createDbIfNotExists(connection, name)))
    .then(() => Promise.all(designDocs.map(createDesignDoc)))
    .then(() => importCatalogs(connection, catalogsStorage, catalogs))
    .then(() => createSampleData())
    .then(() => {
        const app = express();
        app.get('/', (req, res) => res.status(200).send('Done!'));
        app.listen(80);
    })
    .then(() => console.log('Done!'))


