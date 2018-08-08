import * as PouchDB from 'pouchdb';
import * as PouchDBUpsert from 'pouchdb-upsert';
PouchDB.plugin(PouchDBUpsert);

import 'mocha';

import { Container } from 'typedi';

import App from '../app';
import { DatabasesContainerToken } from '../services/db-container';
import { LoggerToken, WinstonLogger } from '../services/logger';
import { ApplicationSettings, ApplicationSettingsToken, PushSettings } from '../services/settings';

import { TestDatabasesContainer } from './test-db-container';

import { getBalanceTest } from './economy.balance';
import { getTransferTest } from './economy.transfer';

const address = `http://localhost:3000`;

describe('Economy', () => {

  let app: App;
  let dbContainer: TestDatabasesContainer;

  const pushSettings: PushSettings = {
    autoRefresh: {
      notifyIfInactiveForMoreThanMs: 10000, performOncePerMs: 160,
    },
    serverKey: 'fakeserverkey',
  };

  const settings: ApplicationSettings = {
    port: 3000, viewmodelUpdateTimeout: 20, accessGrantTime: 200,
    tooFarInFutureFilterTime: 30000, pushSettings,
  };
  Container.set(ApplicationSettingsToken, settings);
  Container.set(LoggerToken, new WinstonLogger({ level: 'warning' }));

  async function addAccount(id: string, login: string, password: string, balance: number) {
    await dbContainer.accountsDb().post({ _id: id, login, password });
    await dbContainer.economyDb().upsert('balances', (doc) => {
      doc[id] = balance;
      return doc;
    });
  }

  beforeEach(async () => {
    dbContainer = new TestDatabasesContainer();

    await addAccount('00001', 'first', '1', 1000);
    await addAccount('00002', 'second', '2', 1000);
    await dbContainer.createViews();
    Container.set(DatabasesContainerToken, dbContainer);

    app = new App();
    await app.listen();
  });

  afterEach(async () => {
    app.stop();
    await dbContainer.destroyDatabases();
  });

  getBalanceTest(address);
  getTransferTest(address);

});
