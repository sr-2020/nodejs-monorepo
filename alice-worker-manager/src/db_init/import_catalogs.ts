/* tslint:disable no-var-requires no-console */

import * as path from 'path';
import * as meow from 'meow';
import * as glob from 'glob';
import * as Path from 'path';
import { isEmpty, cloneDeep } from 'lodash';
import { Config, CatalogsConfigDb } from '../config';
import { CatalogsStorage } from '../catalogs_storage';
import { NanoConnector, NanoDb } from '../db/nano';

const cli = meow(`
Usage
$ ${path.basename(__filename)} -c <path-to-config> <path-to-catalogs>
`);

if (!cli.input.length || !cli.flags.c) {
    cli.showHelp(1);
}

const CONFIG_PATH = cli.flags.c;
const CATALOGS_PATH = cli.input[0];

const config = require(CONFIG_PATH) as Config;

if (!('db' in config.catalogs)) {
    console.log('Catalogs db is not configured, exiting');
    process.exit(1);
}

const connection = new NanoConnector(config);
const catalogsStorage = new CatalogsStorage(config, connection);
const catalogs = catalogsStorage.loadFromFiles(CATALOGS_PATH);

if (isEmpty(catalogs.data)) {
    console.log('Empty catalogs, exiting');
    process.exit(1);
}

async function clearDb(db: NanoDb) {
    let docs = await db.list();

    for (let doc of docs.rows) {
        if (doc.id.startsWith('_design')) continue;

        await db.remove(doc.id, doc.value.rev);
    }
}

function catalogDb(catalog: string) {
    let dbName = catalogsStorage.catalogDbName(catalog);
    if (!dbName) return;

    return connection.use(dbName);
}

async function clearCatalogs() {
    let catalogsConfig = config.catalogs as CatalogsConfigDb;
    for (let catalog in catalogsConfig.db) {
        let db = catalogDb(catalog);
        if (!db) continue;
        await clearDb(db);
    }
}

async function importCatalogs() {
    for (let catalog in catalogs.data) {
        console.log(`Importing ${catalog}`);
        let db = catalogDb(catalog);

        if (!db) {
            console.log('  - not configured');
            continue;
        }

        for (let doc of catalogs.data[catalog] as any[]) {
            if (catalog != 'events' && !doc.id) continue;

            console.log(`... ${doc.id || doc.eventType}`);

            doc = cloneDeep(doc);
            doc._id = doc.id;
            delete doc.id;

            await db.put(doc);
        }
    }
}

clearCatalogs().then(importCatalogs).then(() => console.log('done.'));
