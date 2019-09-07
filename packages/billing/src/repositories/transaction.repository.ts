import { DefaultCrudRepository } from '@loopback/repository';
import { Transaction } from '@sr2020/interface/models';
import { PostgreSqlDataSource } from '../datasources';
import { inject } from '@loopback/core';

export class TransactionRepository extends DefaultCrudRepository<Transaction, typeof Transaction.prototype.id> {
  constructor(@inject('datasources.PostgreSQL') dataSource: PostgreSqlDataSource) {
    super(Transaction, dataSource);
  }
}
