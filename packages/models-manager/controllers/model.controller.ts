import { repository } from '@loopback/repository';
import { param, put, requestBody, get, post, HttpErrors } from '@loopback/rest';
import { DeusExModelRepository } from 'models-manager/repositories/deus-ex-model.repository';
import { DeusExModel, DeusExProcessModelResponse } from '@sr2020/interface/models/deus-ex-model';
import { Empty } from '@sr2020/interface/models/empty.model';
import { ModelEngineService } from '@sr2020/interface/services';
import { inject } from '@loopback/core';
import { DeusExModelDbEntity } from 'models-manager/models/deus-ex-model-db-entity';
import { EventRequest } from '@sr2020/interface/models/alice-model-engine';

const MAX_RETRIES = 20;

export class ModelController {
  constructor(
    @repository(DeusExModelRepository)
    public modelRepository: DeusExModelRepository,
    @inject('services.ModelEngineService')
    protected modelEngineService: ModelEngineService,
  ) {}

  @put('/model', {
    responses: {
      '200': {
        description: 'Transaction PUT success',
      },
    },
  })
  async replaceById(@requestBody() deusExModel: DeusExModel): Promise<Empty> {
    const dbEntry = DeusExModelDbEntity.fromModel(deusExModel);
    try {
      await this.modelRepository.replaceById(dbEntry.id, dbEntry);
    } catch {
      await this.modelRepository.create(dbEntry);
    }
    return new Empty();
  }

  @get('/model/{id}', {
    responses: {
      '200': {
        description: 'Transaction GET success',
        content: { 'application/json': { schema: { 'x-ts-type': DeusExProcessModelResponse } } },
      },
    },
  })
  async get(@param.path.number('id') id: number): Promise<DeusExProcessModelResponse> {
    for (let i = 0; i < MAX_RETRIES; ++i) {
      const baseModel = await this.modelRepository.findById(id);
      const result = await this.modelEngineService.process({ baseModel: baseModel.getModel(), events: [], timestamp: Date.now() });
      const updated = await this.modelRepository.updateAll(DeusExModelDbEntity.fromModel(result.baseModel), {
        and: [{ id }, { timestamp: baseModel.timestamp }],
      });
      if (updated.count == 1) return result;
    }
    throw new HttpErrors.Conflict('Too many simultaneous model updates');
  }

  @get('/model/{id}/predict', {
    responses: {
      '200': {
        description: 'Transaction GET success',
        content: { 'application/json': { schema: { 'x-ts-type': DeusExProcessModelResponse } } },
      },
    },
  })
  async predict(@param.path.number('id') id: number, @param.query.number('t') timestamp: number): Promise<DeusExProcessModelResponse> {
    const baseModel = await this.modelRepository.findById(id);
    const result = await this.modelEngineService.process({ baseModel: baseModel.getModel(), events: [], timestamp });
    return result;
  }

  @post('/model/{id}', {
    responses: {
      '200': {
        description: 'Transaction GET success',
        content: { 'application/json': { schema: { 'x-ts-type': DeusExProcessModelResponse } } },
      },
    },
  })
  async postEvent(@param.path.number('id') id: number, @requestBody() event: EventRequest): Promise<DeusExProcessModelResponse> {
    for (let i = 0; i < MAX_RETRIES; ++i) {
      const baseModel = await this.modelRepository.findById(id);
      const timestamp = Date.now();
      const result = await this.modelEngineService.process({
        baseModel: baseModel.getModel(),
        events: [{ ...event, modelId: id.toString(), timestamp }],
        timestamp,
      });
      const updated = await this.modelRepository.updateAll(DeusExModelDbEntity.fromModel(result.baseModel), {
        and: [{ id }, { timestamp: baseModel.timestamp }],
      });
      if (updated.count == 1) return result;
    }
    throw new HttpErrors.Conflict('Too many simultaneous model updates');
  }
}
