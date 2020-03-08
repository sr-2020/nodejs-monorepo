import { inject } from '@loopback/core';
import { get, param, post, put, requestBody, del } from '@loopback/rest';
import { EventRequest } from '@sr2020/interface/models/alice-model-engine';
import { Empty } from '@sr2020/interface/models/empty.model';
import { Sr2020Character, Sr2020CharacterProcessResponse } from '@sr2020/interface/models/sr2020-character.model';
import { ModelEngineService, PushService } from '@sr2020/interface/services';
import { EntityManager, Transaction, TransactionManager } from 'typeorm';
import { PubSubService } from '../services/pubsub.service';
import { EventDispatcherService } from '../services/event-dispatcher.service';
import { ModelAquirerService } from '../services/model-aquirer.service';
import { TimeService } from '../services/time.service';
import { AnyModelController } from './anymodel.controller';

export class CharacterController extends AnyModelController<Sr2020Character> {
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
    @inject('services.PubSubService')
    protected pubSubService: PubSubService,
  ) {
    super(Sr2020Character, modelEngineService, timeService, eventDispatcherService, modelAquirerService, pushService, pubSubService);
  }

  @put('/character/model', {
    responses: {
      '200': {
        description: 'Transaction PUT success',
      },
    },
  })
  async replaceById(@requestBody() model: Sr2020Character): Promise<Empty> {
    return super.replaceById(model);
  }

  @put('/character/default/{id}', {
    summary: 'Inits character default character model',
    description: 'Creates and saves default character model. Some field can be randomly populated, other will have default "empty" state.',
    responses: {
      content: {
        'application/json': { schema: { 'x-ts-type': Sr2020Character } },
      },
    },
  })
  async setDefault(@param.path.number('id') id: number, @requestBody() req: Empty): Promise<Empty> {
    const model = await this.modelEngineService.defaultCharacter(req);
    model.modelId = id.toString();
    return super.replaceById(model);
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
    return super.delete(id, manager);
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
    return super.get(id, manager);
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
    return super.predict(id, timestamp);
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
    return super.postEvent(id, event, manager);
  }
}
