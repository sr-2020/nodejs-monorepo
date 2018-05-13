import * as PouchDB from 'pouchdb';
import * as PouchDBUpsert from 'pouchdb-upsert';
PouchDB.plugin(PouchDBUpsert);

import * as winston from 'winston';
import * as rp from 'request-promise';

import { expect } from 'chai';
import 'mocha';

import { Container } from "typedi";

import App from '../app';
import {
  ApplicationSettings, PushSettings, CheckForInactivitySettings,
  ApplicationSettingsToken
} from '../services/settings';
import { DatabasesContainerToken } from '../services/db-container';
import { LoggerToken, WinstonLogger } from "../services/logger";
import { TestDatabasesContainer } from './test-db-container';
import { currentTimestamp } from '../utils';

const port = 3000;
const address = `http://localhost:${port}`

 describe('Economy', () => {

  let app: App;
  let dbContainer: TestDatabasesContainer;
  const testStartTime: number = currentTimestamp()

  const pushSettings: PushSettings = {
    autoRefresh: {
      notifyIfInactiveForMoreThanMs: 10000, performOncePerMs: 160,
    },
    serverKey: 'fakeserverkey',
  };

  const settings: ApplicationSettings = {
    viewmodelUpdateTimeout: 20, accessGrantTime: 200,
    tooFarInFutureFilterTime: 30000, pushSettings,
  };
  Container.set(ApplicationSettingsToken, settings);
  Container.set(LoggerToken, new WinstonLogger({ level: 'warning' }));

  async function addAccount(id: string, login: string, password: string, balance: number) {
    await dbContainer.accountsDb().post({ _id: id, login, password });
    await dbContainer.economyDb().upsert('balances', (doc) => {
      doc[id] = balance;
      return doc;
    });
  }

  beforeEach(async () => {
    dbContainer = new TestDatabasesContainer();

    await addAccount('00001', 'first', '1', 1000);
    await addAccount('00002', 'second', '2', 1000);
    await dbContainer.createViews();
    Container.set(DatabasesContainerToken, dbContainer);

    app = new App();
    await app.listen(port);
  });

  afterEach(async () => {
    app.stop();
    await dbContainer.destroyDatabases();
  });

  it('Can get balance', async () => {
    const response = await rp.get(address + '/economy/first',
      {
        resolveWithFullResponse: true, json: {},
        auth: { username: 'first', password: '1' },
      }).promise();
    expect(response.statusCode).to.eq(200);
    expect(response.body).to.deep.equal({ balance: 1000, history: [] });
  });

  it('Can transfer', async () => {
    let response = await rp.post(address + '/economy/transfer', {
      resolveWithFullResponse: true, json: { sender: 'first', receiver: 'second', amount: 15, description: 'For cookies' },
      auth: { username: 'first', password: '1' },
    }).promise();
    expect(response.statusCode).to.eq(200);

    response = await rp.post(address + '/economy/transfer', {
      resolveWithFullResponse: true, json: { sender: 'second', receiver: 'first', amount: 5, description: 'For dark side' },
      auth: { username: 'second', password: '2' },
    }).promise();
    expect(response.statusCode).to.eq(200);

    response = await rp.get(address + '/economy/00001',
      {
        resolveWithFullResponse: true, json: {},
        auth: { username: 'first', password: '1' },
      }).promise();
    expect(response.statusCode).to.eq(200);
    expect(response.body.balance).to.deep.equal(990);

    response = await rp.get(address + '/economy/00002',
      {
        resolveWithFullResponse: true, json: {},
        auth: { username: '00002', password: '2' },
      }).promise();
    expect(response.statusCode).to.eq(200);
    expect(response.body.balance).to.equal(1010);

    const history = response.body.history;
    expect(history).to.exist
    expect(history.length).to.equal(2);
    expect(history[0].timestamp).to.be.greaterThan(history[1].timestamp);
    expect(history[0].timestamp).to.be.approximately(currentTimestamp(), 1000);
    expect(history[1].timestamp).to.be.approximately(currentTimestamp(), 1000);
    delete history[0].timestamp;
    delete history[1].timestamp;
    expect(history).to.deep.equal([
      { sender: '00002', receiver: '00001', amount: 5, description: 'For dark side' },
      { sender: '00001', receiver: '00002', amount: 15, description: 'For cookies' },
    ]);
  });

  it('Can process simultaneous transfers', async () => {
    const promises: any[] = []
    for (let i = 0; i < 20; ++i) {
      promises.push(rp.post(address + '/economy/transfer', {
        resolveWithFullResponse: true, json: { sender: 'first', receiver: 'second', amount: 10, description: 'For cookies' },
        auth: { username: 'first', password: '1' },
      }).promise());
    }
    const responses = await Promise.all(promises);
    for (const response of responses)
      expect(response.statusCode).to.eq(200);

    const response = await rp.get(address + '/economy/00001',
      {
        resolveWithFullResponse: true, json: {},
        auth: { username: '00001', password: '1' },
      }).promise();
    expect(response.statusCode).to.eq(200);
    expect(response.body.balance).to.equal(800);

    const history = response.body.history;
    expect(history).to.exist
    expect(history.length).to.equal(20);
  });

  it('Get 401 if no auth', async () => {
    let response = await rp.post(address + '/economy/transfer', {
      resolveWithFullResponse: true, simple: false,
      json: { sender: 'first', receiver: 'second', amount: 15, description: 'For cookies' }
    }).promise();
    expect(response.statusCode).to.eq(401);
    expect(response.headers['WWW-Authenticate']).not.to.be.null;
  });

  it('Get 401 if incorrect password', async () => {
    let response = await rp.post(address + '/economy/transfer', {
      resolveWithFullResponse: true, simple: false,
      json: { sender: 'first', receiver: 'second', amount: 15, description: 'For cookies' },
      auth: { username: 'first', password: '3' },
    }).promise();
    expect(response.statusCode).to.eq(401);
    expect(response.headers['WWW-Authenticate']).not.to.be.null;
  });

  it('Get 401 if user do not have access', async () => {
    let response = await rp.post(address + '/economy/transfer', {
      resolveWithFullResponse: true, simple: false,
      json: { sender: 'first', receiver: 'second', amount: 15, description: 'For cookies' },
      auth: { username: 'second', password: '2' },
    }).promise();
    expect(response.statusCode).to.eq(401);
    expect(response.headers['WWW-Authenticate']).not.to.be.null;
  });

  it('Get 400 if spending more money than present', async () => {
    let response = await rp.post(address + '/economy/transfer', {
      resolveWithFullResponse: true, simple: false,
      json: { sender: 'first', receiver: 'second', amount: 1500, description: 'For cookies' },
      auth: { username: 'first', password: '1' },
    }).promise();
    expect(response.statusCode).to.eq(400);
  });

  it('Get 400 if spending negative amount', async () => {
    let response = await rp.post(address + '/economy/transfer', {
      resolveWithFullResponse: true, simple: false,
      json: { sender: 'first', receiver: 'second', amount: -15, description: 'For cookies' },
      auth: { username: 'first', password: '1' },
    }).promise();
    expect(response.statusCode).to.eq(400);
  });

  // TODO(https://deus2017.atlassian.net/browse/DEM-314)
  it.skip('Get 400 if amount is not a number', async () => {
    let response = await rp.post(address + '/economy/transfer', {
      resolveWithFullResponse: true, simple: false,
      json: { sender: 'first', receiver: 'second', amount: '15', description: 'For cookies' },
      auth: { username: 'first', password: '1' },
    }).promise();
    expect(response.statusCode).to.eq(400);
  });

});
