import * as path from 'path';
import * as meow from 'meow';

import { DIInterface } from './di';
import { Config } from './config';
import { NanoConnector } from './db/nano';
import { Logger } from './logger';
import { WorkersPool } from './workers_pool';

import Manager from './manager';

const cli = meow(`
Usage
$ ${path.basename(__filename)} -c <path-to-config>
`);

if (!cli.flags.c) {
    cli.showHelp(1);
}

const CONFIG_PATH = cli.flags.c;

const config = require(CONFIG_PATH) as Config; // tslint:disable-line
const logger = new Logger(config.logger);

const di: DIInterface = {
    config,
    dbConnector: new NanoConnector(config.db.url),
    logger,
    workersPool: new WorkersPool(config.pool, logger)
};

let manager = new Manager(di);
