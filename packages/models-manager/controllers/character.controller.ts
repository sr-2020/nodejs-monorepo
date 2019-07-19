import { param, put, requestBody, get, post, HttpErrors } from '@loopback/rest';
import { Empty } from '@sr2020/interface/models/empty.model';
import { ModelEngineService } from '@sr2020/interface/services';
import { inject } from '@loopback/core';
import { EventRequest } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020Character, Sr2020CharacterProcessResponse } from '@sr2020/interface/models/sr2020-character.model';
import { CharacterDbEntity, fromModel as fromCharacterModel } from 'models-manager/models/character-db-entity';
import { LocationDbEntity, fromModel as fromLocationModel } from 'models-manager/models/location-db-entity';
import { getRepository, TransactionManager, EntityManager, Transaction } from 'typeorm';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { getAndLockModel } from '../utils/db-utils';
import { TimeService } from '../services/time.service';
import { LocationProcessResponse } from '@sr2020/interface/models/location.model';

export class CharacterController {
  constructor(
    @inject('services.ModelEngineService')
    protected modelEngineService: ModelEngineService,
    @inject('services.TimeService')
    protected timeService: TimeService,
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
    const result = await this.dispatchCharacterEvent(manager, id, event);
    let events = result.outboundEvents;
    result.outboundEvents = [];
    while (events.length) {
      const promises = events.map((outboundEvent) => {
        if (outboundEvent.modelType == 'Sr2020Character') {
          return this.dispatchCharacterEvent(manager, Number(outboundEvent.modelId), outboundEvent);
        }
        if (outboundEvent.modelType == 'Location') {
          return this.dispatchLocationEvent(manager, Number(outboundEvent.modelId), outboundEvent);
        }

        throw new Error('Unexpected modelType');
      });
      const outboundEventResults = await Promise.all<Sr2020CharacterProcessResponse | LocationProcessResponse>(promises);
      events = [];
      for (const r of outboundEventResults) {
        events.unshift(...r.outboundEvents);
      }
    }
    return result;
  }

  private async dispatchCharacterEvent(manager: EntityManager, modelId: number, event: EventRequest) {
    const baseModel = await getAndLockModel(CharacterDbEntity, manager, modelId);
    const timestamp = this.timeService.timestamp();
    const result = await this.modelEngineService.processCharacter({
      baseModel: baseModel!!.getModel(),
      events: [{ ...event, modelId: modelId.toString(), timestamp }],
      timestamp,
    });
    await manager.getRepository(CharacterDbEntity).save(fromCharacterModel(result.baseModel));
    return result;
  }

  private async dispatchLocationEvent(manager: EntityManager, modelId: number, event: EventRequest) {
    const baseModel = await getAndLockModel(LocationDbEntity, manager, modelId);
    const timestamp = this.timeService.timestamp();
    const result = await this.modelEngineService.processLocation({
      baseModel: baseModel!!.getModel(),
      events: [{ ...event, modelId: modelId.toString(), timestamp }],
      timestamp,
    });
    await manager.getRepository(LocationDbEntity).save(fromLocationModel(result.baseModel));
    return result;
  }
}
