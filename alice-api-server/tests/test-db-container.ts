import { TSMap } from 'typescript-map';

import * as PouchDB from 'pouchdb';
import * as PouchDBUpsert from 'pouchdb-upsert';
PouchDB.plugin(PouchDBUpsert);

import { Event } from 'alice-model-engine-api';
import { AliceAccount, Professions, ShieldValues } from '../models/alice-account';
import { EconomyConstants } from '../models/economy-constants';
import { BalancesDocument, DatabasesContainer, TransactionDocument } from '../services/db-container';

export function createEmptyAccount(): AliceAccount {
  const trade = {
    isPilot: false,
    isNavigator: false,
    isCommunications: false,
    isSupercargo: false,
    isEngineer: false,
    isBiologist: false,
    isPlanetolog: false,
  };

  const professions: Professions = {
    ...trade,
    isTopManager: false,
    isSecurity: false,
    isManager: false,
    isIdelogist: false,
    isJournalist: false,
  };

  return {
    _id: '-',
    login: '-',
    companyAccess: [],
    professions: professions,
    jobs: {
      companyBonus: [],
      tradeUnion: trade,
    },
    password: '',
  };
}

export class TestDatabasesContainer extends DatabasesContainer {

  constructor() {
    const eventsDb = new PouchDB<Event>('events', { adapter: 'memory' });
    const mobileViewModelDb = new PouchDB<{ timestamp: number }>('viewmodels_mobile', { adapter: 'memory' });
    const modelDb = new PouchDB('models', { adapter: 'memory' });
    const viewmodelDbs = new TSMap<string, PouchDB.Database<{ timestamp: number }>>([['mobile', mobileViewModelDb]]);
    const accountsDb = new PouchDB<AliceAccount>('accounts', { adapter: 'memory' });
    const economyDb = new PouchDB<TransactionDocument | BalancesDocument | EconomyConstants>
      ('economy', { adapter: 'memory' });
    const objCountersDb = new PouchDB<ShieldValues>('obj-counters', { adapter: 'memory' });
    super(accountsDb, modelDb, viewmodelDbs, eventsDb, economyDb, objCountersDb);
  }

  public async allEventsSortedByTimestamp(): Promise<any[]> {
    return (await this._eventsDb.allDocs({ include_docs: true })).rows
      .filter((row) => row.id[0] != '_')
      .sort((row1, row2) => (row1.doc ? row1.doc.timestamp : 0) - (row2.doc ? row2.doc.timestamp : 0));
  }

  public async destroyDatabases() {
    await this._accountsDb.destroy();
    await this._economyDb.destroy();
    await this._eventsDb.destroy();
    await this._modelsDb.destroy();
    for (const db of this._viewmodelDbs.values())
      await db.destroy();
  }

  public async createViews() {
    await this.createIndices();

    await (this.eventsDb() as PouchDB.Database<any>).put({
      _id: '_design/character',
      views: {
        'refresh-events': {
          // tslint:disable-next-line:max-line-length
          map: "function (doc) { if (doc.timestamp && doc.characterId && doc.eventType == '_RefreshModel') emit([doc.characterId, doc.timestamp]);  }",
        },
      },
    });
  }
}
