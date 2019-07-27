import { EntityManager, ConnectionOptions } from 'typeorm';
import { HttpErrors } from '@loopback/rest';
import { CharacterDbEntity } from '../models/character-db-entity';
import { LocationDbEntity } from '../models/location-db-entity';

export function getDbConnectionOptions(): ConnectionOptions {
  return {
    type: 'mysql',
    database: 'model',
    host: process.env.MYSQL_HOST!!,
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD!!,
    synchronize: true,
    entities: [CharacterDbEntity, LocationDbEntity],
  };
}

export async function getAndLockModel<TModelEntity>(
  tmodel: new () => TModelEntity,
  manager: EntityManager,
  id: number,
): Promise<TModelEntity> {
  const queryBuilder = manager
    .getRepository(tmodel)
    .createQueryBuilder()
    .select()
    .where('id = :id', { id });

  // Hack to support unit-testing as sqljs doesn't support pessimistic_write.
  if (manager.connection.options.type != 'sqljs') {
    queryBuilder.setLock('pessimistic_write');
  }

  const maybeModel = await queryBuilder.getOne();
  if (maybeModel == undefined) {
    throw new HttpErrors.NotFound(`${tmodel.name} model with id = ${id} not found`);
  }
  return maybeModel;
}
