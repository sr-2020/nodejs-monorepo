import * as PouchDB from 'pouchdb';
import { TSMap } from 'typescript-map';
import * as winston from 'winston';
import App from './app';
import { ApplicationSettingsToken } from './services/settings';
import Elasticsearch = require('winston-elasticsearch');
import { config } from './config';
import { LoggerInterface, LoggerToken, WinstonLogger } from './services/logger'
import * as rp from 'request-promise';
import { DatabasesContainer, DatabasesContainerToken } from './services/db-container';
import { Container, Token } from "typedi";

const databasesConfig = config.databases;
const authOptions = { auth: { username: databasesConfig.username, password: databasesConfig.password } };

const viewmodelDbs = new TSMap<string, PouchDB.Database<{ timestamp: number }>>(
  databasesConfig.viewModels.map((v) => [v.type, new PouchDB(v.url, authOptions)]));


Container.set(DatabasesContainerToken, new DatabasesContainer(
  new PouchDB(databasesConfig.accounts, authOptions),
  new PouchDB(databasesConfig.models, authOptions),
  viewmodelDbs,
  new PouchDB(databasesConfig.events, authOptions),
  new PouchDB(databasesConfig.economy, authOptions)
));
Container.set(LoggerToken, new WinstonLogger({
  level: 'info',
  transports: [
    new (winston.transports.Console)(),
    new (Elasticsearch)({ level: "debug", clientOpts: { host: 'elasticsearch:9200' } }),
  ],
}));
Container.set(ApplicationSettingsToken, config.settings);

process.on('unhandledRejection', (reason, p) => {
  Container.get(LoggerToken).error(`Unhandled Rejection at: Promise ${p.toString()} reason: ${reason.toString()}`, reason.stack);
});

if (databasesConfig.compactEventsViewEveryMs) {
  setInterval(async () => {
    await rp.post(`${databasesConfig.events}/_compact/character`, { auth: authOptions.auth, json: {} });
  }, databasesConfig.compactEventsViewEveryMs);
}

Container.get(DatabasesContainerToken).createIndices().then(() => {
  new App().listen();
  Container.get(LoggerToken).info('Ready to accept requests.', { source: 'api' });
});
