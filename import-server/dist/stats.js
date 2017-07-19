"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
class ImportRunStats {
    constructor(t = moment([1900, 0, 1])) {
        this.imported = [];
        this.created = [];
        this.updated = [];
        this.importTime = t;
    }
}
exports.ImportRunStats = ImportRunStats;
class ImportStats {
    //public lastRefreshTime = moment().subtract(3,"hours");
    constructor() {
        this.imports = [];
        this.lastRefreshTime = moment([1900, 0, 1]);
    }
    toString() {
        return JSON.stringify(Array.from(this.imports).reverse(), null, 4);
    }
    updateRefreshTime() {
        this.lastRefreshTime = moment.utc();
    }
    addImportStats(s) {
        this.lastRefreshTime = s.importTime;
        if (s.imported.length == 0) {
            return;
        }
        if (this.imports.length > 100) {
            this.imports.shift();
        }
        this.imports.push(s);
    }
}
exports.ImportStats = ImportStats;
//# sourceMappingURL=stats.js.map