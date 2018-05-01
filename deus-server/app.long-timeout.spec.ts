import * as PouchDB from 'pouchdb';
import * as rp from 'request-promise';
// tslint:disable-next-line:no-var-requires
PouchDB.plugin(require('pouchdb-adapter-memory'));

import * as winston from 'winston';

import { expect } from 'chai';
import 'mocha';

import { TSMap } from 'typescript-map';
import App from './app';
import { PushSettings, ApplicationSettings } from './services/settings';
import { createViews } from './test-helper';
import { DatabasesContainer, DatabasesContainerToken } from './services/db-container';
import { LoggerToken, WinstonLogger } from "./services/logger";
import { Container } from "typedi";
import { ApplicationSettingsToken } from "./services/settings";

const port = 3000;
const address = 'http://localhost:' + port;

describe('API Server - long timeout', () => {
  let app: App;
  let eventsDb: PouchDB.Database<{ characterId: string, eventType: string, timestamp: number, data: any }>;
  let viewModelDb: PouchDB.Database<{ timestamp: number, updatesCount: number }>;
  let accountsDb: PouchDB.Database<{ password: string }>;
  let economyDb = new PouchDB('economy', { adapter: 'memory' });
  beforeEach(async () => {
    eventsDb = new PouchDB('events2', { adapter: 'memory' });
    viewModelDb = new PouchDB('viewmodel2', { adapter: 'memory' });
    const viewmodelDbs = new TSMap<string, PouchDB.Database<{ timestamp: number }>>([['mobile', viewModelDb]]);
    accountsDb = new PouchDB('accounts2', { adapter: 'memory' });
    Container.set(LoggerToken, new WinstonLogger({ level: 'warning' }));
    const pushSettings: PushSettings = { username: 'pushadmin', password: 'pushpassword', serverKey: 'fakeserverkey' };
    const settings: ApplicationSettings = {
      viewmodelUpdateTimeout: 9000, accessGrantTime: 1000,
      tooFarInFutureFilterTime: 30000, pushSettings,
    };
    Container.set(ApplicationSettingsToken, settings);
    Container.set(DatabasesContainerToken, new DatabasesContainer(eventsDb, viewmodelDbs, accountsDb, economyDb));
    app = new App();
    await app.listen(port);
    await viewModelDb.put({ _id: '00001', timestamp: 420, updatesCount: 0 });
    await accountsDb.put({ _id: '00001', login: 'some_user', password: 'qwerty' });
    await createViews(accountsDb, viewModelDb, eventsDb);
  });

  afterEach(async () => {
    app.stop();
    await accountsDb.destroy();
    await viewModelDb.destroy();
    await eventsDb.destroy();
  });

  it('Does not wait for viewmodel update', async () => {
    const event = {
      eventType: 'NonMobile',
      timestamp: 4365,
    };
    const response = await rp.post(address + '/events/some_user',
      {
        resolveWithFullResponse: true, json: { events: [event] },
        auth: { username: 'some_user', password: 'qwerty' },
      }).promise();

    expect(response.statusCode).to.eq(202);
    const res = await eventsDb.allDocs({ include_docs: true });
    const events = res.rows.filter((row) => row.doc && row.doc.characterId);
    expect(events.length).to.eq(1);
    expect(events[0].doc).to.deep.include(event);
    expect(events[0].doc).to.deep.include({ characterId: '00001' });
  });
});

describe('API Server - medium timeout', () => {
  let app: App;
  let eventsDb: PouchDB.Database<{ characterId: string, eventType: string, timestamp: number, data: any }>;
  let viewModelDb: PouchDB.Database<{ timestamp: number, updatesCount: number }>;
  let accountsDb: PouchDB.Database<{ password: string }>;
  let economyDb = new PouchDB('economy', { adapter: 'memory' });
  beforeEach(async () => {
    eventsDb = new PouchDB('events3', { adapter: 'memory' });
    viewModelDb = new PouchDB('viewmodel3', { adapter: 'memory' });
    const viewmodelDbs = new TSMap<string, PouchDB.Database<{ timestamp: number }>>([['mobile', viewModelDb]]);
    accountsDb = new PouchDB('accounts3', { adapter: 'memory' });
    Container.set(LoggerToken, new WinstonLogger({ level: 'warning' }));
    const pushSettings: PushSettings = { username: 'pushadmin', password: 'pushpassword', serverKey: 'fakeserverkey' };
    const settings: ApplicationSettings = {
      viewmodelUpdateTimeout: 500, accessGrantTime: 1000,
      tooFarInFutureFilterTime: 30000, pushSettings,
    };
    Container.set(ApplicationSettingsToken, settings);
    Container.set(DatabasesContainerToken, new DatabasesContainer(eventsDb, viewmodelDbs, accountsDb, economyDb));
    app = new App();
    await app.listen(port);
    await viewModelDb.put({ _id: '00001', timestamp: 420, updatesCount: 0 });
    await accountsDb.put({ _id: '00001', login: 'some_user', password: 'qwerty' });
    await createViews(accountsDb, viewModelDb, eventsDb);
  });

  afterEach(async () => {
    app.stop();
    await accountsDb.destroy();
    await viewModelDb.destroy();
    await eventsDb.destroy();
  });

  it('Forbids two simultaneous mobile connections', async () => {
    const responses: any[] = await Promise.all([
      rp.post(address + '/events/some_user',
      {
        resolveWithFullResponse: true, simple: false, json: { events: [{
          eventType: '_RefreshModel',
          timestamp: 4365,
        }]},
        auth: { username: 'some_user', password: 'qwerty' },
      }).promise(),
      rp.post(address + '/events/some_user',
      {
        resolveWithFullResponse: true, simple: false, json: { events: [{
          eventType: '_RefreshModel',
          timestamp: 4370,
        }]},
        auth: { username: 'some_user', password: 'qwerty' },
      }).promise()
    ]);

    if (responses[0].statusCode == 429) {
      // Swap to make response[0] successful one
      [responses[0], responses[1]] = [responses[1], responses[0]];
    }

    expect(responses[0].statusCode).to.eq(202);
    expect(responses[1].statusCode).to.eq(429);
  });
});
