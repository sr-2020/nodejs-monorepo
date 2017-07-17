"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        console.log("getCharacterList: url=" + reqOpts.url);
        return request(reqOpts);
    }
    getCharacter(CharacterLink) {
        return __awaiter(this, void 0, void 0, function* () {
            let reqOpts = {
                url: config_1.config.joinBaseUrl + CharacterLink,
                method: "GET",
                auth: {
                    bearer: this.access_token
                },
                timeout: config_1.config.requestTimeout,
                json: true
            };
            console.log(`Try to import character: ${CharacterLink}`);
            return request(reqOpts);
        });
    }
    getCharacterByID(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let url = `${config_1.config.joinCharactersBasePath}/${id}/`;
            return this.getCharacter(url);
        });
    }
    getMetadata() {
        return __awaiter(this, void 0, void 0, function* () {
            let reqOpts = {
                url: config_1.config.joinMetaUrl,
                method: "GET",
                auth: {
                    bearer: this.access_token
                },
                timeout: config_1.config.requestTimeout,
                json: true
            };
            return request(reqOpts);
        });
    }
}
exports.JoinImporter = JoinImporter;
//# sourceMappingURL=join-importer.js.map