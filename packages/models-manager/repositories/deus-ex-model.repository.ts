import { DefaultCrudRepository } from '@loopback/repository';
import { MySqlDataSource } from '../datasources';
import { inject } from '@loopback/core';
import { DeusExModelDbEntity } from '../models/deus-ex-model-db-entity';

export class DeusExModelRepository extends DefaultCrudRepository<DeusExModelDbEntity, typeof DeusExModelDbEntity.prototype.id> {
  constructor(@inject('datasources.MySQL') dataSource: MySqlDataSource) {
    super(DeusExModelDbEntity, dataSource);
  }
}
