import { cloneDeep, isEmpty } from 'lodash';
import * as meow from 'meow';
import * as path from 'path';
import { CatalogsStorage } from '../catalogs_storage';
import { CatalogsConfigDb, Config } from '../config';
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

// tslint:disable-next-line:no-var-requires
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
    const docs = await db.list();

    for (const doc of docs.rows) {
        if (doc.id.startsWith('_design')) continue;

        await db.remove(doc.id, doc.value.rev);
    }
}

function catalogDb(catalog: string) {
    const dbName = catalogsStorage.catalogDbName(catalog);
    if (!dbName) return;

    return connection.use(dbName);
}

async function clearCatalogs() {
    const catalogsConfig = config.catalogs as CatalogsConfigDb;
    // tslint:disable-next-line:forin
    for (const catalog in catalogsConfig.db) {
        const db = catalogDb(catalog);
        if (!db) continue;
        await clearDb(db);
    }
}

async function importCatalogs() {
    // tslint:disable-next-line:forin
    for (const catalog in catalogs.data) {
        console.log(`Importing ${catalog}`);
        const db = catalogDb(catalog);

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
