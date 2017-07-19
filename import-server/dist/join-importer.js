"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request-promise-native");
const config_1 = require("./config");
class JoinImporter {
    constructor() {
        this.access_token = "";
    }
    init() {
        //Get token
        let reqOpts = {
            url: config_1.config.joinTokenUrl,
            method: "POST",
            form: {
                grant_type: "password",
                username: config_1.config.joinLogin,
                password: config_1.config.joinPassword
            },
            timeout: config_1.config.requestTimeout,
            json: true
        };
        return request(reqOpts).then((result) => {
            console.log(`Received access token!`);
            this.access_token = result.access_token;
            return true;
        });
    }
    static createJoinCharacter(id) {
        return {
            CharacterId: id,
            CharacterLink: `${config_1.config.joinCharactersBasePath}/${id}/`
        };
    }
    //modifiedSince=2017-07-01
    getCharacterList(modifiedSince) {
        let reqOpts = {
            url: config_1.config.joinListUrl,
            qs: {
                modifiedSince: modifiedSince.format("YYYY-MM-DD") + "T" + modifiedSince.format("HH:mm:00.000")
            },
            method: "GET",
            auth: {
                bearer: this.access_token
            },
            timeout: config_1.config.requestTimeout,
            json: true
        };
        return request(reqOpts);
    }
    getCharacter(CharacterLink) {
        let reqOpts = {
            url: config_1.config.joinBaseUrl + CharacterLink,
            method: "GET",
            auth: {
                bearer: this.access_token
            },
            timeout: config_1.config.requestTimeout,
            json: true
        };
        return request(reqOpts);
    }
    getCharacterByID(id) {
        let url = `${config_1.config.joinCharactersBasePath}/${id}/`;
        return this.getCharacter(url);
    }
    getMetadata() {
        let reqOpts = {
            url: config_1.config.joinMetaUrl,
            method: "GET",
            auth: {
                bearer: this.access_token
            },
            timeout: config_1.config.requestTimeout,
            json: true
        };
        return request(reqOpts).then((m) => {
            this.metadata = m;
            return m;
        });
    }
}
exports.JoinImporter = JoinImporter;
//# sourceMappingURL=join-importer.js.map