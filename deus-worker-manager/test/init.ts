import { Injector } from '../src/di';

import {
    ConfigToken, DBConnectorToken, ModelStorageToken, WorkingModelStorageToken, ViewModelStorageToken,
    EventStorageToken, EventsSourceToken, LoggerToken, WorkersPoolToken, ProcessorFactoryToken, ManagerToken
} from '../src/di_tokens';

import { cloneDeep } from 'lodash';
import * as Pouch from 'pouchdb';
import * as MemoryAdapter from 'pouchdb-adapter-memory';

import { Config } from '../src/config';
import { DBConnectorInterface } from '../src/db/interface';
import { NanoConnector } from '../src/db/nano';
import { PouchConnector } from '../src/db/pouch';
import { ModelStorage } from '../src/model_storage';
import { ViewModelStorage } from '../src/view_model_storage';
import { EventStorage } from '../src/event_storage';
import { EventsSource } from '../src/events_source';
import { Logger, LoggerInterface } from '../src/logger';
import { WorkersPool, WorkersPoolInterface } from '../src/workers_pool';
import { processorFactory } from '../src/processor';
import { Manager } from '../src/manager';

Pouch.plugin(MemoryAdapter);

export const defaultConfig: Config = {
    db: {
        url: 'http://admin:admin@localhost:5984/',
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

export function initDb(config: Config) {
    if (process.env['__USE_REAL_DB']) {
        return new NanoConnector(config);
    } else {
        return new PouchConnector('memory');
    }
}

let counter = 0;

function modelStorageFactory(config: Config, dbConnector: DBConnectorInterface) {
    return new ModelStorage(dbConnector.use(config.db.models));
}

function workingModelStorageFactory(config: Config, dbConnector: DBConnectorInterface) {
    return new ModelStorage(dbConnector.use(config.db.workingModels));
}

function eventStorageFactory(config: Config, dbConnector: DBConnectorInterface) {
    return new EventStorage(dbConnector.use(config.db.events));
}

function eventsSourceFactory(config: Config, dbConnector: DBConnectorInterface) {
    return new EventsSource(dbConnector.use(config.db.events));
}

export function initDi(config: Config = defaultConfig) {
    config = cloneDeep(config);

    if (!process.env['__USE_REAL_DB']) {
        for (let alias in config.db) {
            config.db[alias] += '-' + counter;
        }
    }

    return Injector
        .create()
        .bind(ConfigToken).toValue(config)
        .bind(LoggerToken).singleton().toClass(Logger, ConfigToken)
        .bind(DBConnectorToken).singleton().toFactory(initDb, ConfigToken)
        .bind(ModelStorageToken).singleton().toFactory(modelStorageFactory, ConfigToken, DBConnectorToken)
        .bind(WorkingModelStorageToken).singleton().toFactory(workingModelStorageFactory, ConfigToken, DBConnectorToken)
        .bind(ViewModelStorageToken).singleton().toClass(ViewModelStorage, ConfigToken, DBConnectorToken)
        .bind(EventStorageToken).singleton().toFactory(eventStorageFactory, ConfigToken, DBConnectorToken)
        .bind(EventsSourceToken).singleton().toFactory(eventsSourceFactory, ConfigToken, DBConnectorToken)
        .bind(WorkersPoolToken).singleton().toClass(WorkersPool, ConfigToken, LoggerToken)
        .bind(ProcessorFactoryToken).singleton().toFactory(processorFactory, WorkersPoolToken, EventStorageToken, ModelStorageToken, WorkingModelStorageToken, ViewModelStorageToken, LoggerToken)
        .bind(ManagerToken).singleton().toClass(Manager, ConfigToken, EventsSourceToken, /* ModelStorageToken, WorkingModelStorageToken, ViewModelStorageToken, */ WorkersPoolToken, ProcessorFactoryToken, LoggerToken);
}
