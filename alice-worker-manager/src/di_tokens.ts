import { Token } from 'typedi';

import { CatalogsStorageInterface } from './catalogs_storage';
import { Config } from './config';
import { DBConnectorInterface } from './db/interface';
import { EventStorage } from './event_storage';
import { LoggerInterface } from './logger';
import { Manager } from './manager';
import { ModelStorageBase } from './model_storage';
import { ObjectStorageInterface } from './object_storage';
import { ProcessorFactory } from './processor';
import { SyncRequestsSource } from './sync_requests_source';
import { ViewModelStorage } from './view_model_storage';
import { WorkersPoolInterface } from './workers_pool';

// tslint:disable:variable-name
export const ConfigToken = new Token<Config>();
export const DBConnectorToken = new Token<DBConnectorInterface>();
export const ModelStorageToken = new Token<ModelStorageBase>('modelStorage');
export const WorkingModelStorageToken = new Token<ModelStorageBase>('workingModelStorage');
export const ViewModelStorageToken = new Token<ViewModelStorage>('viewModelStorage');
export const EventStorageToken = new Token<EventStorage>();
export const SyncRequestsSourceToken = new Token<SyncRequestsSource>();
export const CatalogsStorageToken = new Token<CatalogsStorageInterface>();
export const ObjectStorageToken = new Token<ObjectStorageInterface>();
export const LoggerToken = new Token<LoggerInterface>();
export const WorkersPoolToken = new Token<WorkersPoolInterface>();
export const ProcessorFactoryToken = new Token<ProcessorFactory>();
export const ManagerToken = new Token<Manager>();
// tslint:enable:variable-name
