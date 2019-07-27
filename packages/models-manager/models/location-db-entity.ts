import { Entity, Column, PrimaryColumn } from 'typeorm';
import { Location } from '@sr2020/interface/models/location.model';
import { JsonColumn } from '../utils/db-utils';

@Entity({
  name: 'location',
})
export class LocationDbEntity {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'bigint' })
  timestamp: number;

  @JsonColumn()
  model: Location;

  getModel(): Location {
    return this.model;
  }

  fromModel(m: Location): this {
    this.id = Number(m.modelId);
    this.timestamp = m.timestamp;
    this.model = m;
    return this;
  }
}
