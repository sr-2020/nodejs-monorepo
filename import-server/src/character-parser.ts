import { JoinCharacterDetail, JoinMetadata } from "./join-importer";

export class CharacterParser {
    constructor(
        public character: JoinCharacterDetail,
        public metadata: JoinMetadata
    ) {

    }

    hasFieldValue(fieldId: number, variantID: number): boolean {
        const value = this.joinNumListFieldValue(fieldId);
        return value.indexOf(variantID) != -1;
    }

    partOfGroup(characterGroupId: number): boolean {
        //TODO only direct groups here
        return this.character.Groups.some(group => group.CharacterGroupId == characterGroupId);
    }

    public joinStrFieldValue(fieldID: number): string {

        const field = this.character.Fields.find(fi => fi.ProjectFieldId == fieldID);

        if (!field) return "";

        return field.DisplayString.trim();
    }

    public joinBoolFieldValue(fieldID: number): boolean {

            let text = this.joinStrFieldValue(fieldID);
            return (text == 'on');
    }

    public joinNumFieldValue(fieldID: number): number {

        const field = this.character.Fields.find(fi => fi.ProjectFieldId == fieldID);

        if (field) {
            let value: number = Number.parseInt(field.Value);
            if (!Number.isNaN(value)) {
                return value;
            }
        }

        return Number.NaN;
    }

    public  joinFieldProgrammaticValue(fieldID: number): string {
        const fieldValue = this.joinNumFieldValue(fieldID);
        const fieldMetadata = this.metadata.Fields.find(f => f.ProjectFieldId == fieldID);
        
        const variant = fieldMetadata.ValueList.find(f => f.ProjectFieldVariantId == fieldValue);

        if (variant) {
            return variant.ProgrammaticValue;
        }
        return null;
    }

    
    //Конвертирует числовое ID значения поля мультивыбора в Description для этого значения
    //при конвертации убирает HTML-теги
    public convertToDescription(fieldID: number, variantID: number): string {
        let field = this.metadata.Fields.find(f => f.ProjectFieldId == fieldID);

        if (field && field.ValueList) {

            let value = field.ValueList.find(fv => fv.ProjectFieldVariantId == variantID);
            if (value && value.Description) {
                return value.Description.replace(/\<(.*?)\>/ig, '')
            }
        }

        return null;
    }

        //Возвращается Value, которое должно быть списком цифр, разделенных запятыми
    //Если в списке встретится что-то не цифровое, в массиве будет Number.NaN
    public joinNumListFieldValue(fieldID: number): number[] {
        const field = this.character.Fields.find(fi => fi.ProjectFieldId == fieldID);

        if (field) {
            return field.Value.split(',').map(el => Number.parseInt(el));
        }

        return [];
    }

}