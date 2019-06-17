import {DefaultCrudRepository} from '@loopback/repository';
import {
  FirebaseToken,
  FirebaseTokenRelations,
} from '../../../interface/src/models';
import {MySqlDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class FirebaseTokenRepository extends DefaultCrudRepository<
  FirebaseToken,
  typeof FirebaseToken.prototype.id,
  FirebaseTokenRelations
> {
  constructor(@inject('datasources.MySQL') dataSource: MySqlDataSource) {
    super(FirebaseToken, dataSource);
  }
}
