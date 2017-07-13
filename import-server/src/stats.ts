import * as moment from "moment";

export class ImportStats {
    
    public updatedRecords = 0;
    public createdRecords = 0;
    
    public lastRefreshTime = moment();

    public lastUpdatedTime:any = null;
    public lastCreatedTime:any = null;

    public lastCreatedName  = "";
    public lastUpdatedName = "";

    public createdList: string[] = [];
    public updatedList: string[] = [];
    
    constructor() {}

    toString(): string {
        return JSON.stringify( { created: this.createdRecords, 
                                    updated: this.updatedRecords, 
                                    lastUpdate: this.lastRefreshTime.format("DD-MM-YYYY HH:mm:ss") },
                                    null,
                                    4
                                );
    }

    public updateRefreshTime(){
        this.lastRefreshTime = moment();        
    }

    public addCreated(id: string){
        this.createdList.push(id);

        this.lastCreatedName = id;
        this.lastCreatedTime = moment();
    }

    public addUpdated(id: string){
        this.updatedList.push(id);
        
        this.lastUpdatedName = id;
        this.lastUpdatedTime = moment();
    }


}