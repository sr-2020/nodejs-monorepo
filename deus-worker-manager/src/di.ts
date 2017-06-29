import { Config } from './config';
import { DBConnectorInterface } from './db/interface';
import { LoggerInterface } from './logger';
import { WorkersPoolInterface } from './workers_pool';

export interface DIInterface {
    config: Config;
    dbConnector: DBConnectorInterface;
    logger: LoggerInterface;
    workersPool: WorkersPoolInterface;
}
