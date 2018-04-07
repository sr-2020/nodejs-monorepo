import * as PouchDB from 'pouchdb';
import { TypedJSON } from 'typedjson/js/typed-json';
import { TSMap } from 'typescript-map';
import * as waitOn from 'wait-on';
import * as winston from 'winston';
import { LoggingWinston } from '@google-cloud/logging-winston';
import App from './app';
import { Configuration } from './settings';
import Elasticsearch = require('winston-elasticsearch');
import { config } from './config';

const loggingWinston = new LoggingWinston();

try {
  const databasesConfig = config.databases;
  const authOptions = { auth: { username: databasesConfig.username, password: databasesConfig.password } };

  const requiredUrls = databasesConfig.viewModels.map((v) => v.url);
  requiredUrls.push(databasesConfig.events, databasesConfig.accounts);
  requiredUrls.push('http://elasticsearch:9200');

  const opts = {
    resources: requiredUrls,
  };

  waitOn(opts, (err) => {
    if (err)
      throw err;
    else {
      const logger = new winston.Logger({
        level: 'info',
        transports: [
          new (winston.transports.Console)(),
          new (Elasticsearch)({ level: "debug", clientOpts: { host: 'elasticsearch:9200' } }),
        ],
      });

      const viewmodelDbs = new TSMap<string, PouchDB.Database<{ timestamp: number }>>(
        databasesConfig.viewModels.map((v) => [v.type, new PouchDB(v.url, authOptions)]));

      new App(logger,
        new PouchDB(databasesConfig.events, authOptions),
        viewmodelDbs,
        new PouchDB(databasesConfig.accounts, authOptions),
        config.settings).listen(config.port);

      logger.info('Ready to accept requests.');
    }
  });
} catch (e) {
  console.error('Error during server startup: ' + e);
}
