import { Entity, Column, PrimaryColumn } from 'typeorm';
import { Location } from '@sr2020/interface/models/location.model';

@Entity({
  name: 'location',
})
export class LocationDbEntity {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'bigint' })
  timestamp: number;

  // TODO: Figure out how to store objects
  @Column()
  model: string;

  getModel(): Location {
    return JSON.parse(this.model);
  }

  fromModel(m: Location): this {
    this.id = Number(m.modelId);
    this.timestamp = m.timestamp;
    this.model = JSON.stringify(m);
    return this;
  }
}
