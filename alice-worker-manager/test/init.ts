import { Injector } from '../src/di';

import {
    CatalogsStorageToken, ConfigToken, DBConnectorToken, EventsSourceToken, EventStorageToken,
    LoggerToken, ManagerToken, ModelStorageToken, ObjectStorageToken, ProcessorFactoryToken, ViewModelStorageToken,
    WorkersPoolToken, WorkingModelStorageToken,
} from '../src/di_tokens';

import { cloneDeep } from 'lodash';
import * as Pouch from 'pouchdb';
import * as MemoryAdapter from 'pouchdb-adapter-memory';

import { CatalogsStorage } from '../src/catalogs_storage';
import { Config } from '../src/config';
import { DBConnectorInterface } from '../src/db/interface';
import { PouchConnector } from '../src/db/pouch';
import { EventStorage } from '../src/event_storage';
import { EventsSource } from '../src/events_source';
import { Logger } from '../src/logger';
import { Manager } from '../src/manager';
import { ModelStorage } from '../src/model_storage';
import { ObjectStorage } from '../src/object_storage';
import { processorFactory } from '../src/processor';
import { ViewModelStorage } from '../src/view_model_storage';
import { WorkersPool } from '../src/workers_pool';

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

export function initDb(config: Config): DBConnectorInterface {
    return new PouchConnector(config);
}

const counter = 0;

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

    for (const alias of ['events', 'models', 'workingModels']) {
        config.db[alias] += '-' + counter;
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
        .bind(CatalogsStorageToken).singleton().toClass(CatalogsStorage, ConfigToken, DBConnectorToken)
        .bind(ObjectStorageToken).singleton().toClass(ObjectStorage, ConfigToken, DBConnectorToken)
        .bind(WorkersPoolToken).singleton().toClass(WorkersPool, ConfigToken, LoggerToken)
        .bind(ProcessorFactoryToken).singleton().toFactory(
            processorFactory, ConfigToken, WorkersPoolToken, EventStorageToken, ModelStorageToken,
            WorkingModelStorageToken, ViewModelStorageToken, ObjectStorageToken, LoggerToken)
        .bind(ManagerToken).singleton().toClass(
            Manager, ConfigToken, EventsSourceToken, CatalogsStorageToken, ModelStorageToken,
            EventStorageToken, WorkersPoolToken, ProcessorFactoryToken, LoggerToken);
}
