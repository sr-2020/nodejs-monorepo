import { Entity, Column, PrimaryColumn } from 'typeorm';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';

@Entity({
  name: 'sr2020-character',
})
export class CharacterDbEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  timestamp: number;

  // TODO: Figure out how to store objects
  @Column()
  model: string;

  getModel(): Sr2020Character {
    return JSON.parse(this.model);
  }

  static fromModel(m: Sr2020Character): CharacterDbEntity {
    const result = new CharacterDbEntity();
    result.id = Number(m.modelId);
    result.timestamp = m.timestamp;
    result.model = JSON.stringify(m);
    return result;
  }
}
