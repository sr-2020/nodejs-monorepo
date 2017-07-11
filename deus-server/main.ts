import * as PouchDB from 'pouchdb';
import { TSMap } from 'typescript-map';
import * as winston from 'winston';
import App from './app';

// tslint:disable-next-line:no-var-requires
const config = require('../configs/deus-server');

const authOptions = { auth: { username: config.username, password: config.password } };

const viewmodelDbs = new TSMap<string, PouchDB.Database<{ timestamp: number }>>(
        config.dbs.viewModels.map((v) => [v[0], new PouchDB(v[1], authOptions)]));

const logger = new winston.Logger({
      level: 'info',
      transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: 'log.txt' }),
      ],
    });

new App(logger,
        new PouchDB(config.dbs.events, authOptions),
        viewmodelDbs,
        new PouchDB(config.dbs.accounts, authOptions),
        config.viewmodelUpdateTimeout).listen(config.port);
