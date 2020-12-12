import { del, get, param, post, put, requestBody } from '@loopback/rest';
import { Empty } from '@alice/alice-common/models/empty.model';
import { PushService } from '@alice/alice-common/services/push.service';
import { inject } from '@loopback/core';
import { EventRequest } from '@alice/alice-common/models/alice-model-engine';
import { Location, LocationCreationRequest, LocationProcessResponse } from '@alice/sr2020-common/models/location.model';
import { EntityManager, getManager, Transaction, TransactionManager } from 'typeorm';
import { ModelAquirerService } from '@alice/alice-models-manager/services/model-aquirer.service';
import { PubSubService } from '@alice/alice-models-manager/services/pubsub.service';
import { TimeService } from '@alice/alice-models-manager/services/time.service';
import { AnyModelController } from '@alice/alice-models-manager/controllers/anymodel.controller';
import { LoggerService } from '@alice/alice-models-manager/services/logger.service';
import { Sr2020ModelEngineHttpService, Sr2020ModelEngineService } from '@alice/sr2020-common/services/model-engine.service';
import { EventDispatcherService } from '@alice/alice-models-manager/services/event-dispatcher.service';

export class LocationController extends AnyModelController<Location> {
  constructor(
    @inject('services.ModelEngineHttpService')
    protected sr2020ModelEngineService: Sr2020ModelEngineHttpService,
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
    @inject('services.LoggerService')
    protected logger: LoggerService,
  ) {
    super(
      Location,
      new Sr2020ModelEngineService(sr2020ModelEngineService),
      timeService,
      eventDispatcherService,
      modelAquirerService,
      pushService,
      pubSubService,
      logger,
    );
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

  @put('/location/default/{id}', {
    summary: 'Inits default location model',
    description: 'Creates and saves default location model. Some field can be randomly populated, other will have default "empty" state.',
    responses: {
      content: {
        'application/json': { schema: { 'x-ts-type': Empty } },
      },
    },
  })
  async setDefault(@param.path.number('id') id: number, @requestBody() req: LocationCreationRequest): Promise<Empty> {
    const model = await this.sr2020ModelEngineService.defaultLocation(new Empty());
    model.modelId = id.toString();

    await getManager().transaction(async (manager) => {
      await manager.getRepository(Location).save(model);
    });

    return new Empty();
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
