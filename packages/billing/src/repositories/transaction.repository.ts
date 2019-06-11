import {DefaultCrudRepository} from '@loopback/repository';
import {Transaction} from '../../../interface/src/models';
import {MySqlDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class TransactionRepository extends DefaultCrudRepository<
  Transaction,
  typeof Transaction.prototype.id
> {
  constructor(@inject('datasources.MySQL') dataSource: MySqlDataSource) {
    super(Transaction, dataSource);
  }
}
