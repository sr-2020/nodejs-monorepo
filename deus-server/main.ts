import * as PouchDB from 'pouchdb';
import { TypedJSON } from 'typedjson/js/typed-json';
import { TSMap } from 'typescript-map';
import * as winston from 'winston';
import App from './app';
import { Configuration } from './settings';

const logger = new winston.Logger({
  level: 'info',
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: 'log.txt' }),
  ],
});

// tslint:disable-next-line:no-var-requires
const configUnparsed = require('../configs/deus-server');

try {
  const config = TypedJSON.parse(JSON.stringify(configUnparsed), Configuration);
  const databasesConfig = config.databases;
  const authOptions = { auth: { username: databasesConfig.username, password: databasesConfig.password } };

  const viewmodelDbs = new TSMap<string, PouchDB.Database<{ timestamp: number }>>(
    databasesConfig.viewModels.map((v) => [v.type, new PouchDB(v.url, authOptions)]));

  new App(logger,
    new PouchDB(databasesConfig.events, authOptions),
    viewmodelDbs,
    new PouchDB(databasesConfig.accounts, authOptions),
    config.settings).listen(config.port);

} catch (e) {
  logger.error('Error during server startup: ' + e);
}
