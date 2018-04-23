import * as PouchDB from 'pouchdb';
import { TypedJSON } from 'typedjson/js/typed-json';
import { TSMap } from 'typescript-map';
import * as winston from 'winston';
import App from './app';
import { Configuration } from './settings';
import Elasticsearch = require('winston-elasticsearch');
import { config } from './config';
import { LoggerInterface, LoggerToken, WinstonLogger } from './services/logger'
import * as rp from 'request-promise';
import { DatabasesContainer } from './services/db-container';
import { Container, Token } from "typedi";

const databasesConfig = config.databases;
const authOptions = { auth: { username: databasesConfig.username, password: databasesConfig.password } };

Container.set(LoggerToken, new WinstonLogger({
  level: 'info',
  transports: [
    new (winston.transports.Console)(),
    new (Elasticsearch)({ level: "debug", clientOpts: { host: 'elasticsearch:9200' } }),
  ],
}));

process.on('unhandledRejection', (reason, p) => {
  Container.get(LoggerToken).error(`Unhandled Rejection at: Promise ${p.toString()} reason: ${reason.toString()}`, reason.stack);
});

const viewmodelDbs = new TSMap<string, PouchDB.Database<{ timestamp: number }>>(
  databasesConfig.viewModels.map((v) => [v.type, new PouchDB(v.url, authOptions)]));

new App(
  new DatabasesContainer(
    new PouchDB(databasesConfig.events, authOptions),
    viewmodelDbs,
    new PouchDB(databasesConfig.accounts, authOptions)
  ),
  config.settings).listen(config.port);

if (databasesConfig.compactEventsViewEveryMs) {
  setInterval(async () => {
    await rp.post(`${databasesConfig.events}/_compact/character`, { auth: authOptions.auth, json: {} });
  }, databasesConfig.compactEventsViewEveryMs);
}


Container.get(LoggerToken).info('Ready to accept requests.', { source: 'api' });
