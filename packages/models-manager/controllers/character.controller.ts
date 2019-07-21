import { inject } from '@loopback/core';
import { get, HttpErrors, param, post, put, requestBody } from '@loopback/rest';
import { EventRequest } from '@sr2020/interface/models/alice-model-engine';
import { Empty } from '@sr2020/interface/models/empty.model';
import { Sr2020Character, Sr2020CharacterProcessResponse } from '@sr2020/interface/models/sr2020-character.model';
import { ModelEngineService } from '@sr2020/interface/services';
import { CharacterDbEntity, fromModel as fromCharacterModel } from 'models-manager/models/character-db-entity';
import { EntityManager, getRepository, Transaction, TransactionManager } from 'typeorm';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';

import { EventDispatcherService } from '../services/event-dispatcher.service';
import { TimeService } from '../services/time.service';
import { getAndLockModel } from '../utils/db-utils';

export class CharacterController {
  constructor(
    @inject('services.ModelEngineService')
    protected modelEngineService: ModelEngineService,
    @inject('services.TimeService')
    protected timeService: TimeService,
    @inject('services.EventDispatcherService')
    protected eventDispatcherService: EventDispatcherService,
  ) {}

  @put('/character/model', {
    responses: {
      '200': {
        description: 'Transaction PUT success',
      },
    },
  })
  async replaceById(@requestBody() model: Sr2020Character): Promise<Empty> {
    await getRepository(CharacterDbEntity).save([fromCharacterModel(model)]);
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
    const baseModel = await getAndLockModel(CharacterDbEntity, manager, id);
    const timestamp = this.timeService.timestamp();
    const result = await this.modelEngineService.processCharacter({
      baseModel: baseModel!!.getModel(),
      events: [],
      timestamp,
      aquiredObjects: {},
    });
    await manager.getRepository(CharacterDbEntity).save(fromCharacterModel(result.baseModel));
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
      const result = await this.modelEngineService.processCharacter({
        baseModel: baseModel!!.getModel(),
        events: [],
        timestamp,
        aquiredObjects: {},
      });
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
    const result = await this.eventDispatcherService.dispatchCharacterEvent(manager, id, event);
    await this.eventDispatcherService.dispatchEventsRecursively(manager, result.outboundEvents);
    result.outboundEvents = [];
    return result;
  }
}
