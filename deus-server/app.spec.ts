import * as http from 'http'
import * as request from 'request'
import * as PouchDB from 'pouchdb';
PouchDB.plugin(require('pouchdb-adapter-memory'));

import { expect } from 'chai';
import 'mocha';

import App from './app'

const port = 3000;
const address = 'http://localhost:' + port;

describe('Express app', () => {
  let app: App;
  let eventsDb: PouchDB.Database<{ eventType: string, timestamp: number, data: any }>;
  let viewModelDb: PouchDB.Database<{ timestamp: number, updatesCount: number }>;
  var db = new PouchDB('dbname', { adapter: 'memory' });
  beforeEach(() => {
    eventsDb = new PouchDB('events', { adapter: 'memory' });
    viewModelDb = new PouchDB('viewmodel', { adapter: 'memory' });
    app = new App(eventsDb, viewModelDb, 300);
    app.listen(port);
  })
  beforeEach(done => {
    viewModelDb.put({ _id: "existing_viewmodel", timestamp: 420, updatesCount: 0 }, done);
  })

  afterEach(() => {
    app.stop();
    viewModelDb.destroy();
    eventsDb.destroy();
  })

  describe('/time', () => {
    it('Returns approximately current time', done => {
      request.get(address + '/time', (error, response, body) => {
        expect(error).to.be.null;
        expect(response.statusCode).to.eq(200);
        expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
        let parsedBody = JSON.parse(body);
        expect(parsedBody.serverTime).to.be.approximately(new Date().valueOf(), 1000);
        done();
      });
    });
  });

  describe('/viewmodel', () => {
    it('Returns viewmodel of existing character', done => {
      request.get(address + '/viewmodel/existing_viewmodel', (error, response, body) => {
        expect(error).to.be.null;
        expect(response.statusCode).to.eq(200);
        expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
        let parsedBody = JSON.parse(body);
        expect(parsedBody.serverTime).to.be.approximately(new Date().valueOf(), 1000);
        expect(parsedBody.id).to.equal("existing_viewmodel");
        expect(parsedBody.viewModel).to.deep.equal({ timestamp: 420, updatesCount: 0  });
        done();
      });
    });

    it('Returns 404 for non-existing character', done => {
      request.get(address + '/viewmodel/5555', (error, response, body) => {
        expect(response.statusCode).to.eq(404);
        done();
      });
    });
  });

  describe('POST /events', () => {
    it('Returns 400 if no events field present', done => {
      request.post(address + '/events/existing_viewmodel', { json: { foo: "bar" } }, (error, response, body) => {
        expect(error).to.be.null;
        expect(response.statusCode).to.eq(400);
        done();
      });
    });

    it('Returns 400 if events field is not an array', done => {
      request.post(address + '/events/existing_viewmodel', { json: { events: { foo: "bar" } } }, (error, response, body) => {
        expect(error).to.be.null;
        expect(response.statusCode).to.eq(400);
        done();
      });
    });

    it('Returns 404 for non-existing character', done => {
      request.post(address + '/events/5555', { json: { events: [] } }, (error, response, body) => {
        expect(response.statusCode).to.eq(404);
        done();
      });
    });

    it('Sets proper header', done => {
      request.post(address + '/events/existing_viewmodel', { json: { events: [] } }, (error, response, body) => {
        expect(error).to.be.null;
        expect(response.statusCode).to.eq(202);
        expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
        done();
      });
    });

    it('Puts event into db', done => {
      const event = {
        eventType: "TestEvent",
        timestamp: 4365,
        data: { foo: "ambar" }
      };
      request.post(address + '/events/existing_viewmodel', { json: { events: [event] } }, (error, response, body) => {
        expect(error).to.be.null;
        expect(response.statusCode).to.eq(202);
        eventsDb.allDocs({ include_docs: true }).then(result => {
          expect(result.rows.length).to.equal(1);
          const doc: any = result.rows[0].doc;
          expect(doc).to.deep.include(event);
          expect(doc).to.deep.include({ characterId: "existing_viewmodel" });
          done();
        })
      });
    });

    it('Returns viewmodel in case if processed in time', done => {
      const event = {
        eventType: "TestEvent",
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

      request.post(address + '/events/existing_viewmodel', { json: { events: [event] } }, (error, response, body) => {
        expect(error).to.be.null;
        expect(response.statusCode).to.eq(200);
        expect(body.serverTime).to.be.approximately(new Date().valueOf(), 1000);
        expect(body.id).to.equal("existing_viewmodel");
        expect(body.viewModel).to.deep.equal({ timestamp: 4365, updatesCount: 1 });
        done();
      });
    });

    it('Returns Accepted in case if not processed in time', done => {
      const event = {
        eventType: "TestEvent",
        timestamp: 4365
      };

      request.post(address + '/events/existing_viewmodel', { json: { events: [event] } }, (error, response, body) => {
        expect(error).to.be.null;
        expect(response.statusCode).to.eq(202);
        expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
        expect(body.serverTime).to.be.approximately(new Date().valueOf(), 1000);
        expect(body.id).to.equal("existing_viewmodel");
        expect(body.timestamp).to.equal(4365);
        done();
      });
    });    
/*
    it('Deduplicates events with same timestamp', done => {
      const event = {
        eventType: "TestEvent",
        timestamp: 4365,
        data: { foo: "ambar" }
      };
      request.post(address + '/events/existing_viewmodel', { json: { events: [event] } }, (error, response, body) => {
        expect(error).to.be.null;
        expect(response.statusCode).to.eq(202);
        request.post(address + '/events/existing_viewmodel', { json: { events: [event] } }, (error, response, body) => {
          eventsDb.allDocs({ include_docs: true }).then(result => {
            expect(result.rows.length).to.equal(1);
            done();
          })
        });
      });
    });
*/
  });
});

