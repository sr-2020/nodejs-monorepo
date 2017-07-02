import { token } from './di';

import { Config } from './config';
import { DBConnectorInterface } from './db/interface';
import { ModelStorage } from './model_storage';
import { ViewModelStorage } from './view_model_storage';
import { EventStorage } from './event_storage';
import { EventsSource } from './events_source';
import { LoggerInterface } from './logger';
import { WorkersPoolInterface } from './workers_pool';
import { ProcessorFactory } from './processor';
import { Manager } from './manager';

export const ConfigToken = token<Config>('config');
export const DBConnectorToken = token<DBConnectorInterface>('dbConnector');
export const ModelStorageToken = token<ModelStorage>('modelStorage');
export const WorkingModelStorageToken = token<ModelStorage>('workingModelStorage');
export const ViewModelStorageToken = token<ViewModelStorage>('viewModelStorage');
export const EventStorageToken = token<EventStorage>('eventStorage');
export const EventsSourceToken = token<EventsSource>('eventsSource');
export const LoggerToken = token<LoggerInterface>('logger');
export const WorkersPoolToken = token<WorkersPoolInterface>('workersPool');
export const ProcessorFactoryToken = token<ProcessorFactory>('processorFactory');
export const ManagerToken = token<Manager>('manager');
