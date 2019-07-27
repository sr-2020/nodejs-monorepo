import { inject } from '@loopback/core';
import { get, HttpErrors, param, post, put, requestBody, del } from '@loopback/rest';
import { EventRequest } from '@sr2020/interface/models/alice-model-engine';
import { Empty } from '@sr2020/interface/models/empty.model';
import { Sr2020Character, Sr2020CharacterProcessResponse } from '@sr2020/interface/models/sr2020-character.model';
import { ModelEngineService, PushService } from '@sr2020/interface/services';
import { EntityManager, getRepository, Transaction, TransactionManager } from 'typeorm';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { EventDispatcherService } from '../services/event-dispatcher.service';
import { ModelAquirerService } from '../services/model-aquirer.service';
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
    @inject('services.ModelAquirerService')
    protected modelAquirerService: ModelAquirerService,
    @inject('services.PushService')
    protected pushService: PushService,
  ) {}

  @put('/character/model', {
    responses: {
      '200': {
        description: 'Transaction PUT success',
      },
    },
  })
  async replaceById(@requestBody() model: Sr2020Character): Promise<Empty> {
    await getRepository(Sr2020Character).save([model]);
    return new Empty();
  }

  @del('/character/model/{id}', {
    responses: {
      '200': {
        description: 'Transaction DELETE success',
        content: { 'application/json': { schema: { 'x-ts-type': Empty } } },
      },
    },
  })
  @Transaction()
  async delete(@param.path.number('id') id: number, @TransactionManager() manager: EntityManager): Promise<Empty> {
    await manager.getRepository(Sr2020Character).delete(id);
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
    const baseModel = await getAndLockModel(Sr2020Character, manager, id);
    const timestamp = this.timeService.timestamp();
    const result = await this.modelEngineService.processCharacter({
      baseModel,
      events: [],
      timestamp,
      aquiredObjects: {},
    });
    await manager.getRepository(Sr2020Character).save(result.baseModel);
    await this._sendNotifications(result);
    result.notifications = [];
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
      const baseModel = await getRepository(Sr2020Character).findOneOrFail(id);
      const result = await this.modelEngineService.processCharacter({
        baseModel,
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
    const aquired = await this.modelAquirerService.aquireModels(manager, event, this.timeService.timestamp());
    const result = await this.eventDispatcherService.dispatchCharacterEvent(
      manager,
      { ...event, modelId: id.toString(), timestamp: aquired.maximalTimestamp },
      aquired,
    );
    await this.eventDispatcherService.dispatchEventsRecursively(manager, result.outboundEvents, aquired);
    result.outboundEvents = [];
    await this._sendNotifications(result);
    result.notifications = [];
    return result;
  }

  private async _sendNotifications(resp: Sr2020CharacterProcessResponse) {
    await Promise.all(resp.notifications.map((notification) => this.pushService.send(Number(resp.baseModel.modelId), notification)));
  }
}
