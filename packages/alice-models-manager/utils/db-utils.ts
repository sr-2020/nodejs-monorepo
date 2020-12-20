import { EntityManager } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

export async function getAndLockModel<TModelEntity>(
  tmodel: new () => TModelEntity,
  manager: EntityManager,
  id: number,
): Promise<TModelEntity> {
  const queryBuilder = manager.getRepository(tmodel).createQueryBuilder().select().where('"modelId" = :id', { id });

  // Hack to support unit-testing as sqljs doesn't support pessimistic_write.
  if (manager.connection.options.type != 'sqljs') {
    queryBuilder.setLock('pessimistic_write');
  }

  const maybeModel = await queryBuilder.getOne();
  if (maybeModel == undefined) {
    throw new NotFoundException(`${tmodel.name} model with id = ${id} not found`);
  }
  return maybeModel;
}
