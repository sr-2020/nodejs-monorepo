import { DefaultCrudRepository } from '@loopback/repository';
import { MySqlDataSource } from '../datasources';
import { inject } from '@loopback/core';
import { LocationDbEntity } from '../models/location-db-entity';

export class LocationRepository extends DefaultCrudRepository<LocationDbEntity, typeof LocationDbEntity.prototype.id> {
  constructor(@inject('datasources.MySQL') dataSource: MySqlDataSource) {
    super(LocationDbEntity, dataSource);
  }
}
