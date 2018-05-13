import * as PouchDB from 'pouchdb';
import * as rp from 'request-promise';
// tslint:disable-next-line:no-var-requires
PouchDB.plugin(require('pouchdb-adapter-memory'));

import * as winston from 'winston';

import { expect } from 'chai';
import 'mocha';

import { TSMap } from 'typescript-map';
import { Container } from "typedi";

import App from '../app';
import { PushSettings, ApplicationSettings } from '../services/settings';
import { DatabasesContainer, DatabasesContainerToken } from '../services/db-container';
import { LoggerToken, WinstonLogger } from "../services/logger";
import { ApplicationSettingsToken } from "../services/settings";
import { TestDatabasesContainer } from './test-db-container';

const address = 'http://localhost:3000';

describe('API Server - long timeout', () => {
  let app: App;
  let dbContainer: TestDatabasesContainer;

  beforeEach(async () => {
    Container.set(LoggerToken, new WinstonLogger({ level: 'warning' }));
    const pushSettings: PushSettings = { serverKey: 'fakeserverkey' };
    const settings: ApplicationSettings = {
      port: 3000, viewmodelUpdateTimeout: 9000, accessGrantTime: 1000,
      tooFarInFutureFilterTime: 30000, pushSettings,
    };
    Container.set(ApplicationSettingsToken, settings);
    dbContainer = new TestDatabasesContainer();
    Container.set(DatabasesContainerToken, dbContainer);
    app = new App();
    await app.listen();
    await dbContainer.viewModelDb('mobile').put({ _id: '00001', timestamp: 420, updatesCount: 0 });
    await dbContainer.accountsDb().put({ _id: '00001', login: 'some_user', password: 'qwerty' });
    await dbContainer.createViews();
  });

  afterEach(async () => {
    app.stop();
    await dbContainer.destroyDatabases();
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
    const events = await dbContainer.allEventsSortedByTimestamp();
    expect(events.length).to.eq(1);
    expect(events[0].doc).to.deep.include(event);
    expect(events[0].doc).to.deep.include({ characterId: '00001' });
  });
});

describe('API Server - medium timeout', () => {
  let app: App;
  let dbContainer: TestDatabasesContainer;

  beforeEach(async () => {
    Container.set(LoggerToken, new WinstonLogger({ level: 'warning' }));
    const pushSettings: PushSettings = { serverKey: 'fakeserverkey' };
    const settings: ApplicationSettings = {
      port: 3000, viewmodelUpdateTimeout: 500, accessGrantTime: 1000,
      tooFarInFutureFilterTime: 30000, pushSettings,
    };
    Container.set(ApplicationSettingsToken, settings);
    dbContainer = new TestDatabasesContainer();
    Container.set(DatabasesContainerToken, dbContainer);
    app = new App();
    await app.listen();
    await dbContainer.viewModelDb('mobile').put({ _id: '00001', timestamp: 420, updatesCount: 0 });
    await dbContainer.accountsDb().put({ _id: '00001', login: 'some_user', password: 'qwerty' });
    await dbContainer.createViews();
  });

  afterEach(async () => {
    app.stop();
    await dbContainer.destroyDatabases();
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
