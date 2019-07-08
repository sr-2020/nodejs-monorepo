import { Entity, model, property } from '@loopback/repository';
import { DeusExModel } from '@sr2020/interface/models/deus-ex-model';

@model({
  name: 'deus-character',
})
export class DeusExModelDbEntity extends Entity {
  @property({ required: true, id: true })
  id: number;

  @property({ required: true })
  timestamp: number;

  // TODO: Figure out how to store objects
  @property({ required: true })
  model: string;

  getModel(): DeusExModel {
    return JSON.parse(this.model);
  }

  static fromModel(m: DeusExModel): DeusExModelDbEntity {
    return new DeusExModelDbEntity({ id: Number(m.modelId), timestamp: m.timestamp, model: JSON.stringify(m) });
  }

  constructor(data?: Partial<DeusExModelDbEntity>) {
    super(data);
  }
}
