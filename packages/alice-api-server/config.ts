import { Configuration } from './services/settings';

export const config: Configuration = {
    databases: {
        username: process.env.COUCHDB_USER as string,
        password: process.env.COUCHDB_PASSWORD as string,
        accounts: 'http://couchdb:5984/accounts',
        models: 'http://couchdb:5984/work-models',
        metadata: 'http://couchdb:5984/metadata',
        events: 'http://couchdb:5984/events',
        economy: 'http://couchdb:5984/economy',
        objCounters: 'http://couchdb:5984/obj-counters',
        viewModels: [
          {type: 'mobile', url: 'http://couchdb:5984/view-models'},
        ],
    },

    settings: {
        port: 80,
        viewmodelUpdateTimeout: 15000,
        accessGrantTime: 60000,
        tooFarInFutureFilterTime: 1800000,
        pushSettings: {
            serverKey: process.env.PUSH_SERVERKEY as string,
        },
    },
};
