import { effectNames, conditionTypes, implantClasses, implantCorp, implantSystems } from './constants'

export class ConditionData{
    id: string = "";
    cube: string = "";
    value: string = "";
    title: string = "";
    details: string = "";

    rowNumber: number;
    

    constructor( row: string[] = null, rowNumber:number = -1 ){
        if(row){
            this.rowNumber = rowNumber;

            [this.id,,,, this.cube, this.value, this.title, this.details] = row;
            
            this.normolize();
        }
    }

    public normolize(){
        this.id = this.id ? this.id.trim().toLowerCase() : "";
        this.cube = this.cube ? this.cube.trim().toUpperCase() : "";
        this.value = this.value ? this.value.replace(/\s/i,'') : "";
        this.title = this.title ? this.title.trim() : "";
        this.details = this.details ? this.details.trim() : "";
    }
}
