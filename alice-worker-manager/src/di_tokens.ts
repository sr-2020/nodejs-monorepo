import { token } from './di';

import { CatalogsStorageInterface } from './catalogs_storage';
import { Config } from './config';
import { DBConnectorInterface } from './db/interface';
import { EventStorage } from './event_storage';
import { EventsSource } from './events_source';
import { LoggerInterface } from './logger';
import { Manager } from './manager';
import { ModelStorage } from './model_storage';
import { ObjectStorageInterface } from './object_storage';
import { ProcessorFactory } from './processor';
import { ViewModelStorage } from './view_model_storage';
import { WorkersPoolInterface } from './workers_pool';

// tslint:disable:variable-name
export const ConfigToken = token<Config>('config');
export const DBConnectorToken = token<DBConnectorInterface>('dbConnector');
export const ModelStorageToken = token<ModelStorage>('modelStorage');
export const WorkingModelStorageToken = token<ModelStorage>('workingModelStorage');
export const ViewModelStorageToken = token<ViewModelStorage>('viewModelStorage');
export const EventStorageToken = token<EventStorage>('eventStorage');
export const EventsSourceToken = token<EventsSource>('eventsSource');
export const CatalogsStorageToken = token<CatalogsStorageInterface>('catalogsStorage');
export const ObjectStorageToken = token<ObjectStorageInterface>('objectStorage');
export const LoggerToken = token<LoggerInterface>('logger');
export const WorkersPoolToken = token<WorkersPoolInterface>('workersPool');
export const ProcessorFactoryToken = token<ProcessorFactory>('processorFactory');
export const ManagerToken = token<Manager>('manager');
// tslint:enable:variable-name
