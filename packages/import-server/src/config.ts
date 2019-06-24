import dotenv = require('dotenv');

if (process.env.NODE_ENV !== 'production') {
  dotenv.load();
}

export const config = {
  port: process.env.PORT || 8100,

  url: 'https://couchdb.alice.aerem.in/',
  username: process.env.COUCHDB_USER,
  password: process.env.COUCHDB_PASSWORD,
  tempDbName: 'join-import',
  modelDBName: 'models',
  metadataDbName: 'metadata',
  workModelDBName: 'work-models',
  accountDBName: 'accounts',
  eventsDBName: 'events',

  importDelay: 200,
  importOnlyInGame: false,

  joinrpg: {
    login: process.env.JOINRPG_USER,
    password: process.env.JOINRPG_PASSWORD,
    baseUrl: 'https://joinrpg.ru',
    tokenPath: '/x-api/token',
    listPath: '/x-game-api/329/characters',
    metaPath: '/x-game-api/329/metadata/fields',
    charactersPath: '/x-game-api/329/characters',
  },

  econ: {
    baseUrl: 'https://api.alice.aerem.in',
    username: process.env.ADMIN_USER,
    password: process.env.ADMIN_PASSWORD,
  },

  importInterval: 300000,
  importBurstSize: 10,
  requestTimeout: 120000,
  importBurstDelay: 1000,

  log: {
    logFileName: 'import-server.log',
    warnFileName: 'import-server.warn.log',
    supportLogFileName: 'import-support-server.log',
    elasticHost: 'https://elasticsearch.alice.aerem.in/',
  },

  mailServerAPIUrl: '',
};
