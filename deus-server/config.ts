import { Configuration } from "./services/settings";

export const config: Configuration = {
    databases: {
        username: process.env.COUCHDB_USER,
        password: process.env.COUCHDB_PASSWORD,
        accounts: "http://couchdb:5984/accounts",
        events: "http://couchdb:5984/events",
        compactEventsViewEveryMs: 5 * 60 * 1000,
        economy: "http://couchdb:5984/economy",
        viewModels: [
          {type: "mobile", url: "http://couchdb:5984/view-models"},
          {type: "default", url: "http://couchdb:5984/accounts"}
        ]
    },

    port: 8157,

    settings: {
        viewmodelUpdateTimeout: 15000,
        accessGrantTime: 60000,
        tooFarInFutureFilterTime: 1800000,
        pushSettings: {
            serverKey: process.env.PUSH_SERVERKEY,
        }
    }
}

