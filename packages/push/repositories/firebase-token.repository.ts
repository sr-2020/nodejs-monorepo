import { DefaultCrudRepository } from '@loopback/repository';
import { FirebaseToken, FirebaseTokenRelations } from '@alice/alice-common/models/firebase-token.model';
import { PostgreSqlDataSource } from '../datasources/postgre-sql.datasource';
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
