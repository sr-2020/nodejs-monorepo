import * as meow from 'meow';
import * as path from 'path';

import { Injector } from './di';
import {
    CatalogsStorageToken, ConfigToken, DBConnectorToken, EventsSourceToken, EventStorageToken,
    LoggerToken, ManagerToken, ModelStorageToken, ObjectStorageToken, ProcessorFactoryToken, ViewModelStorageToken,
    WorkersPoolToken, WorkingModelStorageToken,
} from './di_tokens';

import { CatalogsStorage } from './catalogs_storage';
import { Config } from './config';
import { DBConnectorInterface } from './db/interface';
import { PouchConnector } from './db/pouch';
import { EventStorage } from './event_storage';
import { EventsSource } from './events_source';
import { Logger } from './logger';
import { Manager } from './manager';
import { ModelStorage } from './model_storage';
import { ObjectStorage } from './object_storage';
import { processorFactory } from './processor';
import { ViewModelStorage } from './view_model_storage';
import { WorkersPool } from './workers_pool';

const cli = meow(`
Usage
$ ${path.basename(__filename)} -c <path-to-config>
`);

if (!cli.flags.c) {
    cli.showHelp(1);
}

const CONFIG_PATH = cli.flags.c;

const config = require(CONFIG_PATH) as Config; // tslint:disable-line

function modelStorageFactory(c: Config, dbConnector: DBConnectorInterface) {
    return new ModelStorage(dbConnector.use(c.db.models));
}

function workingModelStorageFactory(c: Config, dbConnector: DBConnectorInterface) {
    return new ModelStorage(dbConnector.use(c.db.workingModels));
}

function eventStorageFactory(c: Config, dbConnector: DBConnectorInterface) {
    return new EventStorage(dbConnector.use(c.db.events));
}

function eventsSourceFactory(c: Config, dbConnector: DBConnectorInterface) {
    return new EventsSource(dbConnector.use(c.db.events));
}

const di = Injector
    .create()
    .bind(ConfigToken).toValue(config)
    .bind(LoggerToken).singleton().toClass(Logger, ConfigToken)
    .bind(DBConnectorToken).singleton().toClass(PouchConnector, ConfigToken)
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

const requiredDbNames = [config.db.events, config.db.models, config.db.workingModels];
if (config.catalogs && ('db' in config.catalogs)) {
    // tslint:disable-next-line:forin
    for (const catalog in config.catalogs.db) {
        requiredDbNames.push(config.catalogs.db[catalog]);
    }
}
// tslint:disable-next-line:forin
for (const viewModel in config.viewModels) {
    requiredDbNames.push(config.viewModels[viewModel]);
}

const manager = di.get(ManagerToken);
manager.init().then(() => manager.retryAll());
