import { DefaultCrudRepository } from '@loopback/repository';
import { FirebaseToken, FirebaseTokenRelations } from '@sr2020/interface/models';
import { PostgreSqlDataSource } from '../datasources';
import { inject } from '@loopback/core';

export class FirebaseTokenRepository extends DefaultCrudRepository<
  FirebaseToken,
  typeof FirebaseToken.prototype.id,
  FirebaseTokenRelations
> {
  constructor(@inject('datasources.PostgreSQL') dataSource: PostgreSqlDataSource) {
    super(FirebaseToken, dataSource);
  }
}
