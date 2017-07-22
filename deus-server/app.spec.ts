import * as PouchDB from 'pouchdb';
import * as rp from 'request-promise';
// tslint:disable-next-line:no-var-requires
PouchDB.plugin(require('pouchdb-adapter-memory'));
import * as winston from 'winston';

import { expect } from 'chai';
import 'mocha';

import { TSMap } from 'typescript-map';
import App from './app';
import { Settings } from './settings';

const port = 3000;
const address = 'http://localhost:' + port;

/*

There are following characters present in this test:
id     login                      password  comment

00001  some_user                  qwerty    Has viewmodel, timestamp = 420. Also have push token.
00002  some_other_user            asdfg     Has viewmodel, timestamp = 420.

55555  user_without_model         hunter2   Has no viewmodel, used to test for corresponding 404 errors

10001  some_lab_technician        research  Has access to some_user methods
10002  some_fired_lab_technician  beer      Had access to some_user methods, now it's expired
10003  some_hired_lab_technician  wowsocool Will get access to some_lab_technician methods

*/

describe('API Server', () => {
  let app: App;
  let eventsDb: PouchDB.Database<{ characterId: string, eventType: string, timestamp: number, data: any }>;
  let mobileViewModelDb: PouchDB.Database<{ timestamp: number, updatesCount: number }>;
  let defaultViewModelDb: PouchDB.Database<{ timestamp: number, updatesCount: number }>;
  let accountsDb: PouchDB.Database<{ password: string }>;
  let testStartTime: number;

  beforeEach(async () => {
    eventsDb = new PouchDB('events', { adapter: 'memory' });
    mobileViewModelDb = new PouchDB('viewmodel_mobile', { adapter: 'memory' });
    defaultViewModelDb = new PouchDB('viewmodel_default', { adapter: 'memory' });
    const viewmodelDbs = new TSMap<string, PouchDB.Database<{ timestamp: number }>>
      ([['mobile', mobileViewModelDb],
      ['default', defaultViewModelDb]]);
    accountsDb = new PouchDB('accounts', { adapter: 'memory' });
    const logger = new winston.Logger({ level: 'warning' });
    const settings: Settings = { viewmodelUpdateTimeout: 20, accessGrantTime: 1000, tooFarInFutureFilterTime: 30000 };
    app = new App(logger, eventsDb, viewmodelDbs, accountsDb, settings);
    await app.listen(port);
    await mobileViewModelDb.put({
      _id: '00001', timestamp: 420,
      updatesCount: 0, mobile: true,
    });
    await defaultViewModelDb.put({
      _id: '00001', timestamp: 420,
      updatesCount: 0, mobile: false,
    });
    await defaultViewModelDb.put({
      _id: '00002', timestamp: 420,
      updatesCount: 0, mobile: false,
    });
    await mobileViewModelDb.put({
      _id: '00002', timestamp: 420,
      updatesCount: 0, mobile: true,
    });
    await accountsDb.put({ _id: '10001', login: 'some_lab_technician', password: 'research' });
    await accountsDb.put({ _id: '10002', login: 'some_fired_lab_technician', password: 'beer' });
    await accountsDb.put({ _id: '10003', login: 'some_hired_lab_technician', password: 'wowsocool' });

    testStartTime = app.currentTimestamp();
    await accountsDb.put({
      _id: '00001',
      login: 'some_user',
      password: 'qwerty',
      pushToken: '00001spushtoken',
      access: [
        { id: '10002', timestamp: testStartTime - 1 },
        { id: '10001', timestamp: testStartTime + 60000 },
      ],
    });
    await accountsDb.put({ _id: '00002', login: 'some_other_user', password: 'asdfg' });
    await accountsDb.put({ _id: '55555', login: 'user_without_model', password: 'hunter2' });
  });

  afterEach(async () => {
    app.stop();
    await accountsDb.destroy();
    await mobileViewModelDb.destroy();
    await defaultViewModelDb.destroy();
    await eventsDb.destroy();
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
    });

    it('Returns 404 for сharacter not existing in accounts DB', async () => {
      const response = await rp.get(address + '/viewmodel/4444',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: '4444', password: '4444' },
        }).promise();
      expect(response.statusCode).to.eq(404);
    });

    it('Returns 404 for сharacter existing accounts DB, but not viewmodel DB', async () => {
      const response = await rp.get(address + '/viewmodel/user_without_model',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: 'user_without_model', password: 'hunter2' },
        }).promise();
      expect(response.statusCode).to.eq(404);
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
    });

    it('Returns 404 for сharacter existing accounts DB, but not viewmodel DB', async () => {
      const response = await rp.post(address + '/events/user_without_model',
        {
          resolveWithFullResponse: true, simple: false, json: { events: [] },
          auth: { username: 'user_without_model', password: 'hunter2' },
        }).promise();
      expect(response.statusCode).to.eq(404);
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
      const docs = await eventsDb.query('web_api_server_v2/characterId_timestamp_mobile', { include_docs: true });
      expect(docs.rows.length).to.equal(1);
      const doc: any = docs.rows[0].doc;
      expect(doc).to.deep.include(event);
      expect(doc).to.deep.include({ characterId: '00001' });
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
      const docs = await eventsDb.query('web_api_server_v2/characterId_timestamp_mobile', { include_docs: true });
      expect(docs.rows.length).to.equal(1);
      const doc: any = docs.rows[0].doc;
      expect(doc).to.deep.include(events[1]);
      expect(doc).to.deep.include({ characterId: '00001' });
    });

    it('Filters _RefreshModels too far in future', async () => {
      const timestamp = app.currentTimestamp() + 60000;
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
      const docs = await eventsDb.query('web_api_server_v2/characterId_timestamp_mobile', { include_docs: true });
      expect(docs.rows.length).to.equal(1);
      const doc: any = docs.rows[0].doc;
      expect(doc).to.deep.include(events[0]);
      expect(doc).to.deep.include({ characterId: '00001' });
    });

    it('Returns viewmodel in case if processed in time', async () => {
      const event = {
        eventType: '_RefreshModel',
        timestamp: 4365,
      };
      eventsDb.changes({ since: 'now', live: true, include_docs: true }).on('change', (change) => {
        if (change.doc) {
          const changeDoc = change.doc;
          mobileViewModelDb.get('00001').then((doc) => {
            mobileViewModelDb.put({
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
      const res = await eventsDb.allDocs({ include_docs: true });
      const events = res.rows.filter((row) => row.doc && row.doc.characterId);
      expect(events.length).to.eq(20);
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

      const res = await eventsDb.allDocs({ include_docs: true });
      // Filter design-docs
      const events = res.rows.filter((row) => row.doc && row.doc.characterId);
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
    });

    it('Returns 404 for сharacter existing accounts DB, but not viewmodel DB', async () => {
      const response = await rp.get(address + '/events/user_without_model',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: 'user_without_model', password: 'hunter2' },
        }).promise();
      expect(response.statusCode).to.eq(404);
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
    });

    it('Returns 401 if querying another user (even one allowing access)', async () => {
      const response = await rp.get(address + '/characters/some_user',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: 'some_lab_technician', password: 'research' },
        }).promise();
      expect(response.statusCode).to.eq(401);
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
        expect(response.body.access[0].timestamp).to.be.approximately(app.currentTimestamp() + 1000, 200);

        const accessInfo: any = await accountsDb.get('10001');
        expect(accessInfo.access.length).to.equal(1);
        expect(accessInfo.access[0].id).to.equal('10003');
        expect(accessInfo.access[0].timestamp).to.be.approximately(app.currentTimestamp() + 1000, 200);
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

        const accessInfo: any = await accountsDb.get('00001');
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

        const accessInfo: any = await accountsDb.get('00001');
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
        expect(response.body.access[0].timestamp).to.be.approximately(app.currentTimestamp() + 1000, 200);

        const accessInfo: any = await accountsDb.get('10001');
        expect(accessInfo.access.length).to.equal(1);
        expect(accessInfo.access[0].id).to.equal('10003');
        expect(accessInfo.access[0].timestamp).to.be.approximately(app.currentTimestamp() + 1000, 200);
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

        const accessInfo: any = await accountsDb.get('00001');
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

        const accessInfo: any = await accountsDb.get('00001');
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
    });

    it('Returns 401 if querying another user (even one allowing access)', async () => {
      const response = await rp.post(address + '/characters/some_user',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: 'some_lab_technician', password: 'research' },
        }).promise();
      expect(response.statusCode).to.eq(401);
    });
  });

  describe('Push notifications handling', () => {
    it('Can query by push token', async () => {
      const docs = await accountsDb.query('web_api_server_v2/by_push_token', { key: '00001spushtoken' });
      expect(docs.rows.length).to.equal(1);
      expect(docs.rows[0].id).to.equal('00001');
    });

    it('Token from tokenUpdated event is saved into db', async () => {
      const events = [{
      eventType: 'tokenUpdated',
        timestamp: 4365,
        data: { token: '00002snewtoken' },
      }];

      const response = await rp.post(address + '/events/00002',
        {
          resolveWithFullResponse: true, json: { events },
          auth: { username: '00002', password: 'asdfg' },
        }).promise();

      expect(response.statusCode).to.eq(202);

      const docs = await accountsDb.query('web_api_server_v2/by_push_token', { key: '00002snewtoken' });
      expect(docs.rows.length).to.equal(1);
      expect(docs.rows[0].id).to.equal('00002');
    });

    it('Token from LAST tokenUpdated event is saved into db', async () => {
      const events = [{
      eventType: 'tokenUpdated',
        timestamp: 4365,
        data: { token: '00002snewtoken' },
      },
      {
      eventType: 'tokenUpdated',
        timestamp: 9953,
        data: { token: '00002snewesttoken' },
      }];

      const response = await rp.post(address + '/events/00002',
        {
          resolveWithFullResponse: true, json: { events },
          auth: { username: '00002', password: 'asdfg' },
        }).promise();

      expect(response.statusCode).to.eq(202);

      let docs = await accountsDb.query('web_api_server_v2/by_push_token', { key: '00002snewesttoken' });
      expect(docs.rows.length).to.equal(1);
      expect(docs.rows[0].id).to.equal('00002');

      docs = await accountsDb.query('web_api_server_v2/by_push_token', { key: '00002snewtoken' });
      expect(docs.rows).to.be.empty;
    });

    it('Token from tokenUpdated event overwrites existing one', async () => {
      const events = [{
      eventType: 'tokenUpdated',
        timestamp: 4365,
        data: { token: '00001snewtoken' },
      }];

      const response = await rp.post(address + '/events/00001',
        {
          resolveWithFullResponse: true, json: { events },
          auth: { username: '00001', password: 'qwerty' },
        }).promise();

      expect(response.statusCode).to.eq(202);

      let docs = await accountsDb.query('web_api_server_v2/by_push_token', { key: '00001snewtoken' });
      expect(docs.rows.length).to.equal(1);
      expect(docs.rows[0].id).to.equal('00001');

      docs = await accountsDb.query('web_api_server_v2/by_push_token', { key: '00001spushtoken' });
      expect(docs.rows).to.be.empty;
    });

    it('If token from tokenUpdated event associated with other character, this association is removed', async () => {
      const events = [{
      eventType: 'tokenUpdated',
        timestamp: 4365,
        data: { token: '00001spushtoken' },
      }];

      const response = await rp.post(address + '/events/00002',
        {
          resolveWithFullResponse: true, json: { events },
          auth: { username: '00002', password: 'asdfg' },
        }).promise();

      expect(response.statusCode).to.eq(202);

      const docs = await accountsDb.query('web_api_server_v2/by_push_token', { key: '00001spushtoken' });
      expect(docs.rows.length).to.equal(1);
      expect(docs.rows[0].id).to.equal('00002');
    });

    it('If token from tokenUpdated event associated with same character, nothing changes', async () => {
      const events = [{
      eventType: 'tokenUpdated',
        timestamp: 4365,
        data: { token: '00001spushtoken' },
      }];

      const response = await rp.post(address + '/events/00001',
        {
          resolveWithFullResponse: true, json: { events },
          auth: { username: '00001', password: 'qwerty' },
        }).promise();

      expect(response.statusCode).to.eq(202);

      const docs = await accountsDb.query('web_api_server_v2/by_push_token', { key: '00001spushtoken' });
      expect(docs.rows.length).to.equal(1);
      expect(docs.rows[0].id).to.equal('00001');
    });
  });

});

describe('API Server - long timeout', () => {
  let app: App;
  let eventsDb: PouchDB.Database<{ characterId: string, eventType: string, timestamp: number, data: any }>;
  let viewModelDb: PouchDB.Database<{ timestamp: number, updatesCount: number }>;
  let accountsDb: PouchDB.Database<{ password: string }>;
  beforeEach(async () => {
    eventsDb = new PouchDB('events2', { adapter: 'memory' });
    viewModelDb = new PouchDB('viewmodel2', { adapter: 'memory' });
    const viewmodelDbs = new TSMap<string, PouchDB.Database<{ timestamp: number }>>([['mobile', viewModelDb]]);
    accountsDb = new PouchDB('accounts2', { adapter: 'memory' });
    const logger = new winston.Logger({ level: 'warning' });
    const settings: Settings = { viewmodelUpdateTimeout: 9000, accessGrantTime: 1000, tooFarInFutureFilterTime: 30000 };
    app = new App(logger, eventsDb, viewmodelDbs, accountsDb, settings);
    await app.listen(port);
    await viewModelDb.put({ _id: '00001', timestamp: 420, updatesCount: 0 });
    await accountsDb.put({ _id: '00001', login: 'some_user', password: 'qwerty' });
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
