import { cloneDeep } from 'lodash';
import * as Pouch from 'pouchdb';
import * as MemoryAdapter from 'pouchdb-adapter-memory';

import { Config } from '../src/config';
import { initializeDI } from '../src/di';

Pouch.plugin(MemoryAdapter);

export const defaultConfig: Config = {
    db: {
        url: '',
        adapter: 'memory',
        initViews: true,
        events: 'events-test',
        models: 'models-test',
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

const counter = 0;

export function initDi(config: Config = defaultConfig) {
    config = cloneDeep(config);

    for (const alias of ['events', 'models', 'workingModels']) {
        config.db[alias] += '-' + counter;
    }

    initializeDI(config);
}
