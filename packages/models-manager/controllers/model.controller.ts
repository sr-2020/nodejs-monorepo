import { repository } from '@loopback/repository';
import { param, put, requestBody, get } from '@loopback/rest';
import { DeusExModelRepository } from 'models-manager/repositories/deus-ex-model.repository';
import { DeusExModel, DeusExProcessModelResponse } from '@sr2020/interface/models/deus-ex-model';
import { Empty } from '@sr2020/interface/models/empty.model';
import { ModelEngineService } from '@sr2020/interface/services';
import { inject } from '@loopback/core';
import { DeusExModelDbEntity } from 'models-manager/models/deus-ex-model-db-entity';

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
    const baseModel = await this.modelRepository.findById(id);
    const result = await this.modelEngineService.send({ baseModel: baseModel.getModel(), events: [], timestamp: Date.now() });
    // TODO: Make sure that simultaneous request haven't overwritten it earlier
    this.modelRepository.replaceById(id, DeusExModelDbEntity.fromModel(result.baseModel));
    return result;
  }
}
