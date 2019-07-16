import { Entity, model, property } from '@loopback/repository';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';

@model({
  name: 'sr2020-character',
})
export class CharacterDbEntity extends Entity {
  @property({ required: true, id: true })
  id: number;

  @property({ required: true })
  timestamp: number;

  // TODO: Figure out how to store objects
  @property({ required: true })
  model: string;

  getModel(): Sr2020Character {
    return JSON.parse(this.model);
  }

  static fromModel(m: Sr2020Character): CharacterDbEntity {
    return new CharacterDbEntity({ id: Number(m.modelId), timestamp: m.timestamp, model: JSON.stringify(m) });
  }

  constructor(data?: Partial<CharacterDbEntity>) {
    super(data);
  }
}
