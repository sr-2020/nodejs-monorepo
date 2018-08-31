import Container from 'typedi';
import { CatalogsStorage } from './catalogs_storage';
import { Config } from './config';
import { PouchConnector } from './db/pouch';
import { CatalogsStorageToken, ConfigToken, DBConnectorToken,
  EventsSourceToken, EventStorageToken, LoggerToken, ManagerToken,
  ModelStorageToken, ObjectStorageToken, ProcessorFactoryToken,
  ViewModelStorageToken, WorkersPoolToken, WorkingModelStorageToken } from './di_tokens';
import { eventStorageFactory } from './event_storage';
import { eventsSourceFactory } from './events_source';
import { Logger } from './logger';
import { Manager } from './manager';
import { ModelStorage, WorkingModelStorage } from './model_storage';
import { ObjectStorage } from './object_storage';
import { processorFactory } from './processor';
import { ViewModelStorage } from './view_model_storage';
import { WorkersPool } from './workers_pool';

export function initializeDI(config: Config) {
  Container.reset();
  Container.set(ConfigToken, config);
  Container.set(LoggerToken, new Logger(Container.get(ConfigToken)));
  Container.set(DBConnectorToken, new PouchConnector(Container.get(ConfigToken)));
  Container.set(ModelStorageToken, new ModelStorage(Container.get(ConfigToken), Container.get(DBConnectorToken)));
  Container.set(WorkingModelStorageToken,
    new WorkingModelStorage(Container.get(ConfigToken), Container.get(DBConnectorToken)));
  Container.set(ViewModelStorageToken,
    new ViewModelStorage(Container.get(ConfigToken), Container.get(DBConnectorToken)));
  Container.set(EventStorageToken, eventStorageFactory(Container.get(ConfigToken), Container.get(DBConnectorToken)));
  Container.set(EventsSourceToken, eventsSourceFactory(Container.get(ConfigToken), Container.get(DBConnectorToken)));
  Container.set(CatalogsStorageToken, new CatalogsStorage(Container.get(ConfigToken), Container.get(DBConnectorToken)));
  Container.set(ObjectStorageToken, new ObjectStorage(Container.get(ConfigToken), Container.get(DBConnectorToken)));
  Container.set(WorkersPoolToken, new WorkersPool(Container.get(ConfigToken), Container.get(LoggerToken)));
  Container.set(ProcessorFactoryToken,
    processorFactory(Container.get(ConfigToken),
    Container.get(WorkersPoolToken),
    Container.get(EventStorageToken),
    Container.get(ModelStorageToken),
    Container.get(WorkingModelStorageToken),
    Container.get(ViewModelStorageToken),
    Container.get(ObjectStorageToken),
    Container.get(LoggerToken)));
  Container.set(ManagerToken, new Manager(
    Container.get(EventsSourceToken),
    Container.get(CatalogsStorageToken),
    Container.get(WorkersPoolToken),
    Container.get(ProcessorFactoryToken),
    Container.get(LoggerToken)));
}
