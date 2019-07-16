import { repository } from '@loopback/repository';
import { param, put, requestBody, get, post, HttpErrors } from '@loopback/rest';
import { Empty } from '@sr2020/interface/models/empty.model';
import { ModelEngineService } from '@sr2020/interface/services';
import { inject } from '@loopback/core';
import { EventRequest } from '@sr2020/interface/models/alice-model-engine';
import { Location, LocationProcessResponse } from '@sr2020/interface/models/location.model';
import { LocationRepository } from 'models-manager/repositories/location.repository';
import { LocationDbEntity } from 'models-manager/models/location-db-entity';

const MAX_RETRIES = 20;

export class LocationController {
  constructor(
    @repository(LocationRepository)
    public modelRepository: LocationRepository,
    @inject('services.ModelEngineService')
    protected modelEngineService: ModelEngineService,
  ) {}

  @put('/location/model', {
    responses: {
      '200': {
        description: 'Transaction PUT success',
      },
    },
  })
  async replaceById(@requestBody() model: Location): Promise<Empty> {
    const dbEntry = LocationDbEntity.fromModel(model);
    try {
      await this.modelRepository.replaceById(dbEntry.id, dbEntry);
    } catch {
      await this.modelRepository.create(dbEntry);
    }
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
  async get(@param.path.number('id') id: number): Promise<LocationProcessResponse> {
    for (let i = 0; i < MAX_RETRIES; ++i) {
      const baseModel = await this.modelRepository.findById(id);
      const result = await this.modelEngineService.processLocation({ baseModel: baseModel.getModel(), events: [], timestamp: Date.now() });
      const updated = await this.modelRepository.updateAll(LocationDbEntity.fromModel(result.baseModel), {
        and: [{ id }, { timestamp: baseModel.timestamp }],
      });
      if (updated.count == 1) return result;
    }
    throw new HttpErrors.Conflict('Too many simultaneous model updates');
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
    const baseModel = await this.modelRepository.findById(id);
    const result = await this.modelEngineService.processLocation({ baseModel: baseModel.getModel(), events: [], timestamp });
    return result;
  }

  @post('/location/model/{id}', {
    responses: {
      '200': {
        description: 'Transaction GET success',
        content: { 'application/json': { schema: { 'x-ts-type': LocationProcessResponse } } },
      },
    },
  })
  async postEvent(@param.path.number('id') id: number, @requestBody() event: EventRequest): Promise<LocationProcessResponse> {
    for (let i = 0; i < MAX_RETRIES; ++i) {
      const baseModel = await this.modelRepository.findById(id);
      const timestamp = Date.now();
      const result = await this.modelEngineService.processLocation({
        baseModel: baseModel.getModel(),
        events: [{ ...event, modelId: id.toString(), timestamp }],
        timestamp,
      });
      const updated = await this.modelRepository.updateAll(LocationDbEntity.fromModel(result.baseModel), {
        and: [{ id }, { timestamp: baseModel.timestamp }],
      });
      if (updated.count == 1) return result;
    }
    throw new HttpErrors.Conflict('Too many simultaneous model updates');
  }
}
