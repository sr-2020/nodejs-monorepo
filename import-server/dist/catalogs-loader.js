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
const PouchDB = require("pouchdb");
const config_1 = require("./config");
class CatalogsLoader {
    constructor() {
        this.catalogs = {};
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let alias in config_1.config.catalogs) {
                let db = new PouchDB(`${config_1.config.url}${config_1.config.catalogs[alias]}`);
                let docs = yield db.allDocs({ include_docs: true });
                this.catalogs[alias] = docs.rows;
            }
        });
    }
    findElement(catalogName, id) {
        if (this.catalogs[catalogName]) {
            return this.catalogs[catalogName].find(e => e._id == id);
        }
        return undefined;
    }
}
exports.CatalogsLoader = CatalogsLoader;
//# sourceMappingURL=catalogs-loader.js.map