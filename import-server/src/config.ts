export const config = { 
        url : "https://alice.digital:6984/",
        tempDbName : "join-import",
        modelDBName: "models",
        accountDBName: "accounts",
        eventsDBName: "events",
        username : "import",
        password : "4a3n5hEyDL",
        port : 8100,
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
        logFileName: "import-server.log",
        mailServerAPIUrl: "https://alice.digital:8100/mailbox",

        catalogs: {
            effects: "dict-effects",
            illnesses: "dict-illnesses",
            implants:  "dict-implants",
            condition: "dict-conditions"
        }
    };

