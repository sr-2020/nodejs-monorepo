import * as winston from 'winston';
import * as rp from 'request-promise';

import { expect } from 'chai';
import 'mocha';

import { Container } from "typedi";

import App from '../app';
import { ApplicationSettings, PushSettings, CheckForInactivitySettings,
  ApplicationSettingsToken } from '../services/settings';
import { DatabasesContainerToken } from '../services/db-container';
import { LoggerToken, WinstonLogger } from "../services/logger";
import { TestDatabasesContainer } from './test-db-container';
import { currentTimestamp } from '../utils';

const port = 3000;
const address = `http://localhost:${port}` 

 describe('Economy', () => {

  let app: App;
  let dbContainer: TestDatabasesContainer;
  const testStartTime: number = currentTimestamp()

  const pushSettings: PushSettings = {
    username: 'pushadmin', password: 'pushpassword', serverKey: 'fakeserverkey',
    autoRefresh: {
      notifyIfInactiveForMoreThanMs: 10000, performOncePerMs: 160,
    },
  };

  const settings: ApplicationSettings = {
    viewmodelUpdateTimeout: 20, accessGrantTime: 200,
    tooFarInFutureFilterTime: 30000, pushSettings,
  };
  Container.set(ApplicationSettingsToken, settings);
  Container.set(LoggerToken, new WinstonLogger({ level: 'warning' }));

  beforeEach(async () => {
    dbContainer = new TestDatabasesContainer();

    await dbContainer.accountsDb().put({
      _id: '00001',
      login: 'first',
      password: '1'
    });
    await dbContainer.accountsDb().put({
      _id: '00002',
      login: 'second',
      password: '2'
    });
    await dbContainer.createViews();
    Container.set(DatabasesContainerToken, dbContainer);
    
    app = new App();
    await app.listen(port);
  });

  afterEach(async () => {
    app.stop();
    await dbContainer.destroyDatabases();
  });

  it('Can get balance', async () => {
    const response = await rp.get(address + '/economy/first',
    {
      resolveWithFullResponse: true, json: {},
      auth: { username: 'first', password: '1' },
    }).promise();
    expect(response.statusCode).to.eq(200);
    expect(response.body).to.deep.equal({balance: 0});
  });

});
