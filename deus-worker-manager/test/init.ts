import { cloneDeep } from 'lodash';
import * as Pouch from 'pouchdb';
import * as MemoryAdapter from 'pouchdb-adapter-memory';

import { DIInterface } from '../src/di';
import { Config } from '../src/config';
import { PouchConnector } from '../src/db/pouch';
import { Logger, LoggerInterface } from '../src/logger';
import { WorkersPool } from '../src/workers_pool';
import Manager from '../src/manager';

Pouch.plugin(MemoryAdapter);

export const defaultConfig: Config = {
    db: {
        events: 'events-test',
        models: 'models-test',
        workingModels: 'working-models-test',
        viewModels: 'view-models-test'
    },

    pool: {
        workerModule: 'deus-model-engine/lib/worker_runner',
        workerArgs: [__dirname + '/test-models/trivial/models', '-c', __dirname + '/test-models/trivial/catalogs'],
        options: {
            max: 2,
            min: 2
        }
    },

    logger: {
        default: {
            console: {
                level: 'warn',
                colorize: true
            }
        }
    }
};

Object.freeze(defaultConfig);

export function initDb() {
    return new PouchConnector('memory');
}

export function initLogger(config: Config) {
    return new Logger(config.logger);
}

export function initPool(config: Config, logger: LoggerInterface) {
    return new WorkersPool(config.pool, logger);
}

let counter = 0;

export function initDi(config: Config = defaultConfig): DIInterface {
    let logger = initLogger(config);

    config = cloneDeep(config);

    for (let alias in config.db) {
        config.db[alias] += '-' + counter;
    }

    counter += 1;

    return {
        config,
        logger,
        dbConnector: initDb(),
        workersPool: initPool(config, logger)
    };
}
