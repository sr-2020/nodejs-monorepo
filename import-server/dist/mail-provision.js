"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request-promise-native");
const config_1 = require("./config");
const alice_exporter_1 = require("./alice-exporter");
class MailProvision {
    constructor() {
        this.eventsCon = null;
    }
    //Послать запрос на создание e-mail'ов
    createEmails(chars) {
        let usersList = chars.map(c => {
            let nameParts = alice_exporter_1.AliceExporter.parseFullName(alice_exporter_1.AliceExporter.joinStrFieldValue(c, 496));
            return {
                id: c._id,
                login: alice_exporter_1.AliceExporter.joinStrFieldValue(c, 1905).split("@")[0],
                password: alice_exporter_1.AliceExporter.joinStrFieldValue(c, 2039),
                fullName: nameParts.fullName,
                firstName: nameParts.firstName,
                lastName: nameParts.lastName
            };
        }).filter(u => u.login && u.password);
        let reqOpts = {
            url: config_1.config.mailServerAPIUrl,
            method: "POST",
            body: { users: usersList },
            timeout: config_1.config.requestTimeout,
            json: true
        };
        return request(reqOpts);
        //return Promise.resolve('{ "type": "moke" }');
    }
}
exports.MailProvision = MailProvision;
//# sourceMappingURL=mail-provision.js.map