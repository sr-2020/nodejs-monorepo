import { Entity, model, property } from '@loopback/repository';
import { Location } from '@sr2020/interface/models/location.model';

@model({
  name: 'location',
})
export class LocationDbEntity extends Entity {
  @property({ required: true, id: true })
  id: number;

  @property({ required: true })
  timestamp: number;

  // TODO: Figure out how to store objects
  @property({ required: true })
  model: string;

  getModel(): Location {
    return JSON.parse(this.model);
  }

  static fromModel(m: Location): LocationDbEntity {
    return new LocationDbEntity({ id: Number(m.modelId), timestamp: m.timestamp, model: JSON.stringify(m) });
  }

  constructor(data?: Partial<LocationDbEntity>) {
    super(data);
  }
}
