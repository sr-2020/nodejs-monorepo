import { JoinCharacterDetail, JoinMetadata } from './join-importer';

export class CharacterParser {
  public characterId: number;
  public inGame: boolean;
  public isActive: boolean;

  constructor(
    public character: JoinCharacterDetail,
    public metadata: JoinMetadata,
  ) {
    this.characterId = character.CharacterId;
    this.inGame = character.InGame;
    this.isActive = character.IsActive;
  }

  public hasFieldValue(fieldId: number, variantID: number): boolean {
    const value = this.joinNumListFieldValue(fieldId);
    return value.indexOf(variantID) !== -1;
  }

  public partOfGroup(characterGroupId: number): boolean {
    return this.character.AllGroups.some((group) => group.CharacterGroupId === characterGroupId);
  }

  public joinStrFieldValue(fieldID: number): string {

    const field = this.character.Fields.find((fi) => fi.ProjectFieldId === fieldID);

    if (!field) { return ''; }

    return field.DisplayString.trim();
  }

  public joinBoolFieldValue(fieldID: number): boolean {

    const text = this.joinStrFieldValue(fieldID);
    return (text === 'on');
  }

  public joinNumFieldValue(fieldID: number): number {

    const field = this.character.Fields.find((fi) => fi.ProjectFieldId === fieldID);

    if (field) {
      const value: number = Number.parseInt(field.Value, 10);
      if (!Number.isNaN(value)) {
        return value;
      }
    }

    return Number.NaN;
  }

  public joinFieldProgrammaticValue(fieldID: number): string | null {
    const fieldValue = this.joinNumFieldValue(fieldID);
    const fieldMetadata = this.metadata.Fields.find((f) => f.ProjectFieldId === fieldID);

    if (!fieldMetadata) {
      throw new Error(`Can't find expected metadata for field ${fieldID}`);
    }

    const variant = fieldMetadata.ValueList.find((f) => f.ProjectFieldVariantId === fieldValue);

    if (variant) {
      return variant.ProgrammaticValue;
    }
    return null;
  }

  // Конвертирует числовое ID значения поля мультивыбора в Description для этого значения
  // при конвертации убирает HTML-теги
  public convertToDescription(fieldID: number, variantID: number): string | null {
    const field = this.metadata.Fields.find((f) => f.ProjectFieldId === fieldID);

    if (field && field.ValueList) {

      const value = field.ValueList.find((fv) => fv.ProjectFieldVariantId === variantID);
      if (value && value.Description) {
        return value.Description.replace(/\<(.*?)\>/ig, '');
      }
    }

    return null;
  }

  // Возвращается Value, которое должно быть списком цифр, разделенных запятыми
  // Если в списке встретится что-то не цифровое, в массиве будет Number.NaN
  public joinNumListFieldValue(fieldID: number): number[] {
    const field = this.character.Fields.find((fi) => fi.ProjectFieldId === fieldID);

    if (field) {
      return field.Value.split(',').map((el) => Number.parseInt(el, 10));
    }

    return [];
  }

}
