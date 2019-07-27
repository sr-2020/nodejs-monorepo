import { param, put, requestBody, get, post, HttpErrors, del } from '@loopback/rest';
import { Empty } from '@sr2020/interface/models/empty.model';
import { ModelEngineService } from '@sr2020/interface/services';
import { inject } from '@loopback/core';
import { EventRequest } from '@sr2020/interface/models/alice-model-engine';
import { getRepository, TransactionManager, EntityManager, Transaction } from 'typeorm';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { getAndLockModel } from '../utils/db-utils';
import { TimeService } from '../services/time.service';
import { EventDispatcherService } from '../services/event-dispatcher.service';
import { ModelAquirerService } from '../services/model-aquirer.service';
import { QrCode, QrCodeProcessResponse } from '@sr2020/interface/models/qr-code.model';

export class QrCodeController {
  constructor(
    @inject('services.ModelEngineService')
    protected modelEngineService: ModelEngineService,
    @inject('services.TimeService')
    protected timeService: TimeService,
    @inject('services.EventDispatcherService')
    protected eventDispatcherService: EventDispatcherService,
    @inject('services.ModelAquirerService')
    protected modelAquirerService: ModelAquirerService,
  ) {}

  @put('/qr/model', {
    responses: {
      '200': {
        description: 'Transaction PUT success',
      },
    },
  })
  async replaceById(@requestBody() model: QrCode): Promise<Empty> {
    await getRepository(QrCode).save([model]);
    return new Empty();
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
    await manager.getRepository(QrCode).delete(id);
    return new Empty();
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
    const baseModel = await getAndLockModel(QrCode, manager, id);
    const timestamp = this.timeService.timestamp();
    const result = await this.modelEngineService.processQr({
      baseModel,
      events: [],
      timestamp,
      aquiredObjects: {},
    });
    await manager.getRepository(QrCode).save(result.baseModel);
    return result;
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
    try {
      const baseModel = await getRepository(QrCode).findOneOrFail(id);
      const result = await this.modelEngineService.processQr({
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
    const aquired = await this.modelAquirerService.aquireModels(manager, event, this.timeService.timestamp());
    const result = await this.eventDispatcherService.dispatchEvent(
      QrCode,
      manager,
      { ...event, modelId: id.toString(), timestamp: aquired.maximalTimestamp },
      aquired,
    );
    await this.eventDispatcherService.dispatchEventsRecursively(manager, result.outboundEvents, aquired);
    result.outboundEvents = [];
    return result;
  }
}
