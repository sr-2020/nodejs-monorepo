import { Entity, Column, PrimaryColumn } from 'typeorm';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';

@Entity({
  name: 'sr2020-character',
})
export class CharacterDbEntity {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'bigint' })
  timestamp: number;

  // TODO: Figure out how to store objects
  @Column()
  model: string;

  getModel(): Sr2020Character {
    return JSON.parse(this.model);
  }

  fromModel(m: Sr2020Character): this {
    this.id = Number(m.modelId);
    this.timestamp = m.timestamp;
    this.model = JSON.stringify(m);
    return this;
  }
}
