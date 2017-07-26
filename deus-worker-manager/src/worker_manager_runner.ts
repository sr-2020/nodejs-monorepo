import * as path from 'path';
import * as meow from 'meow';

import { Injector } from './di';
import {
    ConfigToken, DBConnectorToken, ModelStorageToken, WorkingModelStorageToken, ViewModelStorageToken,
    EventStorageToken, EventsSourceToken, CatalogsStorageToken, ObjectStorageToken, LoggerToken, WorkersPoolToken,
    ProcessorFactoryToken, ManagerToken
} from './di_tokens';

import { Config } from './config';
import { DBConnectorInterface } from './db/interface';
import { NanoConnector } from './db/nano';
import { ModelStorage } from './model_storage';
import { ViewModelStorage } from './view_model_storage';
import { EventStorage } from './event_storage';
import { EventsSource } from './events_source';
import { CatalogsStorage } from './catalogs_storage';
import { ObjectStorage } from './object_storage';
import { Logger } from './logger';
import { WorkersPool } from './workers_pool';
import { processorFactory } from './processor';
import { Manager } from './manager';

const cli = meow(`
Usage
$ ${path.basename(__filename)} -c <path-to-config>
`);

if (!cli.flags.c) {
    cli.showHelp(1);
}

const CONFIG_PATH = cli.flags.c;

const config = require(CONFIG_PATH) as Config; // tslint:disable-line

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

const di = Injector
    .create()
    .bind(ConfigToken).toValue(config)
    .bind(LoggerToken).singleton().toClass(Logger, ConfigToken)
    .bind(DBConnectorToken).singleton().toClass(NanoConnector, ConfigToken)
    .bind(ModelStorageToken).singleton().toFactory(modelStorageFactory, ConfigToken, DBConnectorToken)
    .bind(WorkingModelStorageToken).singleton().toFactory(workingModelStorageFactory, ConfigToken, DBConnectorToken)
    .bind(ViewModelStorageToken).singleton().toClass(ViewModelStorage, ConfigToken, DBConnectorToken)
    .bind(EventStorageToken).singleton().toFactory(eventStorageFactory, ConfigToken, DBConnectorToken)
    .bind(EventsSourceToken).singleton().toFactory(eventsSourceFactory, ConfigToken, DBConnectorToken)
    .bind(CatalogsStorageToken).singleton().toClass(CatalogsStorage, ConfigToken, DBConnectorToken)
    .bind(ObjectStorageToken).singleton().toClass(ObjectStorage, ConfigToken, DBConnectorToken)
    .bind(WorkersPoolToken).singleton().toClass(WorkersPool, ConfigToken, LoggerToken)
    .bind(ProcessorFactoryToken).singleton().toFactory(processorFactory, WorkersPoolToken, EventStorageToken, ModelStorageToken, WorkingModelStorageToken, ViewModelStorageToken, ObjectStorageToken, LoggerToken)
    .bind(ManagerToken).singleton().toClass(Manager, ConfigToken, EventsSourceToken, CatalogsStorageToken, ModelStorageToken, EventStorageToken, WorkersPoolToken, ProcessorFactoryToken, LoggerToken);

const manager = di.get(ManagerToken);
manager.init().then(() => manager.retryAll());
