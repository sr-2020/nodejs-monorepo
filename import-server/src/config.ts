import dotenv = require("dotenv");

if (process.env.NODE_ENV !== "production") {
    dotenv.load();
}

export const config = {
    port: process.env.PORT || 8100,

    url: "https://couchdb.alice.magellan2018.ru/",
    username: process.env.COUCHDB_USER,
    password: process.env.COUCHDB_PASSWORD,
    tempDbName: "join-import",
    modelDBName: "models",
    accountDBName: "accounts",
    eventsDBName: "events",

    importDelay: 200,
    importOnlyInGame: false,

    joinrpg: {
        login: process.env.JOINRPG_USER,
        password: process.env.JOINRPG_PASSWORD,
    },

    joinGameId: "329",
    joinBaseUrl: "https://joinrpg.ru",
    joinTokenUrl: "https://joinrpg.ru/x-api/token",
    joinListUrl: "https://joinrpg.ru/x-game-api/329/characters",
    joinMetaUrl: "https://joinrpg.ru/x-game-api/329/metadata/fields",
    joinCharactersBasePath: "/x-game-api/329/characters",

    importInterval: 300000,
    importBurstSize: 10,
    requestTimeout: 120000,
    importBurstDelay: 1000,

    log: {
        logFileName: "import-server.log",
        supportLogFileName: "import-support-server.log",
        elasticHost: "https://elasticsearch.alice.magellan2018.ru/",
    },

    mailServerAPIUrl: "",
};
