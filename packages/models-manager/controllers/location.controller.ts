import { param, put, requestBody, get, post, HttpErrors, del } from '@loopback/rest';
import { Empty } from '@sr2020/interface/models/empty.model';
import { ModelEngineService } from '@sr2020/interface/services';
import { inject } from '@loopback/core';
import { EventRequest } from '@sr2020/interface/models/alice-model-engine';
import { Location, LocationProcessResponse } from '@sr2020/interface/models/location.model';
import { getRepository, TransactionManager, EntityManager, Transaction } from 'typeorm';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { getAndLockModel } from '../utils/db-utils';
import { TimeService } from '../services/time.service';
import { EventDispatcherService } from '../services/event-dispatcher.service';
import { ModelAquirerService } from '../services/model-aquirer.service';

export class LocationController {
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

  @put('/location/model', {
    responses: {
      '200': {
        description: 'Transaction PUT success',
      },
    },
  })
  async replaceById(@requestBody() model: Location): Promise<Empty> {
    await getRepository(Location).save([model]);
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
    await manager.getRepository(Location).delete(id);
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
    const baseModel = await getAndLockModel(Location, manager, id);
    const timestamp = this.timeService.timestamp();
    const result = await this.modelEngineService.processLocation({
      baseModel,
      events: [],
      timestamp,
      aquiredObjects: {},
    });
    await manager.getRepository(Location).save(result.baseModel);
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
      const baseModel = await getRepository(Location).findOneOrFail(id);
      const result = await this.modelEngineService.processLocation({
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
    const aquired = await this.modelAquirerService.aquireModels(manager, event, this.timeService.timestamp());
    const result = await this.eventDispatcherService.dispatchEvent(
      Location,
      manager,
      { ...event, modelId: id.toString(), timestamp: aquired.maximalTimestamp },
      aquired,
    );
    await this.eventDispatcherService.dispatchEventsRecursively(manager, result.outboundEvents, aquired);
    result.outboundEvents = [];
    return result;
  }
}
