import {Model, model} from '@loopback/repository';

@model()
export class Empty extends Model {
  constructor(data?: Partial<Empty>) {
    super(data);
  }
}
