"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PouchDB = require("pouchdb");
const config_1 = require("./config");
class ModelRefresher {
    constructor() {
        this.eventsCon = null;
        const ajaxOpts = {
            auth: {
                username: config_1.config.username,
                password: config_1.config.password
            }
        };
        this.eventsCon = new PouchDB(`${config_1.config.url}${config_1.config.eventsDBName}`, ajaxOpts);
    }
    //Послать _Refresh событие для экспортрованной модели, что бы сформировалась Work/ViewModel
    sentRefreshEvent(id) {
        let timestamp = Date.now().toString();
        let event = {
            characterId: id,
            timestamp: timestamp,
            eventType: "_RefreshModel",
            data: ""
        };
        return this.eventsCon.post(event);
    }
}
exports.ModelRefresher = ModelRefresher;
//# sourceMappingURL=model-refresher.js.map