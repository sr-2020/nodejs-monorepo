import * as PouchDB from 'pouchdb';
import * as rp from 'request-promise';
// tslint:disable-next-line:no-var-requires
PouchDB.plugin(require('pouchdb-adapter-memory'));
import * as nock from 'nock';
import * as winston from 'winston';

import { expect } from 'chai';
import 'mocha';

import { TSMap } from 'typescript-map';
import { Container } from "typedi";

import App from '../app';
import { characterIdTimestampOnlyRefreshesView } from '../consts';
import { DatabasesContainer, DatabasesContainerToken, DatabasesContainerInterface } from '../services/db-container';
import { currentTimestamp } from '../utils';
import { LoggerToken, WinstonLogger } from "../services/logger";
import { ApplicationSettingsToken, PushSettings, ApplicationSettings } from "../services/settings";
import { TestDatabasesContainer } from './test-db-container';

const address = 'http://localhost:3000';

// Express spams console on errors if it's not set.
// See https://github.com/expressjs/express/blob/c0136d8b48dd3526c58b2ad8666fb4b12b55116c/lib/application.js#L630
// and https://github.com/mochajs/mocha/issues/185
process.env.NODE_ENV = 'test'

/*

There are following characters present in this test:
id     login                      password  comment

00001  some_user                  qwerty    Has viewmodel, timestamp = 420. Also have push token.
00002  some_other_user            asdfg     Has viewmodel, timestamp = 10000.

55555  user_without_model         hunter2   Has no viewmodel, used to test for corresponding 404 errors

10001  some_lab_technician        research  Has access to some_user methods
10002  some_fired_lab_technician  beer      Had access to some_user methods, now it's expired
10003  some_hired_lab_technician  wowsocool Will get access to some_lab_technician methods

*/

