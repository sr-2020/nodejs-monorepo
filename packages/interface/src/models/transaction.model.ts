import { Entity, model, property } from '@loopback/repository';

@model({
  name: 'transactions',
})
export class Transaction extends Entity {
  @property({ type: 'number', generated: true, id: true })
  id?: number;

  @property({ type: 'date', required: true })
  created_at: string;

  @property({ type: 'number', required: true })
  sin_from: number;

  @property({ type: 'number', required: true })
  sin_to: number;

  @property({ type: 'number', required: true })
  amount: number;

  @property({ type: 'string' })
  comment?: string;

  @property({ type: 'number' })
  recurrent_payment_id?: number;

  constructor(data?: Partial<Transaction>) {
    super(data);
  }
}
