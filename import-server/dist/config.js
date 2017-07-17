"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = {
    url: "https://alice.digital:6984/",
    tempDbName: "join-import",
    modelDBName: "models-test",
    accountDBName: "accounts-test",
    username: "import",
    password: "4a3n@hEyDL",
    port: 8100,
    joinGameId: "78",
    joinBaseUrl: "http://joinrpg.ru",
    joinTokenUrl: "http://joinrpg.ru/x-api/token",
    joinListUrl: "http://joinrpg.ru/x-game-api/78/characters",
    joinMetaUrl: "http://joinrpg.ru/x-game-api/78/metadata/fields",
    joinLogin: "Info@deus.rpg.ru",
    joinPassword: "mustg00n",
    importInterval: 300000,
    importBurstSize: 10,
    requestTimeout: 120000,
    catalogs: {
        effects: "dict-effects",
        illnesses: "dict-illnesses",
        implants: "dict-implants"
    }
};
//# sourceMappingURL=config.js.map