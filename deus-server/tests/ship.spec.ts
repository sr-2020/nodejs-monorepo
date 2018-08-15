import * as PouchDB from 'pouchdb';
import * as PouchDBUpsert from 'pouchdb-upsert';
PouchDB.plugin(PouchDBUpsert);

import 'mocha';

import { Container } from 'typedi';

import App from '../app';
import { DatabasesContainerToken } from '../services/db-container';
import { LoggerToken, WinstonLogger } from '../services/logger';
import { ApplicationSettings, ApplicationSettingsToken, PushSettings } from '../services/settings';

import { createEmptyAccount, TestDatabasesContainer } from './test-db-container';

import { expect } from 'chai';
import * as rp from 'request-promise';

const address = `http://localhost:3000`;

describe('Ships', () => {

  let app: App;
  let dbContainer: TestDatabasesContainer;

  const pushSettings: PushSettings = {
    autoRefresh: {
      notifyIfInactiveForMoreThanMs: 10000, performOncePerMs: 160,
    },
    serverKey: 'fakeserverkey',
  };

  const settings: ApplicationSettings = {
    port: 3000, viewmodelUpdateTimeout: 20, accessGrantTime: 200,
    tooFarInFutureFilterTime: 30000, pushSettings,
  };
  Container.set(ApplicationSettingsToken, settings);
  Container.set(LoggerToken, new WinstonLogger({ level: 'warning' }));

  beforeEach(async () => {
    dbContainer = new TestDatabasesContainer();

    Container.set(DatabasesContainerToken, dbContainer);

    await dbContainer.accountsDb().post(
      {...createEmptyAccount(), _id: '99999', login: 'admin', password: 'admin', roles: ['admin'] },
    );

    app = new App();
    await app.listen();
  });

  afterEach(async () => {
    app.stop();
    await dbContainer.destroyDatabases();
  });

    it('Can set shields balance', async () => {
      const response = await rp.get(address + '/ships/set_shields/1/100',
        {
          resolveWithFullResponse: true, json: {},
          auth: { username: 'admin', password: 'admin' },
        }).promise();

      const ship1 = await dbContainer.objCounterDb().get('ship_1');

      expect(ship1.shield).to.equal('100');

      expect(response.statusCode).to.eq(200);
    });

});
