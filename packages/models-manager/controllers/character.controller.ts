import { param, put, requestBody, get, post, HttpErrors } from '@loopback/rest';
import { Empty } from '@sr2020/interface/models/empty.model';
import { ModelEngineService } from '@sr2020/interface/services';
import { inject } from '@loopback/core';
import { EventRequest } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020Character, Sr2020CharacterProcessResponse } from '@sr2020/interface/models/sr2020-character.model';
import { CharacterDbEntity, fromModel } from 'models-manager/models/character-db-entity';
import { getRepository, TransactionManager, EntityManager, Transaction } from 'typeorm';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';

export class CharacterController {
  constructor(
    @inject('services.ModelEngineService')
    protected modelEngineService: ModelEngineService,
  ) {}

  @put('/character/model', {
    responses: {
      '200': {
        description: 'Transaction PUT success',
      },
    },
  })
  async replaceById(@requestBody() model: Sr2020Character): Promise<Empty> {
    await getRepository(CharacterDbEntity).save([fromModel(model)]);
    return new Empty();
  }

  @get('/character/model/{id}', {
    responses: {
      '200': {
        description: 'Transaction GET success',
        content: { 'application/json': { schema: { 'x-ts-type': Sr2020CharacterProcessResponse } } },
      },
    },
  })
  @Transaction()
  async get(@param.path.number('id') id: number, @TransactionManager() manager: EntityManager): Promise<Sr2020CharacterProcessResponse> {
    const baseModel = await this.getAndLockModel(manager, id);
    const timestamp = Date.now();
    const result = await this.modelEngineService.processCharacter({
      baseModel: baseModel!!.getModel(),
      events: [],
      timestamp,
    });
    await manager.getRepository(CharacterDbEntity).save(fromModel(result.baseModel));
    return result;
  }

  @get('/character/model/{id}/predict', {
    responses: {
      '200': {
        description: 'Transaction GET success',
        content: { 'application/json': { schema: { 'x-ts-type': Sr2020CharacterProcessResponse } } },
      },
    },
  })
  async predict(@param.path.number('id') id: number, @param.query.number('t') timestamp: number): Promise<Sr2020CharacterProcessResponse> {
    try {
      const baseModel = await getRepository(CharacterDbEntity).findOneOrFail(id);
      const result = await this.modelEngineService.processCharacter({ baseModel: baseModel!!.getModel(), events: [], timestamp });
      return result;
    } catch (e) {
      if (e instanceof EntityNotFoundError) throw new HttpErrors.NotFound(`Character model with id = ${id} not found`);
      throw e;
    }
  }

  @post('/character/model/{id}', {
    responses: {
      '200': {
        description: 'Transaction GET success',
        content: { 'application/json': { schema: { 'x-ts-type': Sr2020CharacterProcessResponse } } },
      },
    },
  })
  @Transaction()
  async postEvent(
    @param.path.number('id') id: number,
    @requestBody() event: EventRequest,
    @TransactionManager() manager: EntityManager,
  ): Promise<Sr2020CharacterProcessResponse> {
    const baseModel = await this.getAndLockModel(manager, id);
    const timestamp = Date.now();
    const result = await this.modelEngineService.processCharacter({
      baseModel: baseModel!!.getModel(),
      events: [{ ...event, modelId: id.toString(), timestamp }],
      timestamp,
    });
    await manager.getRepository(CharacterDbEntity).save(fromModel(result.baseModel));
    return result;
  }

  private async getAndLockModel(manager: EntityManager, id: number): Promise<CharacterDbEntity> {
    const maybeModel = await manager
      .getRepository(CharacterDbEntity)
      .createQueryBuilder()
      .select()
      .setLock('pessimistic_write')
      .where('id = :id', { id })
      .getOne();

    if (maybeModel == undefined) {
      throw new HttpErrors.NotFound(`Character model with id = ${id} not found`);
    }
    return maybeModel;
  }
}
