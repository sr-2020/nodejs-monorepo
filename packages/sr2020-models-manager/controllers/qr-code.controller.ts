import { del, get, param, post, put, requestBody } from '@loopback/rest';
import { Empty } from '@alice/alice-common/models/empty.model';
import { PushService } from '@alice/alice-common/services/push.service';
import { ModelEngineService } from '@alice/sr2020-common/services/model-engine.service';
import { inject } from '@loopback/core';
import { EventRequest } from '@alice/alice-common/models/alice-model-engine';
import { EntityManager, Transaction, TransactionManager } from 'typeorm';
import { QrCode, QrCodeProcessResponse } from '@alice/sr2020-common/models/qr-code.model';
import { ModelAquirerService } from '@alice/alice-models-manager/services/model-aquirer.service';
import { PubSubService } from '@alice/alice-models-manager/services/pubsub.service';
import { TimeService } from '@alice/alice-models-manager/services/time.service';
import { AnyModelController } from '@alice/sr2020-models-manager/controllers/anymodel.controller';
import { EventDispatcherService } from '@alice/sr2020-models-manager/services/event-dispatcher.service';
import { LoggerService } from '@alice/alice-models-manager/services/logger.service';

export class QrCodeController extends AnyModelController<QrCode> {
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
    @inject('services.LoggerService')
    protected logger: LoggerService,
  ) {
    super(QrCode, modelEngineService, timeService, eventDispatcherService, modelAquirerService, pushService, pubSubService, logger);
  }

  @put('/qr/model', {
    responses: {
      '200': {
        description: 'Transaction PUT success',
      },
    },
  })
  async replaceById(@requestBody() model: QrCode): Promise<Empty> {
    return super.replaceById(model);
  }

  @del('/qr/model/{id}', {
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

  @get('/qr/model/{id}', {
    responses: {
      '200': {
        description: 'Transaction GET success',
        content: { 'application/json': { schema: { 'x-ts-type': QrCodeProcessResponse } } },
      },
    },
  })
  @Transaction()
  async get(@param.path.number('id') id: number, @TransactionManager() manager: EntityManager): Promise<QrCodeProcessResponse> {
    return super.get(id, manager);
  }

  @get('/qr/model/{id}/predict', {
    responses: {
      '200': {
        description: 'Transaction GET success',
        content: { 'application/json': { schema: { 'x-ts-type': QrCodeProcessResponse } } },
      },
    },
  })
  async predict(@param.path.number('id') id: number, @param.query.number('t') timestamp: number): Promise<QrCodeProcessResponse> {
    return super.predict(id, timestamp);
  }

  @post('/qr/model/{id}', {
    responses: {
      '200': {
        description: 'Transaction GET success',
        content: { 'application/json': { schema: { 'x-ts-type': QrCodeProcessResponse } } },
      },
    },
  })
  @Transaction()
  async postEvent(
    @param.path.number('id') id: number,
    @requestBody() event: EventRequest,
    @TransactionManager() manager: EntityManager,
  ): Promise<QrCodeProcessResponse> {
    return super.postEvent(id, event, manager);
  }

  @post('/qr/broadcast', {
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
