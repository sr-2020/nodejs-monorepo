import { param, put, requestBody, get, post, HttpErrors } from '@loopback/rest';
import { Empty } from '@sr2020/interface/models/empty.model';
import { ModelEngineService } from '@sr2020/interface/services';
import { inject } from '@loopback/core';
import { EventRequest } from '@sr2020/interface/models/alice-model-engine';
import { Location, LocationProcessResponse } from '@sr2020/interface/models/location.model';
import { LocationDbEntity, fromModel } from 'models-manager/models/location-db-entity';
import { getRepository, TransactionManager, EntityManager, Transaction } from 'typeorm';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { getAndLockModel } from '../utils/db-utils';
import { TimeService } from '../services/time.service';
import { EventDispatcherService } from '../services/event-dispatcher.service';

export class LocationController {
  constructor(
    @inject('services.ModelEngineService')
    protected modelEngineService: ModelEngineService,
    @inject('services.TimeService')
    protected timeService: TimeService,
    @inject('services.EventDispatcherService')
    protected eventDispatcherService: EventDispatcherService,
  ) {}

  @put('/location/model', {
    responses: {
      '200': {
        description: 'Transaction PUT success',
      },
    },
  })
  async replaceById(@requestBody() model: Location): Promise<Empty> {
    await getRepository(LocationDbEntity).save([fromModel(model)]);
    return new Empty();
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
    const baseModel = await getAndLockModel(LocationDbEntity, manager, id);
    const timestamp = this.timeService.timestamp();
    const result = await this.modelEngineService.processLocation({
      baseModel: baseModel!!.getModel(),
      events: [],
      timestamp,
      aquiredObjects: {},
    });
    await manager.getRepository(LocationDbEntity).save(fromModel(result.baseModel));
    return result;
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
    try {
      const baseModel = await getRepository(LocationDbEntity).findOneOrFail(id);
      const result = await this.modelEngineService.processLocation({
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
    const timestamp = this.timeService.timestamp();
    const result = await this.eventDispatcherService.dispatchLocationEvent(manager, { ...event, modelId: id.toString(), timestamp });
    await this.eventDispatcherService.dispatchEventsRecursively(manager, result.outboundEvents);
    result.outboundEvents = [];
    return result;
  }
}
