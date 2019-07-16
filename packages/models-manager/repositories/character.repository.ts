import { DefaultCrudRepository } from '@loopback/repository';
import { MySqlDataSource } from '../datasources';
import { inject } from '@loopback/core';
import { CharacterDbEntity } from '../models/character-db-entity';

export class CharacterRepository extends DefaultCrudRepository<CharacterDbEntity, typeof CharacterDbEntity.prototype.id> {
  constructor(@inject('datasources.MySQL') dataSource: MySqlDataSource) {
    super(CharacterDbEntity, dataSource);
  }
}
