import { Model, model, property } from '@loopback/repository';
import { Transaction } from './transaction.model';

@model()
export class AccountInfo extends Model {
  @property({ type: 'number', required: true })
  sin: number;

  @property({ type: 'number', required: true })
  balance: number;

  @property.array(Transaction, { required: true })
  history: Transaction[];

  constructor(data?: Partial<AccountInfo>) {
    super(data);
  }
}
