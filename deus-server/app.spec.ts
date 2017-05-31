import * as http from 'http'
import * as request from 'request'

import { expect } from 'chai';
import 'mocha';

import app from './app'

const port = 3000;
const address = 'http://localhost:' + port;

describe('Express app', () => {
  let server: http.Server;
  beforeEach(() => {
    server = app.listen(port);
  })
  afterEach(done => {
    server.close(() => done());
  })

  it('/time', done => {
    request(address + '/time', (error, response, body) => {
      expect(error).to.be.null;
      expect(response.statusCode).to.eq(200)
      expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
      let parsedBody = JSON.parse(body);
      expect(parsedBody.time).to.be.approximately(new Date().valueOf(), 1000);
      done();
    });
  });
});

