"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const PouchDB = require("pouchdb");
const stats_1 = require("./stats");
const config_1 = require("./config");
const join_importer_1 = require("./join-importer");
class TempDbWriter {
    constructor() {
        this.con = null;
        this.exceptionIds = ["JoinMetadata", "lastImportStats"];
        this.lastStatsDocID = "lastImportStats";
        this.metadataDocID = "JoinMetadata";
        //PouchDB.plugin(pouchdbAuth);
        const ajaxOpts = {
            auth: {
                username: config_1.config.username,
                password: config_1.config.password
            }
        };
        this.con = new PouchDB(`${config_1.config.url}${config_1.config.tempDbName}`, ajaxOpts);
    }
    setFieldsNames(c, metadata) {
        c.Fields.forEach((f) => {
            let fmeta = metadata.Fields.find(v => v.ProjectFieldId == f.ProjectFieldId);
            f.FieldName = fmeta ? fmeta.FieldName : "";
        });
        return c;
    }
    saveCharacter(c) {
        c._id = c.CharacterId.toString();
        return this.con.get(c._id)
            .then((oldc) => {
            c._rev = oldc._rev;
            return this.con.put(c);
        })
            .catch(() => this.con.put(c));
    }
    saveLastStats(s) {
        let stats = {
            _id: this.lastStatsDocID,
            importTime: s.importTime.format("YYYY-MM-DDTHH:mm"),
            imported: s.imported,
            created: s.created,
            updated: s.updated
        };
        return this.con.get(this.lastStatsDocID)
            .then((oldc) => {
            stats._rev = oldc._rev;
            return this.con.put(stats);
        })
            .catch(() => this.con.put(stats));
    }
    getLastStats() {
        return this.con.get(this.lastStatsDocID).then((s) => {
            let ret = new stats_1.ImportRunStats(moment(s.importTime, "YYYY-MM-DDTHH:mm"));
            ret.created = s.created;
            ret.imported = s.imported;
            ret.updated = s.updated;
            return ret;
        })
            .catch(() => {
            return (new stats_1.ImportRunStats(moment([1900, 0, 1])));
        });
    }
    saveMetadata(s) {
        s._id = this.metadataDocID;
        return this.con.get(this.metadataDocID)
            .then((oldc) => {
            s._rev = oldc._rev;
            console.log("Metadata saved!");
            return this.con.put(s);
        })
            .catch(() => this.con.put(s));
    }
    getMetadata() {
        return this.con.get(this.metadataDocID)
            .catch(() => Promise.resolve(null));
    }
    getCacheCharactersList() {
        return this.con.allDocs().then((docs) => {
            return docs.rows
                .filter((doc) => !this.exceptionIds.find(e => e == doc.id))
                .map((doc) => join_importer_1.JoinImporter.createJoinCharacter(doc.id));
        });
    }
    getCacheCharacter(id) {
        return this.con.get(id);
    }
}
exports.TempDbWriter = TempDbWriter;
//# sourceMappingURL=tempdb-writer.js.map