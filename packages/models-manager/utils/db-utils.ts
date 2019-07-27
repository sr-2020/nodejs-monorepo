import { EntityManager, ValueTransformer, Column } from 'typeorm';
import { HttpErrors } from '@loopback/rest';

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

class JsonToTextTransformer implements ValueTransformer {
  to = (v: any) => JSON.stringify(v);
  from = (v: any) => JSON.parse(v);
}

export function JsonColumn(): Function {
  if (process.env.NODE_ENV == 'test') {
    return Column({ type: 'text', transformer: new JsonToTextTransformer() });
  } else {
    return Column({ type: 'json' });
  }
}
