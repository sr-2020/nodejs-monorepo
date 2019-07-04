import { Entity, model, property } from '@loopback/repository';

@model({
  name: 'deus-character',
})
export class DeusExModelDbEntity extends Entity {
  @property({ required: true, id: true })
  id?: number;

  // TODO: Figure out how to store objects
  @property({ required: true })
  model: string;

  constructor(data?: Partial<DeusExModelDbEntity>) {
    super(data);
  }
}
