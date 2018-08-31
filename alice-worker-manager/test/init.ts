import * as Pouch from 'pouchdb';
import * as MemoryAdapter from 'pouchdb-adapter-memory';

import { Container } from '../node_modules/typedi';
import { Config } from '../src/config';
import { initializeDI } from '../src/di';
import { ConfigToken, DBConnectorToken } from '../src/di_tokens';

Pouch.plugin(MemoryAdapter);

export const defaultConfig: Config = {
    db: {
        url: '',
        adapter: 'memory',
        events: 'events-test',
        models: 'models-test',
        metadata: 'metadata-test',
        workingModels: 'working-models-test',
        accounts: '',
        economy: '',
    },

    pool: {
        workerModule: '../alice-model-engine/src/worker_runner.ts',
        workerArgs: [__dirname + '/test-models/trivial/models'],
        options: {
            max: 2,
            min: 2,
        },
    },

    catalogs: {
        path: __dirname + '/test-models/trivial/catalogs',
    },

    objects: {
        counters: 'counters',
    },

    viewModels: { default: 'defaultViewModels' },

    logger: {
        default: {
            console: {
                level: 'warn',
                colorize: true,
            },
        },
    },

    processor: {
        deleteEventsOlderThanMs: 0,
    },
};

Object.freeze(defaultConfig);

export async function initDiAndDatabases(config: Config = defaultConfig) {
    initializeDI(config);
    await Container.get(DBConnectorToken).initViews();
}

export async function destroyDatabases() {
    const config = Container.get(ConfigToken);
    for (const alias of ['events', 'models', 'workingModels', 'metadata']) {
        await Container.get(DBConnectorToken).use(config.db[alias]).destroy();
    }
}
