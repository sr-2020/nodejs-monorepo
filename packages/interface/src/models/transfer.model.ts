import { Model, model, property } from '@loopback/repository';

@model()
export class Transfer extends Model {
  @property({ type: 'number', required: true })
  sin_from: number;

  @property({ type: 'number', required: true })
  sin_to: number;

  @property({ type: 'number', required: true })
  amount: number;

  @property({ type: 'string' })
  comment?: string;
}
