"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PouchDB = require("pouchdb");
const winston = require("winston");
const config_1 = require("./config");
let con = new PouchDB(`${config_1.config.url}${config_1.config.tempDbName}`);
con.get("10244").then((doc) => {
    winston.info(JSON.stringify(doc));
})
    .catch((e) => {
    winston.info("error: " + JSON.stringify(e));
});
//# sourceMappingURL=test-doc.js.map