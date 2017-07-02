import { Injector } from '../src/di';
import { ConfigToken, DBConnectorToken, LoggerToken, WorkersPoolToken, ManagerToken } from '../src/di_tokens';

import { cloneDeep } from 'lodash';
import * as Pouch from 'pouchdb';
import * as MemoryAdapter from 'pouchdb-adapter-memory';

import { Config } from '../src/config';
import { DBConnectorInterface } from '../src/db/interface';
import { PouchConnector } from '../src/db/pouch';
import { Logger, LoggerInterface } from '../src/logger';
import { WorkersPool, WorkersPoolInterface } from '../src/workers_pool';
import { Manager } from '../src/manager';

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

let counter = 0;

export function initDi(config: Config = defaultConfig) {
    config = cloneDeep(config);

    for (let alias in config.db) {
        config.db[alias] += '-' + counter;
    }

    return Injector
        .create()
        .bind(ConfigToken).toValue(config)
        .bind(LoggerToken).toClass(Logger, ConfigToken)
        .bind(DBConnectorToken).toValue(initDb())
        .bind(WorkersPoolToken).toClass(WorkersPool, ConfigToken, LoggerToken)
        .bind(ManagerToken).toClass(Manager, ConfigToken, DBConnectorToken, WorkersPoolToken, LoggerToken);
}