describe('API Server', () => {
  let app: App;
  let testStartTime: number;
  let dbContainer: TestDatabasesContainer;

  beforeEach(async () => {
    Container.set(LoggerToken, new WinstonLogger({ level: 'warn' }));
    const pushSettings: PushSettings = { serverKey: 'fakeserverkey' };
    const settings: ApplicationSettings = {
      port: 3000, viewmodelUpdateTimeout: 20, accessGrantTime: 1000,
      tooFarInFutureFilterTime: 30000, pushSettings,
    };
    Container.set(ApplicationSettingsToken, settings);
    dbContainer = new TestDatabasesContainer();
    Container.set(DatabasesContainerToken, dbContainer);
    app = new App();
    await app.listen();

    await dbContainer.viewModelDb('default').put({
      _id: '00001', timestamp: 420,
      updatesCount: 0, mobile: false,
    });
    await dbContainer.viewModelDb('mobile').put({
      _id: '00001', timestamp: 420,
      updatesCount: 0, mobile: true,
    });
    await dbContainer.viewModelDb('model').put({
      _id: '00001', timestamp: 420,
      location: 'ship_BSG',
    });

    await dbContainer.viewModelDb('default').put({
      _id: '00002', timestamp: 10000,
      updatesCount: 0, mobile: false,
    });
    await dbContainer.viewModelDb('mobile').put({
      _id: '00002', timestamp: 10000,
      updatesCount: 0, mobile: true,
    });
    await dbContainer.viewModelDb('model').put({
      _id: '00002', timestamp: 10000,
      location: 'ship_MilleniumFalcon',
    });

    await dbContainer.accountsDb().put({ _id: '10001', login: 'some_lab_technician', password: 'research' });
    await dbContainer.accountsDb().put({ _id: '10002', login: 'some_fired_lab_technician', password: 'beer' });
    await dbContainer.accountsDb().put({ _id: '10003', login: 'some_hired_lab_technician', password: 'wowsocool' });
    await dbContainer.accountsDb().put({ _id: '99999', login: 'admin', password: 'admin', roles: ['admin'] });

    testStartTime = currentTimestamp();
    await dbContainer.accountsDb().put({
      _id: '00001',
      login: 'some_user',
      password: 'qwerty',
      pushToken: '00001spushtoken',
      access: [
        { id: '10002', timestamp: testStartTime - 1 },
        { id: '10001', timestamp: testStartTime + 60000 },
      ],
    });
    await dbContainer.accountsDb().put({ _id: '00002', login: 'some_other_user', password: 'asdfg' });
    await dbContainer.accountsDb().put({ _id: '55555', login: 'user_without_model', password: 'hunter2' });

    await dbContainer.createViews();
  });

  afterEach(async () => {
    app.stop();
    await dbContainer.destroyDatabases();
  });

  describe('/time', () => {
    it('Returns approximately current time', async () => {
      const response = await rp.get(address + '/time',
        { resolveWithFullResponse: true, json: { events: [] } }).promise();
      expect(response.statusCode).to.eq(200);
      expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
      expect(response.body.serverTime).to.be.approximately(new Date().valueOf(), 1000);
    });
  });

  describe('GET /viewmodel', () => {

    it('Returns mobile viewmodel of existing character if mobile type is provided', async () => {
      const response = await rp.get(address + '/viewmodel/some_user?type=mobile',
        {
          resolveWithFullResponse: true, json: {},
          auth: { username: 'some_user', password: 'qwerty' },
        }).promise();
      expect(response.statusCode).to.eq(200);
      expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
      expect(response.body.serverTime).to.be.approximately(new Date().valueOf(), 1000);
      expect(response.body.id).to.equal('00001');
      expect(response.body.viewModel).to.deep.equal({ timestamp: 420, updatesCount: 0, mobile: true });
    });

    it('Returns default viewmodel of existing character if no type provided. Use login.', async () => {
      const response = await rp.get(address + '/viewmodel/some_user',
        {
          resolveWithFullResponse: true, json: {},
          auth: { username: 'some_user', password: 'qwerty' },
        }).promise();
      expect(response.statusCode).to.eq(200);
      expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
      expect(response.body.serverTime).to.be.approximately(new Date().valueOf(), 1000);
      expect(response.body.id).to.equal('00001');
      expect(response.body.viewModel).to.deep.equal({ timestamp: 420, updatesCount: 0, mobile: false });
    });

    it('Returns default viewmodel of existing character if no type provided. Use id.', async () => {
      const response = await rp.get(address + '/viewmodel/00001',
        {
          resolveWithFullResponse: true, json: {},
          auth: { username: '00001', password: 'qwerty' },
        }).promise();
      expect(response.statusCode).to.eq(200);
      expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
      expect(response.body.serverTime).to.be.approximately(new Date().valueOf(), 1000);
      expect(response.body.id).to.equal('00001');
      expect(response.body.viewModel).to.deep.equal({ timestamp: 420, updatesCount: 0, mobile: false });
    });

    it('Returns 404 for non-existent viewmodel type', async () => {
      const response = await rp.get(address + '/viewmodel/some_user?type=foo',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: 'some_user', password: 'qwerty' },
        }).promise();
      expect(response.statusCode).to.eq(404);
      expect(response.body.message).to.eq('Viewmodel type is not found');
    });

    it('Returns 404 for сharacter not existing in accounts DB', async () => {
      const response = await rp.get(address + '/viewmodel/4444',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: '4444', password: '4444' },
        }).promise();
      expect(response.statusCode).to.eq(404);
      expect(response.body.message).to.eq('Character with such id or login is not found');
    });

    it('Returns 404 for сharacter existing accounts DB, but not viewmodel DB', async () => {
      const response = await rp.get(address + '/viewmodel/user_without_model',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: 'user_without_model', password: 'hunter2' },
        }).promise();
      expect(response.statusCode).to.eq(404);
      expect(response.body.message).to.eq('Character with such id or login is not found');
    });

    it('Returns 401 and WWW-Authenticate if no credentials ', async () => {
      const response = await rp.get(address + '/viewmodel/some_user',
        {
          resolveWithFullResponse: true, simple: false, json: {},
        }).promise();
      expect(response.statusCode).to.eq(401);
      expect(response.headers['WWW-Authenticate']).not.to.be.null;
    });

    it('Returns 401 and WWW-Authenticate if wrong credentials ', async () => {
      const response = await rp.get(address + '/viewmodel/some_user',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: 'some_user', password: 'wrong one' },
        }).promise();
      expect(response.statusCode).to.eq(401);
      expect(response.headers['WWW-Authenticate']).not.to.be.null;
    });

    it('Returns 401 and WWW-Authenticate if querying user not providing access ', async () => {
      const response = await rp.get(address + '/viewmodel/some_user',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: 'user_without_model', password: 'hunter2' },
        }).promise();
      expect(response.statusCode).to.eq(401);
      expect(response.headers['WWW-Authenticate']).not.to.be.null;
    });

    it('Returns 401 and WWW-Authenticate if access to user expired ', async () => {
      const response = await rp.get(address + '/viewmodel/some_user',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: 'some_fired_lab_technician', password: 'beer' },
        }).promise();
      expect(response.statusCode).to.eq(401);
      expect(response.headers['WWW-Authenticate']).not.to.be.null;
    });

    it('Admin can access anybody', async () => {
      const response = await rp.get(address + '/viewmodel/some_user',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: 'admin', password: 'admin' },
        }).promise();
      expect(response.statusCode).to.eq(200);
    });

    it('Returns default viewmodel of existing character if accessed by technician', async () => {
      const response = await rp.get(address + '/viewmodel/some_user',
        {
          resolveWithFullResponse: true, json: {},
          auth: { username: 'some_lab_technician', password: 'research' },
        }).promise();
      expect(response.statusCode).to.eq(200);
      expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
      expect(response.body.serverTime).to.be.approximately(new Date().valueOf(), 1000);
      expect(response.body.id).to.equal('00001');
      expect(response.body.viewModel).to.deep.equal({ timestamp: 420, updatesCount: 0, mobile: false });
    });
  });

  describe('POST /events', () => {
    it('Returns 400 if no events field present', async () => {
      const response = await rp.post(address + '/events/some_user',
        {
          resolveWithFullResponse: true, simple: false, json: { foo: 'bar' },
          auth: { username: 'some_user', password: 'qwerty' },
        }).promise();
      expect(response.statusCode).to.eq(400);
    });

    it('Returns 400 if events field is not an array', async () => {
      const response = await rp.post(address + '/events/some_user',
        {
          resolveWithFullResponse: true, simple: false, json: { events: { foo: 'bar' } },
          auth: { username: 'some_user', password: 'qwerty' },
        }).promise();
      expect(response.statusCode).to.eq(400);
    });

    it('Returns 404 for сharacter not existing in accounts DB', async () => {
      const response = await rp.post(address + '/events/4444',
        {
          resolveWithFullResponse: true, simple: false, json: { events: [] },
          auth: { username: '4444', password: '4444' },
        }).promise();
      expect(response.statusCode).to.eq(404);
      expect(response.body.message).to.eq('Character with such id or login is not found');
    });

    it('Returns 404 for сharacter existing accounts DB, but not viewmodel DB', async () => {
      const response = await rp.post(address + '/events/user_without_model',
        {
          resolveWithFullResponse: true, simple: false, json: { events: [] },
          auth: { username: 'user_without_model', password: 'hunter2' },
        }).promise();
      expect(response.statusCode).to.eq(404);
      expect(response.body.message).to.eq('Character with such id or login is not found');
    });

    it('Returns 401 and WWW-Authenticate if no credentials ', async () => {
      const response = await rp.post(address + '/events/some_user',
        {
          resolveWithFullResponse: true, simple: false, json: {},
        }).promise();
      expect(response.statusCode).to.eq(401);
      expect(response.headers['WWW-Authenticate']).not.to.be.null;
    });

    it('Returns 401 and WWW-Authenticate if wrong credentials ', async () => {
      const response = await rp.post(address + '/events/some_user',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: 'some_user', password: 'wrong one' },
        }).promise();
      expect(response.statusCode).to.eq(401);
      expect(response.headers['WWW-Authenticate']).not.to.be.null;
    });

    it('Returns 401 and WWW-Authenticate if querying user not providing access', async () => {
      const response = await rp.post(address + '/events/some_user',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: 'user_without_model', password: 'hunter2' },
        }).promise();
      expect(response.statusCode).to.eq(401);
      expect(response.headers['WWW-Authenticate']).not.to.be.null;
    });

    it('Sets proper header', async () => {
      const response = await rp.post(address + '/events/some_user',
        {
          resolveWithFullResponse: true, json: { events: [] },
          auth: { username: 'some_user', password: 'qwerty' },
        }).promise();
      expect(response.statusCode).to.eq(202);
      expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
    });

    it('Puts event into db', async () => {
      const event = {
        eventType: '_RefreshModel',
        timestamp: 4365,
        data: { foo: 'ambar' },
      };
      const response = await rp.post(address + '/events/some_user',
        {
          resolveWithFullResponse: true, json: { events: [event] },
          auth: { username: 'some_user', password: 'qwerty' },
        }).promise();

      expect(response.statusCode).to.eq(202);
      const docs = await dbContainer.eventsDb().query(characterIdTimestampOnlyRefreshesView, { include_docs: true });
      expect(docs.rows.length).to.equal(1);
      const doc: any = docs.rows[0].doc;
      expect(doc).to.deep.include(event);
      expect(doc).to.deep.include({ characterId: '00001' });
    });

    it('Puts only last _RefreshModel event to db', async () => {
      const events = [{
        eventType: '_RefreshModel',
        timestamp: 4365,
      },
      {
        eventType: 'TestEvent',
        timestamp: 4366,
      },
      {
        eventType: '_RefreshModel',
        timestamp: 4367,
      }]
      const response = await rp.post(address + '/events/some_user',
        {
          resolveWithFullResponse: true, json: { events },
          auth: { username: 'some_user', password: 'qwerty' },
        }).promise();

      expect(response.statusCode).to.eq(202);
      const docs = await dbContainer.allEventsSortedByTimestamp();
      expect(docs.length).to.equal(2);
      expect(docs[0].doc).to.deep.include(events[1]);
      expect(docs[1].doc).to.deep.include(events[2]);
    });

    it('Puts only last _RefreshModel event to db - 2', async () => {
      const events = [
        {
          eventType: 'TestEvent',
          timestamp: 4365,
        },
        {
          eventType: '_RefreshModel',
          timestamp: 4366,
        },
        {
          eventType: 'TestEvent',
          timestamp: 4367,
        },
        {
          eventType: '_RefreshModel',
          timestamp: 4368,
        }];
      const response = await rp.post(address + '/events/some_user',
        {
          resolveWithFullResponse: true, json: { events },
          auth: { username: 'some_user', password: 'qwerty' },
        }).promise();

      expect(response.statusCode).to.eq(202);
      const docs = await dbContainer.allEventsSortedByTimestamp();
      expect(docs.length).to.equal(3);
      expect(docs[0].doc).to.deep.include(events[0]);
      expect(docs[1].doc).to.deep.include(events[2]);
      expect(docs[2].doc).to.deep.include(events[3]);
    });

    it('Puts only last _RefreshModel event to db - 3', async () => {
      const events = [
        {
          eventType: '_RefreshModel',
          timestamp: 4365,
        },
        {
          eventType: '_RefreshModel',
          timestamp: 4366,
        },
        {
          eventType: '_RefreshModel',
          timestamp: 4367,
        },
        {
          eventType: '_RefreshModel',
          timestamp: 4368,
        }];
      const response = await rp.post(address + '/events/some_user',
        {
          resolveWithFullResponse: true, json: { events },
          auth: { username: 'some_user', password: 'qwerty' },
        }).promise();

      expect(response.statusCode).to.eq(202);
      const docs = await dbContainer.allEventsSortedByTimestamp();
      expect(docs.length).to.equal(1);
      expect(docs[0].doc).to.deep.include(events[3]);
    });

    it('Filters out tokenUpdated events', async () => {
      const events = [{
        eventType: 'tokenUpdated',
        timestamp: 4365,
        // tslint:disable-next-line:max-line-length
        data: { token: 'cFA60K00jtY:APA91bGtjF4t8R4hEiu7Z1oowRU1ZH8YQaL2HwjhuY4mIO9yD1gKcxEX8l6c2vEtRn4fGxgQnqzTwmMq8wQ15Vpve6QbQAOMm-ds1qwXKED1HABlhxinnQFVKWKty7dlhEQsnpA0w9ye' },
      },
      {
        eventType: '_RefreshModel',
        timestamp: 4565,
        data: { foo: 'ambar' },
      }];

      const response = await rp.post(address + '/events/some_user',
        {
          resolveWithFullResponse: true, json: { events },
          auth: { username: 'some_user', password: 'qwerty' },
        }).promise();

      expect(response.statusCode).to.eq(202);
      const docs = await dbContainer.eventsDb().query(characterIdTimestampOnlyRefreshesView, { include_docs: true });
      expect(docs.rows.length).to.equal(1);
      const doc: any = docs.rows[0].doc;
      expect(doc).to.deep.include(events[1]);
      expect(doc).to.deep.include({ characterId: '00001' });
    });

    it('Filters _RefreshModels too far in future', async () => {
      const timestamp = currentTimestamp() + 60000;
      const events = [{
        eventType: 'TestEvent',
        timestamp: timestamp,
      },
      {
        eventType: '_RefreshModel',
        timestamp: timestamp + 1,
      }];
      const response = await rp.post(address + '/events/some_user',
        {
          resolveWithFullResponse: true, json: { events },
          auth: { username: 'some_user', password: 'qwerty' },
        }).promise();

      expect(response.statusCode).to.eq(202);
      const docs = await dbContainer.allEventsSortedByTimestamp();
      expect(docs.length).to.equal(1);
      const doc: any = docs[0].doc;
      expect(doc).to.deep.include(events[0]);
      expect(doc).to.deep.include({ characterId: '00001' });
    });

    it('Returns viewmodel in case if processed in time', async () => {
      const event = {
        eventType: '_RefreshModel',
        timestamp: 4365,
      };
      dbContainer.eventsDb().changes({ since: 'now', live: true, include_docs: true }).on('change', (change) => {
        if (change.doc) {
          const changeDoc = change.doc;
          const viewModelDb = dbContainer.viewModelDb('mobile') as PouchDB.Database<any>;
          viewModelDb.get('00001').then((doc) => {
            viewModelDb.put({
              _id: '00001',
              _rev: doc._rev,
              timestamp: changeDoc.timestamp,
              updatesCount: doc.updatesCount + 1,
            });
          });
        }
      });

      const response = await rp.post(address + '/events/some_user',
        {
          resolveWithFullResponse: true, json: { events: [event] },
          auth: { username: 'some_user', password: 'qwerty' },
        }).promise();
      expect(response.statusCode).to.eq(200);
      expect(response.body.serverTime).to.be.approximately(new Date().valueOf(), 1000);
      expect(response.body.id).to.equal('00001');
      expect(response.body.viewModel).to.deep.equal({ timestamp: 4365, updatesCount: 1 });
    });

    it('Returns Accepted in case if not processed in time', async () => {
      const event = {
        eventType: 'TestEvent',
        timestamp: 4365,
      };

      const response = await rp.post(address + '/events/some_user',
        {
          resolveWithFullResponse: true, json: { events: [event] },
          auth: { username: 'some_user', password: 'qwerty' },
        }).promise();

      expect(response.statusCode).to.eq(202);
      expect(response.body.serverTime).to.be.approximately(new Date().valueOf(), 1000);
      expect(response.body.id).to.equal('00001');
      expect(response.body.timestamp).to.equal(4365);
    });

    it('Returns timestamp of latest event successfully saved', async () => {
      const events = [{
        eventType: 'TestEvent',
        timestamp: 4365,
      }, {
        eventType: 'TestEvent',
        timestamp: 6666,
      }];

      const response = await rp.post(address + '/events/some_user',
        {
          resolveWithFullResponse: true, json: { events: events },
          auth: { username: 'some_user', password: 'qwerty' },
        }).promise();

      expect(response.statusCode).to.eq(202);
      expect(response.body.serverTime).to.be.approximately(new Date().valueOf(), 1000);
      expect(response.body.id).to.equal('00001');
      expect(response.body.timestamp).to.equal(6666);
    });

    it('Handles multiple simultaneous connections from same non-mobile client', async () => {
      const event = {
        eventType: 'TestEvent',
        timestamp: 4365,
      };

      const promises: any[] = [];
      for (let i = 0; i < 20; ++i)
        promises.push(rp.post(address + '/events/some_user',
          {
            resolveWithFullResponse: true, simple: false, json: { events: [event] },
            auth: { username: 'some_user', password: 'qwerty' },
          }).promise());

      const resultStatuses = (await Promise.all(promises)).map((result) => result.statusCode);
      const expectedStatuses = Array(20).fill(202);
      expect(resultStatuses).to.deep.equal(expectedStatuses);
      const res = await dbContainer.allEventsSortedByTimestamp();
      expect(res.length).to.eq(20);
    });

    it('Handles mobile + non-mobile connection simultaneously', async () => {
      const mobileEvent = {
        eventType: '_RefreshModel',
        timestamp: 4364,
      };
      const promises: any[] = [
        rp.post(address + '/events/some_user',
          {
            resolveWithFullResponse: true, simple: false, json: { events: [mobileEvent] },
            auth: { username: 'some_user', password: 'qwerty' },
          }).promise()
      ];

      const event = {
        eventType: 'TestEvent',
        timestamp: 4365,
      };
      for (let i = 0; i < 20; ++i)
        promises.push(rp.post(address + '/events/some_user',
          {
            resolveWithFullResponse: true, simple: false, json: { events: [event] },
            auth: { username: 'some_user', password: 'qwerty' },
          }).promise());

      const resultStatuses = (await Promise.all(promises)).map((result) => result.statusCode);
      const expectedStatuses = Array(21).fill(202);
      expect(resultStatuses).to.deep.equal(expectedStatuses);
      const events = await dbContainer.allEventsSortedByTimestamp();
      expect(events.length).to.eq(21);
    });

    it('Handles multiple sequential connections from same client', async () => {
      const event = {
        eventType: 'TestEvent',
        timestamp: 4365,
      };

      const response1 = await rp.post(address + '/events/some_user',
        {
          resolveWithFullResponse: true, simple: false, json: { events: [event] },
          auth: { username: 'some_user', password: 'qwerty' },
        }).promise();
      const response2 = await rp.post(address + '/events/some_user',
        {
          resolveWithFullResponse: true, simple: false, json: { events: [event] },
          auth: { username: 'some_user', password: 'qwerty' },
        }).promise();
      expect(response1.statusCode).to.eq(202);
      expect(response2.statusCode).to.eq(202);
    });

    it('Deduplicates events with same timestamp', async () => {
      const event = {
        eventType: '_RefreshModel',
        timestamp: 4365,
      };

      const response1 = await rp.post(address + '/events/some_user',
        {
          resolveWithFullResponse: true, simple: false, json: { events: [event] },
          auth: { username: 'some_user', password: 'qwerty' },
        }).promise();
      const response2 = await rp.post(address + '/events/some_user',
        {
          resolveWithFullResponse: true, simple: false, json: { events: [event] },
          auth: { username: 'some_user', password: 'qwerty' },
        }).promise();
      expect(response1.statusCode).to.eq(202);
      expect(response2.statusCode).to.eq(202);

      const res = await dbContainer.eventsDb().allDocs({ include_docs: true });
      // Filter design-docs
      const events = await dbContainer.allEventsSortedByTimestamp();
      expect(events.length).to.eq(1);
    });

    it('Returns 409 if trying to submit non-mobile event into past', async () => {
      const event = {
        eventType: 'TestEvent',
        timestamp: 100, // < 420
      };

      const response = await rp.post(address + '/events/some_user',
        {
          resolveWithFullResponse: true, simple: false, json: { events: [event] },
          auth: { username: 'some_user', password: 'qwerty' },
        }).promise();
      expect(response.statusCode).to.eq(409);
    });
  });

  describe('GET /events', () => {
    it('Returns 404 for сharacter not existing in accounts DB', async () => {
      const response = await rp.get(address + '/events/4444',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: '4444', password: '4444' },
        }).promise();
      expect(response.statusCode).to.eq(404);
      expect(response.body.message).to.eq('Character with such id or login is not found');
    });

    it('Returns 404 for сharacter existing accounts DB, but not viewmodel DB', async () => {
      const response = await rp.get(address + '/events/user_without_model',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: 'user_without_model', password: 'hunter2' },
        }).promise();
      expect(response.statusCode).to.eq(404);
      expect(response.body.message).to.eq('Character with such id or login is not found');
    });

    it('Returns 401 and WWW-Authenticate if no credentials ', async () => {
      const response = await rp.get(address + '/events/some_user',
        {
          resolveWithFullResponse: true, simple: false, json: {},
        }).promise();
      expect(response.statusCode).to.eq(401);
      expect(response.headers['WWW-Authenticate']).not.to.be.null;
    });

    it('Returns 401 and WWW-Authenticate if wrong credentials ', async () => {
      const response = await rp.get(address + '/events/some_user',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: 'some_user', password: 'wrong one' },
        }).promise();
      expect(response.statusCode).to.eq(401);
      expect(response.headers['WWW-Authenticate']).not.to.be.null;
    });

    it('Returns 401 and WWW-Authenticate if querying user not providing access', async () => {
      const response = await rp.get(address + '/events/some_user',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: 'user_without_model', password: 'hunter2' },
        }).promise();
      expect(response.statusCode).to.eq(401);
      expect(response.headers['WWW-Authenticate']).not.to.be.null;
    });

    it('Returns timestamp of viewmodel if no events present', async () => {
      const response = await rp.get(address + '/events/some_user',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: 'some_user', password: 'qwerty' },
        }).promise();
      expect(response.statusCode).to.eq(200);
      expect(response.body.id).to.equal('00001');
      expect(response.body.timestamp).to.equal(420);
      expect(response.body.serverTime).to.be.approximately(new Date().valueOf(), 1000);
    });

    it('Returns timestamp of latest mobile event', async () => {
      const events = [{
        eventType: 'TestEvent',
        timestamp: 4365,
      }, {
        eventType: '_RefreshModel',
        timestamp: 6666,
      }];

      const responsePut = await rp.post(address + '/events/some_user',
        {
          resolveWithFullResponse: true, json: { events: events },
          auth: { username: 'some_user', password: 'qwerty' },
        }).promise();
      expect(responsePut.statusCode).to.eq(202);

      const response = await rp.get(address + '/events/some_user',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: 'some_user', password: 'qwerty' },
        }).promise();
      expect(response.body.id).to.equal('00001');
      expect(response.body.timestamp).to.equal(6666);
      expect(response.body.serverTime).to.be.approximately(new Date().valueOf(), 1000);
    });
  });

  describe('POST /location_events', () => {
    it('Puts event into db', async () => {
      const event = {
        eventType: 'whatever',
        data: { foo: 'ambar' },
      };
      const response = await rp.post(address + '/location_events/ship_BSG',
        {
          resolveWithFullResponse: true, json: { events: [event] },
          auth: { username: 'admin', password: 'admin' },
        }).promise();

      expect(response.statusCode).to.eq(200);
      expect(response.body).to.deep.equal({receivers: ['00001']});
      const docs = await dbContainer.allEventsSortedByTimestamp();
      expect(docs.length).to.equal(1);
      const doc = docs[0].doc;
      expect(doc).to.deep.include(event);
      expect(doc).to.deep.include({ characterId: '00001' });
      expect(doc.timestamp).to.be.approximately(currentTimestamp() + 2000, 200);
    });

    it('Does nothing if no one in the location', async () => {
      const event = {
        eventType: 'whatever',
        data: { foo: 'ambar' },
      };
      const response = await rp.post(address + '/location_events/ship_DeathStar',
        {
          resolveWithFullResponse: true, json: { events: [event] },
          auth: { username: 'admin', password: 'admin' },
        }).promise();

      expect(response.statusCode).to.eq(200);
      expect(response.body).to.deep.equal({receivers: []});
      const docs = await dbContainer.allEventsSortedByTimestamp();
      expect(docs).to.be.empty;
    });
  });

  describe('GET /characters', () => {
    it('Returns requested ACL', async () => {
      const response = await rp.get(address + '/characters/some_user',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: 'some_user', password: 'qwerty' },
        }).promise();
      expect(response.statusCode).to.eq(200);
      expect(response.body).to.deep.equal({
        access: [
          { id: '10002', timestamp: testStartTime - 1 },
          { id: '10001', timestamp: testStartTime + 60000 },
        ],
      });
    });

    it('Returns requested ACL if no explicit access field', async () => {
      const response = await rp.get(address + '/characters/some_lab_technician',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: 'some_lab_technician', password: 'research' },
        }).promise();
      expect(response.statusCode).to.eq(200);
      expect(response.body).to.deep.equal({ access: [] });
    });

    it('Returns 404 for non-existing user', async () => {
      const response = await rp.get(address + '/characters/nobody',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: 'nobody', password: 'nobody' },
        }).promise();
      expect(response.statusCode).to.eq(404);
      expect(response.body.message).to.eq('Character with such id or login is not found');
    });

    it('Returns 401 if querying another user (even one allowing access)', async () => {
      const response = await rp.get(address + '/characters/some_user',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: 'some_lab_technician', password: 'research' },
        }).promise();
      expect(response.statusCode).to.eq(401);
    });

    it('Admin can access anybody', async () => {
      const response = await rp.get(address + '/characters/some_lab_technician',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: 'admin', password: 'admin' },
        }).promise();
      expect(response.statusCode).to.eq(200);
      expect(response.body).to.deep.equal({ access: [] });
    });
  });

  describe('POST /characters', () => {
    describe('With logins in request', () => {
      it('Can grant access to a new user', async () => {
        const response = await rp.post(address + '/characters/some_lab_technician',
          {
            resolveWithFullResponse: true, simple: false, json: { grantAccess: ['some_hired_lab_technician'] },
            auth: { username: 'some_lab_technician', password: 'research' },
          }).promise();
        expect(response.statusCode).to.eq(200);
        expect(response.body.access.length).to.equal(1);
        expect(response.body.access[0].id).to.equal('10003');
        expect(response.body.access[0].timestamp).to.be.approximately(currentTimestamp() + 1000, 200);

        const accessInfo: any = await dbContainer.accountsDb().get('10001');
        expect(accessInfo.access.length).to.equal(1);
        expect(accessInfo.access[0].id).to.equal('10003');
        expect(accessInfo.access[0].timestamp).to.be.approximately(currentTimestamp() + 1000, 200);
      });

      it('Can re-grant access to expired user', async () => {
        const response = await rp.post(address + '/characters/some_user',
          {
            resolveWithFullResponse: true, simple: false, json: { grantAccess: ['some_fired_lab_technician'] },
            auth: { username: 'some_user', password: 'qwerty' },
          }).promise();
        expect(response.statusCode).to.eq(200);
        expect(response.body.access.length).to.equal(2);
        for (const access of response.body.access)
          expect(access.timestamp).to.be.gt(testStartTime);

        const accessInfo: any = await dbContainer.accountsDb().get('00001');
        expect(accessInfo.access.length).to.equal(2);
        for (const access of (accessInfo.access))
          expect(access.timestamp).to.be.gt(testStartTime);
      });

      it('Can remove access', async () => {
        const response = await rp.post(address + '/characters/some_user',
          {
            resolveWithFullResponse: true, simple: false, json: { removeAccess: ['some_lab_technician'] },
            auth: { username: 'some_user', password: 'qwerty' },
          }).promise();
        expect(response.statusCode).to.eq(200);
        expect(response.body.access.length).to.equal(1);
        expect(response.body.access[0].id).to.equal('10002');
        expect(response.body.access[0].timestamp).to.equal(testStartTime - 1);

        const accessInfo: any = await dbContainer.accountsDb().get('00001');
        expect(accessInfo.access.length).to.equal(1);
        expect(accessInfo.access[0].id).to.equal('10002');
        expect(accessInfo.access[0].timestamp).to.equal(testStartTime - 1);
      });
    });

    describe('With id in request', () => {
      it('Can grant access to a new user', async () => {
        const response = await rp.post(address + '/characters/some_lab_technician',
          {
            resolveWithFullResponse: true, simple: false, json: { grantAccess: ['10003'] },
            auth: { username: 'some_lab_technician', password: 'research' },
          }).promise();
        expect(response.statusCode).to.eq(200);
        expect(response.body.access.length).to.equal(1);
        expect(response.body.access[0].id).to.equal('10003');
        expect(response.body.access[0].timestamp).to.be.approximately(currentTimestamp() + 1000, 200);

        const accessInfo: any = await dbContainer.accountsDb().get('10001');
        expect(accessInfo.access.length).to.equal(1);
        expect(accessInfo.access[0].id).to.equal('10003');
        expect(accessInfo.access[0].timestamp).to.be.approximately(currentTimestamp() + 1000, 200);
      });

      it('Can re-grant access to expired user', async () => {
        const response = await rp.post(address + '/characters/some_user',
          {
            resolveWithFullResponse: true, simple: false, json: { grantAccess: ['10002'] },
            auth: { username: 'some_user', password: 'qwerty' },
          }).promise();
        expect(response.statusCode).to.eq(200);
        expect(response.body.access.length).to.equal(2);
        for (const access of response.body.access)
          expect(access.timestamp).to.be.gt(testStartTime);

        const accessInfo: any = await dbContainer.accountsDb().get('00001');
        expect(accessInfo.access.length).to.equal(2);
        for (const access of (accessInfo.access))
          expect(access.timestamp).to.be.gt(testStartTime);
      });

      it('Can remove access', async () => {
        const response = await rp.post(address + '/characters/some_user',
          {
            resolveWithFullResponse: true, simple: false, json: { removeAccess: ['10001'] },
            auth: { username: 'some_user', password: 'qwerty' },
          }).promise();
        expect(response.statusCode).to.eq(200);
        expect(response.body.access.length).to.equal(1);
        expect(response.body.access[0].id).to.equal('10002');
        expect(response.body.access[0].timestamp).to.equal(testStartTime - 1);

        const accessInfo: any = await dbContainer.accountsDb().get('00001');
        expect(accessInfo.access.length).to.equal(1);
        expect(accessInfo.access[0].id).to.equal('10002');
        expect(accessInfo.access[0].timestamp).to.equal(testStartTime - 1);
      });
    });

    it('Returns 404 for non-existing user', async () => {
      const response = await rp.post(address + '/characters/nobody',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: 'nobody', password: 'nobody' },
        }).promise();
      expect(response.statusCode).to.eq(404);
      expect(response.body.message).to.eq('Character with such id or login is not found');
    });

    it('Returns 401 if querying another user (even one allowing access)', async () => {
      const response = await rp.post(address + '/characters/some_user',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: 'some_lab_technician', password: 'research' },
        }).promise();
      expect(response.statusCode).to.eq(401);
    });

    it('Admin can access anybody', async () => {
      const response = await rp.post(address + '/characters/some_user',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: 'admin', password: 'admin' },
        }).promise();
      expect(response.statusCode).to.eq(200);
    });
  });

  describe('tokenUpdated events handling', () => {
    it('Can query by push token', async () => {
      const docs = await dbContainer.accountsDb().query('account/by-push-token', { key: '00001spushtoken' });
      expect(docs.rows.length).to.equal(1);
      expect(docs.rows[0].id).to.equal('00001');
    });

    it('Token from tokenUpdated event is saved into db', async () => {
      const events = [{
        eventType: 'tokenUpdated',
        timestamp: 4365,
        data: { token: { registrationId: '00002snewtoken' } },
      }];

      const response = await rp.post(address + '/events/00002',
        {
          resolveWithFullResponse: true, json: { events },
          auth: { username: '00002', password: 'asdfg' },
        }).promise();

      expect(response.statusCode).to.eq(202);

      const docs = await dbContainer.accountsDb().query('account/by-push-token', { key: '00002snewtoken' });
      expect(docs.rows.length).to.equal(1);
      expect(docs.rows[0].id).to.equal('00002');
    });

    it('Token from LAST tokenUpdated event is saved into db', async () => {
      const events = [{
        eventType: 'tokenUpdated',
        timestamp: 4365,
        data: { token: { registrationId: '00002snewtoken' } },
      },
      {
        eventType: 'tokenUpdated',
        timestamp: 9953,
        data: { token: { registrationId: '00002snewesttoken' } },
      }];

      const response = await rp.post(address + '/events/00002',
        {
          resolveWithFullResponse: true, json: { events },
          auth: { username: '00002', password: 'asdfg' },
        }).promise();

      expect(response.statusCode).to.eq(202);

      let docs = await dbContainer.accountsDb().query('account/by-push-token', { key: '00002snewesttoken' });
      expect(docs.rows.length).to.equal(1);
      expect(docs.rows[0].id).to.equal('00002');

      docs = await dbContainer.accountsDb().query('account/by-push-token', { key: '00002snewtoken' });
      expect(docs.rows).to.be.empty;
    });

    it('Token from tokenUpdated event overwrites existing one', async () => {
      const events = [{
        eventType: 'tokenUpdated',
        timestamp: 4365,
        data: { token: { registrationId: '00001snewtoken' } },
      }];

      const response = await rp.post(address + '/events/00001',
        {
          resolveWithFullResponse: true, json: { events },
          auth: { username: '00001', password: 'qwerty' },
        }).promise();

      expect(response.statusCode).to.eq(202);

      let docs = await dbContainer.accountsDb().query('account/by-push-token', { key: '00001snewtoken' });
      expect(docs.rows.length).to.equal(1);
      expect(docs.rows[0].id).to.equal('00001');

      docs = await dbContainer.accountsDb().query('account/by-push-token', { key: '00001spushtoken' });
      expect(docs.rows).to.be.empty;
    });

    it('If token from tokenUpdated event associated with other character, this association is removed', async () => {
      const events = [{
        eventType: 'tokenUpdated',
        timestamp: 4365,
        data: { token: { registrationId: '00001spushtoken' } },
      }];

      const response = await rp.post(address + '/events/00002',
        {
          resolveWithFullResponse: true, json: { events },
          auth: { username: '00002', password: 'asdfg' },
        }).promise();

      expect(response.statusCode).to.eq(202);

      const docs = await dbContainer.accountsDb().query('account/by-push-token', { key: '00001spushtoken' });
      expect(docs.rows.length).to.equal(1);
      expect(docs.rows[0].id).to.equal('00002');
    });

    it('If token from tokenUpdated event associated with same character, nothing changes', async () => {
      const events = [{
        eventType: 'tokenUpdated',
        timestamp: 4365,
        data: { token: { registrationId: '00001spushtoken' } },
      }];

      const response = await rp.post(address + '/events/00001',
        {
          resolveWithFullResponse: true, json: { events },
          auth: { username: '00001', password: 'qwerty' },
        }).promise();

      expect(response.statusCode).to.eq(202);

      const docs = await dbContainer.accountsDb().query('account/by-push-token', { key: '00001spushtoken' });
      expect(docs.rows.length).to.equal(1);
      expect(docs.rows[0].id).to.equal('00001');
    });
  });

  describe('Generic push notification send', () => {

    afterEach(() => {
      nock.cleanAll();
    });

    it('Can send push', async () => {
      const fcm = nock('https://fcm.googleapis.com', { reqheaders: { authorization: 'key=fakeserverkey' } })
        .post('/fcm/send', {
          to: '00001spushtoken',
          foo: 'bar',
        })
        .reply(200, 'Ok!');

      const response = await rp.post(address + '/push/00001',
        {
          resolveWithFullResponse: true, json: { foo: 'bar' },
          auth: { username: 'admin', password: 'admin' },
        }).promise();
      expect(response.statusCode).to.equal(200);

      expect(fcm.isDone()).to.be.true;
    });

    it('Can send push using login instead of id', async () => {
      const fcm = nock('https://fcm.googleapis.com', { reqheaders: { authorization: 'key=fakeserverkey' } })
        .post('/fcm/send', {
          to: '00001spushtoken',
          foo: 'bar',
        })
        .reply(200, 'Ok!');

      const response = await rp.post(address + '/push/some_user',
        {
          resolveWithFullResponse: true, json: { foo: 'bar' },
          auth: { username: 'admin', password: 'admin' },
        }).promise();
      expect(response.statusCode).to.equal(200);

      expect(fcm.isDone()).to.be.true;
    });

    it('Returns 401 if sending push without auth', async () => {
      const response = await rp.post(address + '/push/00001',
        {
          resolveWithFullResponse: true, simple: false, json: {},
        }).promise();
      expect(response.statusCode).to.equal(401);
    });

    it('Returns 401 if sending push with non-admin user', async () => {
      const response = await rp.post(address + '/push/00001',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: '00001', password: 'qwerty' },
        }).promise();
      expect(response.statusCode).to.equal(401);
    });

    it('Returns 401 if sending push with wrong admin password', async () => {
      const response = await rp.post(address + '/push/00001',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: 'admin', password: 'asdsa' },
        }).promise();
      expect(response.statusCode).to.equal(401);
    });

    it('Returns 404 if sending push to non-existing user', async () => {
      const response = await rp.post(address + '/push/54674',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: 'admin', password: 'admin' },
        }).promise();
      expect(response.statusCode).to.equal(404);
      expect(response.body.message).to.eq('Character with such id or login is not found');
    });

    it('Returns 404 if sending push to user without a token', async () => {
      const response = await rp.post(address + '/push/00002',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: 'admin', password: 'admin' },
        }).promise();
      expect(response.statusCode).to.equal(404);
      expect(response.body.message).to.eq('No push token for this character');
    });

    it('Propagates FCM error', async () => {
      const fcm = nock('https://fcm.googleapis.com', { reqheaders: { authorization: 'key=fakeserverkey' } })
        .post('/fcm/send', {
          to: '00001spushtoken',
          foo: 'bar',
        })
        .reply(400, 'Nope!');

      const response = await rp.post(address + '/push/00001',
        {
          resolveWithFullResponse: true, simple: false, json: { foo: 'bar' },
          auth: { username: 'admin', password: 'admin' },
        }).promise();
      expect(response.statusCode).to.equal(400);
      expect(response.body.message).to.eq('Nope!');
    });

  });

  describe('Periodic notification sending', () => {
    it('Can sort characters by timestamp', async () => {
      const docsOld = await dbContainer.viewModelDb('mobile').query('viewmodel/by-timestamp',
        { startkey: 0, endkey: 1000 });
      expect(docsOld.rows.length).to.equal(1);
      expect(docsOld.rows[0].id).to.equal('00001');

      const docsNew = await dbContainer.viewModelDb('mobile').query('viewmodel/by-timestamp',
        { startkey: 1000, endkey: 999999 });
      expect(docsNew.rows.length).to.equal(1);
      expect(docsNew.rows[0].id).to.equal('00002');
    });
  });
});

