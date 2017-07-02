import { token } from './di';

import { Config } from './config';
import { DBConnectorInterface } from './db/interface';
import { LoggerInterface } from './logger';
import { WorkersPoolInterface } from './workers_pool';
import { Manager } from './manager';

export const ConfigToken = token<Config>('config');
export const DBConnectorToken = token<DBConnectorInterface>('dbConnector');
export const LoggerToken = token<LoggerInterface>('logger');
export const WorkersPoolToken = token<WorkersPoolInterface>('workersPool');
export const ManagerToken = token<Manager>('manager');
