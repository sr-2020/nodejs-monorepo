import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { Entity, Column, PrimaryColumn } from 'typeorm';
import { JsonColumn } from '../utils/db-utils';

@Entity({
  name: 'sr2020-character',
})
export class CharacterDbEntity {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'bigint' })
  timestamp: number;

  @JsonColumn()
  model: Sr2020Character;

  getModel(): Sr2020Character {
    return this.model;
  }

  fromModel(m: Sr2020Character): this {
    this.id = Number(m.modelId);
    this.timestamp = m.timestamp;
    this.model = m;
    return this;
  }
}
