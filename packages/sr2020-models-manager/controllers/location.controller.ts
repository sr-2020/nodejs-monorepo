import { del, get, param, post, put, requestBody } from '@loopback/rest';
import { Empty } from '@sr2020/interface/models/empty.model';
import { ModelEngineService } from '@sr2020/sr2020-common/services/model-engine.service';
import { PushService } from '@sr2020/interface/services/push.service';
import { inject } from '@loopback/core';
import { EventRequest } from '@sr2020/interface/models/alice-model-engine';
import { Location, LocationProcessResponse } from '@sr2020/sr2020-common/models/location.model';
import { EntityManager, Transaction, TransactionManager } from 'typeorm';
import { ModelAquirerService } from '@sr2020/alice-models-manager/services/model-aquirer.service';
import { PubSubService } from '@sr2020/alice-models-manager/services/pubsub.service';
import { TimeService } from '@sr2020/alice-models-manager/services/time.service';
import { AnyModelController } from '@sr2020/sr2020-models-manager/controllers/anymodel.controller';
import { EventDispatcherService } from '@sr2020/sr2020-models-manager/services/event-dispatcher.service';

export class LocationController extends AnyModelController<Location> {
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
    super(Location, modelEngineService, timeService, eventDispatcherService, modelAquirerService, pushService, pubSubService);
  }

  @put('/location/model', {
    responses: {
      '200': {
        description: 'Transaction PUT success',
      },
    },
  })
  async replaceById(@requestBody() model: Location): Promise<Empty> {
    return super.replaceById(model);
  }

  @del('/location/model/{id}', {
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

  @get('/location/model/{id}', {
    responses: {
      '200': {
        description: 'Transaction GET success',
        content: { 'application/json': { schema: { 'x-ts-type': LocationProcessResponse } } },
      },
    },
  })
  @Transaction()
  async get(@param.path.number('id') id: number, @TransactionManager() manager: EntityManager): Promise<LocationProcessResponse> {
    return super.get(id, manager);
  }

  @get('/location/model/{id}/predict', {
    responses: {
      '200': {
        description: 'Transaction GET success',
        content: { 'application/json': { schema: { 'x-ts-type': LocationProcessResponse } } },
      },
    },
  })
  async predict(@param.path.number('id') id: number, @param.query.number('t') timestamp: number): Promise<LocationProcessResponse> {
    return super.predict(id, timestamp);
  }

  @post('/location/model/{id}', {
    responses: {
      '200': {
        description: 'Transaction GET success',
        content: { 'application/json': { schema: { 'x-ts-type': LocationProcessResponse } } },
      },
    },
  })
  @Transaction()
  async postEvent(
    @param.path.number('id') id: number,
    @requestBody() event: EventRequest,
    @TransactionManager() manager: EntityManager,
  ): Promise<LocationProcessResponse> {
    return super.postEvent(id, event, manager);
  }

  @post('/location/broadcast', {
    responses: {
      '200': {
        description: 'Event successfully broadcasted',
        content: { 'application/json': { schema: { 'x-ts-type': Empty } } },
      },
    },
  })
  broadcast(@requestBody() event: EventRequest): Promise<Empty> {
    return this.broadcastEvent(event);
  }
}
