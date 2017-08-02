import { effectNames, conditionTypes, implantClasses, implantCorp, implantSystems } from './constants'

export interface GenEffectData {
    position?: string
    value?: string;
    conditionText?: string;
    effectText?: string;
    effectClass?: string;
    conditionType?: string;
}

export interface MindEffectData {
    cube?: string;
    value?: string;
    text?: string;
    effectClass?: string;
}

export class ImplantData {
    id: string = "";
    name: string = "";
    class: string = "";
    system: string = "";
    desc: string = "";
    vendor: string = "";

    genEffect: GenEffectData[] = [];

    mindEffect: MindEffectData[] = [];

    rowNumbers: number[] = [];

    constructor(row: string[] = null, rowNumber: number = -1) {
        if (row) {
            this.genEffect.push({});
            this.mindEffect.push({});

            this.rowNumbers.push(rowNumber);

            [, this.id, this.name, this.class, this.system, this.desc,
                this.genEffect[0].position, this.genEffect[0].value, this.genEffect[0].conditionText, this.genEffect[0].effectText, this.genEffect[0].conditionType, this.genEffect[0].effectClass,
                this.mindEffect[0].cube, this.mindEffect[0].value, this.mindEffect[0].text, this.mindEffect[0].effectClass] = row;

            this.updateCalcFields();
        }
    }

    public join(d: ImplantData): ImplantData {
        let ret = new ImplantData();

        let fields = ["id", "name", "class", "system", "desc"];
        fields.forEach(f => this.joinField(f, ret, d));

        ret.genEffect = Array.from(this.genEffect).concat(d.genEffect).filter(e => (e.effectText || e.conditionText))
        ret.mindEffect = Array.from(this.mindEffect).concat(d.mindEffect).filter(e => e.text)
        ret.rowNumbers = Array.from(this.rowNumbers).concat(d.rowNumbers);

        ret.updateCalcFields();

        return ret;
    }

    private joinField(f: string, t: ImplantData, d: ImplantData) {
        t[f] = this[f] ? this[f] : d[f];
    }

    public updateCalcFields() {
        if (this.id) {
            let parts = this.id.split("_");
            if (parts.length > 1) {
                this.vendor = implantCorp[parts[0].toLowerCase()];
            }
        }
    }

    public normolize() {
        this.id = this.id.toLowerCase();
        this.class = this.class.toLowerCase();
        this.system = this.system.toLowerCase();
        this.class = implantClasses[this.class] ? implantClasses[this.class] : "";
        this.system = implantSystems[this.system] ? implantSystems[this.system] : "";

        this.desc = this.desc ? this.desc.trim() : "";

        this.genEffect.forEach(eff => {
            eff.conditionText = eff.conditionText ? eff.conditionText.trim() : "";
            eff.effectText = eff.effectText ? eff.effectText.trim() : "";
            eff.effectClass = eff.effectClass ? eff.effectClass.trim() : "";
            eff.conditionType = eff.conditionType ? conditionTypes[eff.conditionType] : "";
        });

        this.mindEffect.forEach(eff => {
            eff.text = eff.text ? eff.text.trim() : "";
            eff.value = eff.value ? eff.value.toUpperCase().replace(/\s/ig, '') : "";
            eff.cube = eff.cube ? eff.cube.toUpperCase() : "";
            eff.effectClass = eff.effectClass ? eff.effectClass.trim() : "";
        });
    }
}
