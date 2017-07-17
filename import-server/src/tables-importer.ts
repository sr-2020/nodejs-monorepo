import { Observable } from 'rxjs/Rx';

import * as moment from "moment";
import * as PouchDB from 'pouchdb';
import * as request from 'request-promise-native';
import * as google from 'googleapis';

let sheets = google.sheets('v4');



export class TablesImporter{
    constructor() {}


    authorize(): Promise<any>{
        return new Promise( (resolve, reject) => {
            google.auth.getApplicationDefault((err, authClient) => {
                if(err) reject(err);

                if (authClient.createScopedRequired && authClient.createScopedRequired() ) {
                    var scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
                    authClient = authClient.createScoped(scopes);
                }

                resolve(authClient);
            });
        });
    }

    import(): Observable<any> {
        return Observable.fromPromise(this.authorize())
                .flatMap((authClient) => {
                    console.log("Authorization success!");
                    return this.importImpl(authClient)
                });
    }

    private importImpl(authClient): Observable<any>{
         var request = {
            spreadsheetId: '1703sXU-akDfn9dsnt19zQjvRrSs7kePPGDkcX0Zz-bY',
            range: 'A1:N5',
            valueRenderOption: 'FORMATTED_VALUE',
            dateTimeRenderOption: 'SERIAL_NUMBER',
            auth: authClient,
        };

        let sheetsGet = <Function>Observable.bindNodeCallback(sheets.spreadsheets.values.get);

        return sheetsGet(request);
    }
}


let importer = new TablesImporter();

importer.import().subscribe((result) => { 
            console.log("Import finished: " + JSON.stringify(result, null, 4));
        },
        (err) => {
            console.log('Authentication failed because of ', err);
        });

