import * as PouchDB from 'pouchdb';
// tslint:disable-next-line:no-var-requires
PouchDB.plugin(require('pouchdb-adapter-memory'));
import * as nock from 'nock';
import * as winston from 'winston';

import { expect } from 'chai';
import 'mocha';

import { TSMap } from 'typescript-map';
import App from './app';
import { PushSettings, ApplicationSettings } from './settings';

const port = 3000;

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('Mass push notifications', () => {

  let app: App;
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

  const eventsDb = new PouchDB('events', { adapter: 'memory' });
  const mobileViewModelDb = new PouchDB('viewmodel_mobile', { adapter: 'memory' });
  const defaultViewModelDb = new PouchDB('viewmodel_default', { adapter: 'memory' });
  const viewmodelDbs = new TSMap<string, PouchDB.Database<{ timestamp: number }>>
    ([['mobile', mobileViewModelDb],
    ['default', defaultViewModelDb]]);
  const accountsDb = new PouchDB('accounts', { adapter: 'memory' });
  const logger = new winston.Logger({ level: 'warning' });

  beforeEach(async () => {
    await mobileViewModelDb.put({
      _id: '00001', timestamp: testStartTime, mobile: true,
    });
    await defaultViewModelDb.put({
      _id: '00001', timestamp: testStartTime, mobile: false,
    });
    await defaultViewModelDb.put({
      _id: '00002', timestamp: testStartTime - 20000, mobile: false,
    });
    await mobileViewModelDb.put({
      _id: '00002', timestamp: testStartTime - 20000, mobile: true,
    });
    await defaultViewModelDb.put({
      _id: '00003', timestamp: testStartTime - 20000, mobile: false,
    });
    await mobileViewModelDb.put({
      _id: '00003', timestamp: testStartTime - 20000, mobile: true,
    });

    await accountsDb.put({
      _id: '00001',
      pushToken: '00001spushtoken',
    });
    await accountsDb.put({
      _id: '00002',
      pushToken: '00002spushtoken',
    });
    await accountsDb.put({
      _id: '00003',
    });
  });

  afterEach(async () => {
    app.stop();
    await accountsDb.destroy();
    await mobileViewModelDb.destroy();
    await defaultViewModelDb.destroy();
    await eventsDb.destroy();
  });

  it('Sends refresh notification to inactive users with push tokens', async () => {
    const fcm = nock('https://fcm.googleapis.com', { reqheaders: { authorization: 'key=fakeserverkey' } })
      .post('/fcm/send', (body) => body.to == '00002spushtoken')
      .reply(200);
    app = new App(logger, eventsDb, viewmodelDbs, accountsDb, settings);
    await app.listen(port);
    await delay(300);
    expect(fcm.isDone()).is.true;
  });
});
