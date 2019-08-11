import { Entity, model, property } from '@loopback/repository';
import { rproperty } from './alice-model-engine';

@model({
  name: 'transactions',
})
export class Transaction extends Entity {
  @property({ type: 'number', generated: true, id: true })
  id?: number;

  @property({ type: 'date', required: true })
  created_at: string;

  @rproperty()
  sin_from: number;

  @rproperty()
  sin_to: number;

  @rproperty()
  amount: number;

  @property()
  comment?: string;

  @property()
  recurrent_payment_id?: number;

  constructor(data?: Partial<Transaction>) {
    super(data);
  }
}
