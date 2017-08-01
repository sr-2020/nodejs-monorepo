import { effectNames, conditionTypes, implantClasses, implantCorp, implantSystems, systems } from './constants'

export class IllnessData{
    id: string = "";
    displayName: string = "";
    system: string = "";
    
    stages: { duration: string, text: string  }[] = []

    rowNumber: number;
    

    constructor( row: string[] = null, rowNumber:number = -1 ){
        if(row){
            this.rowNumber = rowNumber;

            [,  this.id, this.displayName, this.system ] = row;

            for(let i=0;i<8;i++){
                this.stages.push( {
                    duration : row[4+i*2],
                    text : row[4+i*2+1]
                });
            }
            
            this.normolize();
        }
    }

    public normolize(){
        this.id = this.id ? this.id.trim().toLowerCase() : "";
        this.displayName = this.displayName ? this.displayName.trim(): "";
        this.system = this.system ? systems[this.system.toLowerCase()] : "";

        this.stages.forEach( stage => { 
            stage.duration = stage.duration ? stage.duration.trim() : "";
            stage.text = stage.text ? stage.text.trim() : "";
        });
    }
}
