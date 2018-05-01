import * as PouchDB from 'pouchdb';
// tslint:disable-next-line:no-var-requires
PouchDB.plugin(require('pouchdb-adapter-memory'));
import * as nock from 'nock';
import * as winston from 'winston';

import { expect } from 'chai';
import 'mocha';

import { TSMap } from 'typescript-map';
import { Container } from "typedi";

import App from '../app';
import { ApplicationSettings, PushSettings, CheckForInactivitySettings,
  ApplicationSettingsToken } from '../services/settings';
import { DatabasesContainer, DatabasesContainerToken } from '../services/db-container';
import { LoggerToken, WinstonLogger } from "../services/logger";
import { TestDatabasesContainer } from './test-db-container';

const port = 3000;

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('Mass push notifications', () => {

  let app: App;
  let dbContainer: TestDatabasesContainer;
  const testStartTime: number = new Date().valueOf();

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

    await dbContainer.viewModelDb('mobile').put({
      _id: '00001', timestamp: testStartTime, mobile: true,
    });
    await dbContainer.viewModelDb('default').put({
      _id: '00001', timestamp: testStartTime, mobile: false,
    });
    await dbContainer.viewModelDb('default').put({
      _id: '00002', timestamp: testStartTime - 20000, mobile: false,
    });
    await dbContainer.viewModelDb('mobile').put({
      _id: '00002', timestamp: testStartTime - 20000, mobile: true,
    });
    await dbContainer.viewModelDb('default').put({
      _id: '00003', timestamp: testStartTime - 20000, mobile: false,
    });
    await dbContainer.viewModelDb('mobile').put({
      _id: '00003', timestamp: testStartTime - 20000, mobile: true,
    });

    await dbContainer.accountsDb().put({
      _id: '00001',
      pushToken: '00001spushtoken',
      password: ''
    });
    await dbContainer.accountsDb().put({
      _id: '00002',
      pushToken: '00002spushtoken',
      password: ''
    });
    await dbContainer.accountsDb().put({
      _id: '00003',
      password: ''
    });
    await dbContainer.createViews();
    Container.set(DatabasesContainerToken, dbContainer);
  });

  afterEach(async () => {
    app.stop();
    await dbContainer.destroyDatabases();
  });

  it('Sends refresh notification to inactive users with push tokens', async () => {
    const fcm = nock('https://fcm.googleapis.com', { reqheaders: { authorization: 'key=fakeserverkey' } })
      .post('/fcm/send', (body) => body.to == '00002spushtoken')
      .reply(200);

    app = new App();
    await app.listen(port);
    await delay(300);
    expect(fcm.isDone()).is.true;
  });

  it('Does not send notifications after allowed time', async () => {
    (settings.pushSettings.autoRefresh as CheckForInactivitySettings).allowFromHour = new Date().getHours() + 1;
    (settings.pushSettings.autoRefresh as CheckForInactivitySettings).allowToHour = 25;
    app = new App();
    await app.listen(port);
    await delay(300);
  });

  it('Does not send notifications before allowed time', async () => {
    (settings.pushSettings.autoRefresh as CheckForInactivitySettings).allowFromHour = -1;
    (settings.pushSettings.autoRefresh as CheckForInactivitySettings).allowToHour = new Date().getHours() - 1;
    app = new App();
    await app.listen(port);
    await delay(300);
  });

});
