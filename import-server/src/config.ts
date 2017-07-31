export const config = {
    port: 8100,
    importDelay: 200,

    url: "https://alice.digital:6984/",
    username: "import",
    password: "4a3n5hEyDL",
    tempDbName: "join-import",
    modelDBName: "models",
    accountDBName: "accounts",
    eventsDBName: "events",

    joinGameId: "78",
    joinBaseUrl: "http://joinrpg.ru",
    joinTokenUrl: "http://joinrpg.ru/x-api/token",
    joinListUrl: "http://joinrpg.ru/x-game-api/78/characters",
    joinMetaUrl: "http://joinrpg.ru/x-game-api/78/metadata/fields",
    joinCharactersBasePath: "/x-game-api/78/characters",
    joinLogin: "Info@deus.rpg.ru",
    joinPassword: "mustg00n",

    importInterval: 300000,
    importBurstSize: 10,
    requestTimeout: 120000,
    importBurstDelay: 1000,

    logFileName: "import-server.log",
    supportLogFileName: "import-support-server.log",

    mailServerAPIUrl: "https://alice.digital:8100/mailbox",

    economicsApiUrl: "https://alice.digital/econ/api",
    economicsLogin: "alice",
    economicsPassword: "mechanus7534",
    economicsStartCash: 100,

    catalogs: {
        effects: "dict-effects",
        illnesses: "dict-illnesses",
        implants: "dict-implants",
        condition: "dict-conditions",
        pills: "dict-pills",
        events: "dict-events"
    }
};

