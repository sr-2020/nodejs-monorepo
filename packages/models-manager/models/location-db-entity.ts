import { Entity, Column, PrimaryColumn } from 'typeorm';
import { Location } from '@sr2020/interface/models/location.model';

@Entity({
  name: 'location',
})
export class LocationDbEntity {
  @PrimaryColumn()
  id: number;

  @Column()
  timestamp: number;

  // TODO: Figure out how to store objects
  @Column()
  model: string;

  getModel(): Location {
    return JSON.parse(this.model);
  }

  static fromModel(m: Location): LocationDbEntity {
    const result = new LocationDbEntity();
    result.id = Number(m.modelId);
    result.timestamp = m.timestamp;
    result.model = JSON.stringify(m);
    return result;
  }
}
