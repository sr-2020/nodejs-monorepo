import * as moment from "moment";

export class ImportRunStats{
    public importTime: moment.Moment;

    public imported: string[] = []
    public created: string[] = []
    public updated: string[] = []

    constructor( t: moment.Moment = moment([1900,0,1]) ) {
        this.importTime = t;
    }
}

export class ImportStats {

    public imports: ImportRunStats[] = [];
    
    public lastRefreshTime = moment([1900,0,1]);
    //public lastRefreshTime = moment().subtract(3,"hours");
    
    constructor() {}

    toString(): string {
        return JSON.stringify( Array.from(this.imports).reverse(), null, 4)
    }

    public updateRefreshTime(){
        this.lastRefreshTime = moment();        
    }

    public addImportStats(s:ImportRunStats){
        this.lastRefreshTime = s.importTime;

        if(s.imported.length == 0){
            return;
        }

        if(this.imports.length > 100){
            this.imports.shift();
        }
        
        this.imports.push(s);
    }

}