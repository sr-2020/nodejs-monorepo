"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Rx_1 = require("rxjs/Rx");
const google = require("googleapis");
let sheets = google.sheets('v4');
class TablesImporter {
    constructor() { }
    authorize() {
        return new Promise((resolve, reject) => {
            google.auth.getApplicationDefault((err, authClient) => {
                if (err)
                    reject(err);
                if (authClient.createScopedRequired && authClient.createScopedRequired()) {
                    var scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
                    authClient = authClient.createScoped(scopes);
                }
                resolve(authClient);
            });
        });
    }
    import() {
        return Rx_1.Observable.fromPromise(this.authorize())
            .flatMap((authClient) => {
            console.log("Authorization success!");
            return this.importImpl(authClient);
        });
    }
    importImpl(authClient) {
        var request = {
            spreadsheetId: '1703sXU-akDfn9dsnt19zQjvRrSs7kePPGDkcX0Zz-bY',
            range: 'A1:N5',
            valueRenderOption: 'FORMATTED_VALUE',
            dateTimeRenderOption: 'SERIAL_NUMBER',
            auth: authClient,
        };
        let sheetsGet = Rx_1.Observable.bindNodeCallback(sheets.spreadsheets.values.get);
        return sheetsGet(request);
    }
}
exports.TablesImporter = TablesImporter;
let importer = new TablesImporter();
importer.import().subscribe((result) => {
    console.log("Import finished: " + JSON.stringify(result, null, 4));
}, (err) => {
    console.log('Authentication failed because of ', err);
});
//# sourceMappingURL=tables-importer.js.map