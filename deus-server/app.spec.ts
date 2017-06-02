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
  let eventsDb: PouchDB.Database<{}>;
  let viewModelDb: PouchDB.Database<{data: any}>;
  var db = new PouchDB('dbname', {adapter: 'memory'});
  beforeEach(() => {
    eventsDb = new PouchDB('events', {adapter: 'memory'});
    viewModelDb = new PouchDB('viewmodel', {adapter: 'memory'});
    app = new App(eventsDb, viewModelDb);
    app.listen(port);
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
        expect(response.statusCode).to.eq(200)
        expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
        let parsedBody = JSON.parse(body);
        expect(parsedBody.serverTime).to.be.approximately(new Date().valueOf(), 1000);
        done();
      });
    });
  });

  describe('/time', () => {
    beforeEach(done => {
      viewModelDb.put({_id: "1234",  data: {foo: 'bar'}}, done);
    })
    afterEach(done => {
      viewModelDb.get("1234").then(
        (doc: any) => viewModelDb.remove(doc, done)
      );
    })    

    it('Returns viewmodel of existing character', done => {
      request.get(address + '/viewmodel/1234', (error, response, body) => {
        expect(error).to.be.null;
        expect(response.statusCode).to.eq(200)
        expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
        let parsedBody = JSON.parse(body);
        expect(parsedBody.serverTime).to.be.approximately(new Date().valueOf(), 1000);
        expect(parsedBody.id).to.equal("1234");
        expect(parsedBody.viewModel).to.deep.equal({data: {foo: "bar"}});
        done();
      });
    });

    it('Returns 404 for non-existing character', done => {
      request.get(address + '/viewmodel/5555', (error, response, body) => {
        expect(response.statusCode).to.eq(404)
        done();
      });
    });
  });

});

