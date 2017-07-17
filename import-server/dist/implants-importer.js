"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const google = require("googleapis");
class ImplantsImporter {
    constructor() { }
    // authorize(): Observable<any>{
    //     let getApplicationDefaultAsObservabl = 
    //             Observable.bindNodeCallback(google.auth.getApplicationDefault);
    //     return getApplicationDefaultAsObservabl()
    //             .map( (authClient:any)=> {
    //                     if (authClient.createScopedRequired && authClient.createScopedRequired() ) {
    //                         var scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
    //                         authClient = authClient.createScoped(scopes);
    //                     }
    //                     return authClient;
    //              });
    // }
    // async import(){
    //     console.log("Implant import stated!");
    //     this.authorize().subscribe(
    //         (authClient:any) => {
    //              console.log("Authorization success!");
    //         },
    //         (err) => {
    //             console.log('Authentication failed because of ', err);
    //         }
    //     )
    // }
    import() {
        google.auth.getApplicationDefault(function (err, authClient) {
            if (err) {
                console.log('Authentication failed because of ', err);
                return;
            }
            if (authClient.createScopedRequired && authClient.createScopedRequired()) {
                var scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
                authClient = authClient.createScoped(scopes);
            }
            console.log("Authorization success!");
        });
    }
}
exports.ImplantsImporter = ImplantsImporter;
function test() {
    let importer = new ImplantsImporter();
    importer.import();
    process.exit(0);
}
test();
//# sourceMappingURL=implants-importer.js.map