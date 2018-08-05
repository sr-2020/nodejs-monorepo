import * as moment from "moment";

export class ImportRunStats {
    public importTime: moment.Moment;

    public imported: string[] = [];
    public created: string[] = [];
    public updated: string[] = [];

    constructor( t: moment.Moment = moment([1900, 0, 1]) ) {
        this.importTime = t;
    }
}