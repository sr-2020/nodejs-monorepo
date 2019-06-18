import {Model, model, property} from '@loopback/repository';

@model()
export class PushResult extends Model {
  @property({type: 'number', required: true})
  success: number;

  @property({type: 'number', required: true})
  failure: number;

  constructor(data?: Partial<PushResult>) {
    super(data);
  }
}
