import * as http from 'http'
import * as rp from 'request-promise'
import * as PouchDB from 'pouchdb';
PouchDB.plugin(require('pouchdb-adapter-memory'));

import { expect } from 'chai';
import 'mocha';

import App from './app'

const port = 3000;
const address = 'http://localhost:' + port;

describe('API Server', () => {
  let app: App;
  let eventsDb: PouchDB.Database<{ characterId: string, eventType: string, timestamp: number, data: any }>;
  let viewModelDb: PouchDB.Database<{ timestamp: number, updatesCount: number }>;
  let accountsDb: PouchDB.Database<{ password: string }>;
  beforeEach(async () => {
    eventsDb = new PouchDB('events', { adapter: 'memory' });
    viewModelDb = new PouchDB('viewmodel', { adapter: 'memory' });
    accountsDb = new PouchDB('accounts', { adapter: 'memory' });
    app = new App(eventsDb, viewModelDb, accountsDb, 20);
    await app.listen(port);
    await viewModelDb.put({ _id: "existing_viewmodel", timestamp: 420, updatesCount: 0 });
    await accountsDb.put({ _id: "existing_viewmodel", password: 'qwerty' });
    await accountsDb.put({ _id: "5555", password: '5555' });
  })

  afterEach(async () => {
    app.stop();
    await accountsDb.destroy();
    await viewModelDb.destroy();
    await eventsDb.destroy();
  })

  describe('/time', () => {
    it('Returns approximately current time', async () => {
      const response = await rp.get(address + '/time',
        { resolveWithFullResponse: true, json: { events: [] } }).promise();
      expect(response.statusCode).to.eq(200);
      expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
      expect(response.body.serverTime).to.be.approximately(new Date().valueOf(), 1000);
    });
  });

  describe('/viewmodel', () => {

    it('Returns viewmodel of existing character', async () => {
      const response = await rp.get(address + '/viewmodel/existing_viewmodel',
        {
          resolveWithFullResponse: true, json: {},
          auth: { username: 'existing_viewmodel', password: 'qwerty' }
        }).promise();
      expect(response.statusCode).to.eq(200);
      expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
      expect(response.body.serverTime).to.be.approximately(new Date().valueOf(), 1000);
      expect(response.body.id).to.equal("existing_viewmodel");
      expect(response.body.viewModel).to.deep.equal({ timestamp: 420, updatesCount: 0 });
    });

    it('Returns 404 for non-existing character', async () => {
      const response = await rp.get(address + '/viewmodel/5555',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: '5555', password: '5555' }
        }).promise();
      expect(response.statusCode).to.eq(404);
    });

    it('Returns 401 and WWW-Authenticate if no credentials ', async () => {
      const response = await rp.get(address + '/viewmodel/existing_viewmodel',
        {
          resolveWithFullResponse: true, simple: false, json: {}
        }).promise();
      expect(response.statusCode).to.eq(401);
      expect(response.headers['WWW-Authenticate']).not.to.be.null;
    });

    it('Returns 401 and WWW-Authenticate if wrong credentials ', async () => {
      const response = await rp.get(address + '/viewmodel/existing_viewmodel',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: 'existing_viewmodel', password: 'wrong one' }
        }).promise();
      expect(response.statusCode).to.eq(401);
      expect(response.headers['WWW-Authenticate']).not.to.be.null;
    });

    it('Returns 401 and WWW-Authenticate if querying another user ', async () => {
      const response = await rp.get(address + '/viewmodel/existing_viewmodel',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: '5555', password: '5555' }
        }).promise();
      expect(response.statusCode).to.eq(401);
      expect(response.headers['WWW-Authenticate']).not.to.be.null;
    });
  });

  describe('POST /events', () => {
    it('Returns 400 if no events field present', async () => {
      const response = await rp.post(address + '/events/existing_viewmodel',
        {
          resolveWithFullResponse: true, simple: false, json: { foo: "bar" },
          auth: { username: 'existing_viewmodel', password: 'qwerty' }
        }).promise();
      expect(response.statusCode).to.eq(400);
    });

    it('Returns 400 if events field is not an array', async () => {
      const response = await rp.post(address + '/events/existing_viewmodel',
        {
          resolveWithFullResponse: true, simple: false, json: { events: { foo: "bar" } },
          auth: { username: 'existing_viewmodel', password: 'qwerty' }
        }).promise();
      expect(response.statusCode).to.eq(400);
    });

    it('Returns 404 for non-existing character', async () => {
      const response = await rp.post(address + '/events/5555',
        {
          resolveWithFullResponse: true, simple: false, json: { events: [] },
          auth: { username: '5555', password: '5555' }
        }).promise();
      expect(response.statusCode).to.eq(404);
    });

    it('Returns 401 and WWW-Authenticate if no credentials ', async () => {
      const response = await rp.post(address + '/events/existing_viewmodel',
        {
          resolveWithFullResponse: true, simple: false, json: {}
        }).promise();
      expect(response.statusCode).to.eq(401);
      expect(response.headers['WWW-Authenticate']).not.to.be.null;
    });

    it('Returns 401 and WWW-Authenticate if wrong credentials ', async () => {
      const response = await rp.post(address + '/events/existing_viewmodel',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: 'existing_viewmodel', password: 'wrong one' }
        }).promise();
      expect(response.statusCode).to.eq(401);
      expect(response.headers['WWW-Authenticate']).not.to.be.null;
    });

    it('Returns 401 and WWW-Authenticate if querying another user ', async () => {
      const response = await rp.post(address + '/events/existing_viewmodel',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: '5555', password: '5555' }
        }).promise();
      expect(response.statusCode).to.eq(401);
      expect(response.headers['WWW-Authenticate']).not.to.be.null;
    });

    it('Sets proper header', async () => {
      const response = await rp.post(address + '/events/existing_viewmodel',
        {
          resolveWithFullResponse: true, json: { events: [] },
          auth: { username: 'existing_viewmodel', password: 'qwerty' }
        }).promise();
      expect(response.statusCode).to.eq(202);
      expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
    });

    it('Puts event into db', async () => {
      const event = {
        eventType: "_RefreshModel",
        timestamp: 4365,
        data: { foo: "ambar" },
      };
      const response = await rp.post(address + '/events/existing_viewmodel',
        {
          resolveWithFullResponse: true, json: { events: [event] },
          auth: { username: 'existing_viewmodel', password: 'qwerty' }
        }).promise();

      expect(response.statusCode).to.eq(202);
      const docs = await eventsDb.query('web_api_server_v2/characterId_timestamp_mobile', { include_docs: true });
      expect(docs.rows.length).to.equal(1);
      const doc: any = docs.rows[0].doc;
      expect(doc).to.deep.include(event);
      expect(doc).to.deep.include({ characterId: "existing_viewmodel" });
    });

    it('Returns viewmodel in case if processed in time', async () => {
      const event = {
        eventType: "_RefreshModel",
        timestamp: 4365
      };
      eventsDb.changes({ since: 'now', live: true, include_docs: true }).on('change', change => {
        if (change.doc) {
          const changeDoc = change.doc;
          viewModelDb.get('existing_viewmodel').then(doc => {
            viewModelDb.put({
              _id: 'existing_viewmodel',
              _rev: doc._rev,
              timestamp: changeDoc.timestamp,
              updatesCount: doc.updatesCount + 1
            });
          });
        }
      });

      const response = await rp.post(address + '/events/existing_viewmodel',
        {
          resolveWithFullResponse: true, json: { events: [event] },
          auth: { username: 'existing_viewmodel', password: 'qwerty' }
        }).promise();
      expect(response.statusCode).to.eq(200);
      expect(response.body.serverTime).to.be.approximately(new Date().valueOf(), 1000);
      expect(response.body.id).to.equal("existing_viewmodel");
      expect(response.body.viewModel).to.deep.equal({ timestamp: 4365, updatesCount: 1 });
    });

    it('Returns Accepted in case if not processed in time', async () => {
      const event = {
        eventType: "TestEvent",
        timestamp: 4365
      };

      const response = await rp.post(address + '/events/existing_viewmodel',
        {
          resolveWithFullResponse: true, json: { events: [event] },
          auth: { username: 'existing_viewmodel', password: 'qwerty' }
        }).promise();

      expect(response.statusCode).to.eq(202);
      expect(response.body.serverTime).to.be.approximately(new Date().valueOf(), 1000);
      expect(response.body.id).to.equal("existing_viewmodel");
      expect(response.body.timestamp).to.equal(4365);
    });

    it('Returns timestamp of latest event successfully saved', async () => {
      const events = [{
        eventType: "TestEvent",
        timestamp: 4365
      }, {
        eventType: "TestEvent",
        timestamp: 6666
      }];

      const response = await rp.post(address + '/events/existing_viewmodel',
        {
          resolveWithFullResponse: true, json: { events: events },
          auth: { username: 'existing_viewmodel', password: 'qwerty' }
        }).promise();

      expect(response.statusCode).to.eq(202);
      expect(response.body.serverTime).to.be.approximately(new Date().valueOf(), 1000);
      expect(response.body.id).to.equal("existing_viewmodel");
      expect(response.body.timestamp).to.equal(6666);
    });

    it('Handles multiple simultaneous connections from same non-mobile client', async () => {
      const event = {
        eventType: "TestEvent",
        timestamp: 4365
      };

      let promises: any[] = [];
      for (let i = 0; i < 100; ++i)
        promises.push(rp.post(address + '/events/existing_viewmodel',
          {
            resolveWithFullResponse: true, simple: false, json: { events: [event] },
            auth: { username: 'existing_viewmodel', password: 'qwerty' }
          }).promise());

      const resultStatuses = (await Promise.all(promises)).map(res => res.statusCode);
      const expectedStatuses = Array(100).fill(202);
      expect(resultStatuses).to.deep.equal(expectedStatuses);
      const res = await eventsDb.allDocs({ include_docs: true });
      const events = res.rows.filter(row => row.doc && row.doc.characterId);
      expect(events.length).to.eq(100);
    });

    it('Handles multiple sequential connections from same client', async () => {
      const event = {
        eventType: "TestEvent",
        timestamp: 4365
      };

      const response1 = await rp.post(address + '/events/existing_viewmodel',
        {
          resolveWithFullResponse: true, simple: false, json: { events: [event] },
          auth: { username: 'existing_viewmodel', password: 'qwerty' }
        }).promise();
      const response2 = await rp.post(address + '/events/existing_viewmodel',
        {
          resolveWithFullResponse: true, simple: false, json: { events: [event] },
          auth: { username: 'existing_viewmodel', password: 'qwerty' }
        }).promise();
      expect(response1.statusCode).to.eq(202);
      expect(response2.statusCode).to.eq(202);
    });

    it('Deduplicates events with same timestamp', async () => {
      const event = {
        eventType: "_RefreshModel",
        timestamp: 4365,
      };

      const response1 = await rp.post(address + '/events/existing_viewmodel',
        {
          resolveWithFullResponse: true, simple: false, json: { events: [event] },
          auth: { username: 'existing_viewmodel', password: 'qwerty' }
        }).promise();
      const response2 = await rp.post(address + '/events/existing_viewmodel',
        {
          resolveWithFullResponse: true, simple: false, json: { events: [event] },
          auth: { username: 'existing_viewmodel', password: 'qwerty' }
        }).promise();
      expect(response1.statusCode).to.eq(202);
      expect(response2.statusCode).to.eq(202);

      const res = await eventsDb.allDocs({ include_docs: true });
      // Filter design-docs
      const events = res.rows.filter(row => row.doc && row.doc.characterId);
      expect(events.length).to.eq(1);
    });

    it('Returns 409 if trying to submit non-mobile event into past', async () => {
      const event = {
        eventType: "TestEvent",
        timestamp: 100 // < 420
      };

      const response = await rp.post(address + '/events/existing_viewmodel',
        {
          resolveWithFullResponse: true, simple: false, json: { events: [event] },
          auth: { username: 'existing_viewmodel', password: 'qwerty' }
        }).promise();
      expect(response.statusCode).to.eq(409);
    });
  });

  describe('GET /events', () => {
    it('Returns 404 for non-existing character', async () => {
      const response = await rp.get(address + '/events/5555',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: '5555', password: '5555' }
        }).promise();
      expect(response.statusCode).to.eq(404);
    });

    it('Returns 401 and WWW-Authenticate if no credentials ', async () => {
      const response = await rp.get(address + '/events/existing_viewmodel',
        {
          resolveWithFullResponse: true, simple: false, json: {}
        }).promise();
      expect(response.statusCode).to.eq(401);
      expect(response.headers['WWW-Authenticate']).not.to.be.null;
    });

    it('Returns 401 and WWW-Authenticate if wrong credentials ', async () => {
      const response = await rp.get(address + '/events/existing_viewmodel',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: 'existing_viewmodel', password: 'wrong one' }
        }).promise();
      expect(response.statusCode).to.eq(401);
      expect(response.headers['WWW-Authenticate']).not.to.be.null;
    });

    it('Returns 401 and WWW-Authenticate if querying another user ', async () => {
      const response = await rp.get(address + '/events/existing_viewmodel',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: '5555', password: '5555' }
        }).promise();
      expect(response.statusCode).to.eq(401);
      expect(response.headers['WWW-Authenticate']).not.to.be.null;
    });

    it('Returns timestamp of viewmodel if no events present', async () => {
      const response = await rp.get(address + '/events/existing_viewmodel',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: 'existing_viewmodel', password: 'qwerty' }
        }).promise();
      expect(response.statusCode).to.eq(200);
      expect(response.body.id).to.equal("existing_viewmodel");
      expect(response.body.timestamp).to.equal(420);
      expect(response.body.serverTime).to.be.approximately(new Date().valueOf(), 1000);
    });

    it('Returns timestamp of latest mobile event', async () => {
      const events = [{
        eventType: "TestEvent",
        timestamp: 4365,
      }, {
        eventType: "_RefreshModel",
        timestamp: 6666,
      }];

      const responsePut = await rp.post(address + '/events/existing_viewmodel',
        {
          resolveWithFullResponse: true, json: { events: events },
          auth: { username: 'existing_viewmodel', password: 'qwerty' }
        }).promise();
      expect(responsePut.statusCode).to.eq(202);

      const response = await rp.get(address + '/events/existing_viewmodel',
        {
          resolveWithFullResponse: true, simple: false, json: {},
          auth: { username: 'existing_viewmodel', password: 'qwerty' }
        }).promise();
      expect(response.body.id).to.equal("existing_viewmodel");
      expect(response.body.timestamp).to.equal(6666);
      expect(response.body.serverTime).to.be.approximately(new Date().valueOf(), 1000);
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
    accountsDb = new PouchDB('accounts2', { adapter: 'memory' });
    app = new App(eventsDb, viewModelDb, accountsDb, 9000);
    await app.listen(port);
    await viewModelDb.put({ _id: "existing_viewmodel", timestamp: 420, updatesCount: 0 });
    await accountsDb.put({ _id: 'existing_viewmodel', password: 'qwerty' });
  });

  afterEach(async () => {
    app.stop();
    await accountsDb.destroy();
    await viewModelDb.destroy();
    await eventsDb.destroy();
  });

  it('Does not wait for viewmodel update', async () => {
    const event = {
      eventType: "NonMobile",
      timestamp: 4365
    };
    const response = await rp.post(address + '/events/existing_viewmodel',
      {
        resolveWithFullResponse: true, json: { events: [event] },
        auth: { username: 'existing_viewmodel', password: 'qwerty' }
      }).promise();

    expect(response.statusCode).to.eq(202);
    const res = await eventsDb.allDocs({ include_docs: true });
    const events = res.rows.filter(row => row.doc && row.doc.characterId);
    expect(events.length).to.eq(1);
    expect(events[0].doc).to.deep.include(event);
    expect(events[0].doc).to.deep.include({ characterId: "existing_viewmodel" });
  });
});
