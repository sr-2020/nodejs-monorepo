export const config = {
    port: 8100,

    url: "http://35.198.142.140:5984",
    username: process.env.COUCHDB_USER,
    password: process.env.COUCHDB_PASSWORD,
    tempDbName: "join-import",
    modelDBName: "models",
    accountDBName: "accounts",
    eventsDBName: "events",

    importDelay: 200,
    importOnlyInGame: false,

    joinGameId: "329",
    joinBaseUrl: "https://joinrpg.ru",
    joinTokenUrl: "https://joinrpg.ru/x-api/token",
    joinListUrl: "https://joinrpg.ru/x-game-api/329/characters",
    joinMetaUrl: "https://joinrpg.ru/x-game-api/329/metadata/fields",
    joinCharactersBasePath: "/x-game-api/329/characters",
    joinLogin: process.env.JOINRPG_USER,
    joinPassword: process.env.JOINRPG_PASSWORD,

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

    economicsApiUrl: "",
    economicsLogin: "alice",
    economicsPassword: "xxxx",
    economicsStartCash: 100,

    catalogs: {
        effects: "",
        illnesses: "",
        implants: "",
        condition: "",
        pills: "",
        events: ""
    }
};

