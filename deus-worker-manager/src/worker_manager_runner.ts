import * as path from 'path';
import * as meow from 'meow';

import { Injector } from './di';
import { ConfigToken, DBConnectorToken, LoggerToken, WorkersPoolToken, ManagerToken } from './di_tokens';

import { Config } from './config';
import { NanoConnector } from './db/nano';
import { Logger } from './logger';
import { WorkersPool } from './workers_pool';
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

const di = Injector
    .create()
    .bind(ConfigToken).toValue(config)
    .bind(LoggerToken).toClass(Logger, ConfigToken)
    .bind(DBConnectorToken).toClass(NanoConnector, ConfigToken)
    .bind(WorkersPoolToken).toClass(WorkersPool, ConfigToken, LoggerToken)
    .bind(ManagerToken).toClass(Manager, ConfigToken, DBConnectorToken, WorkersPoolToken, LoggerToken);

di.get(ManagerToken).init();
