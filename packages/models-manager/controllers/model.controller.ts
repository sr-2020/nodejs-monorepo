import { repository } from '@loopback/repository';
import { param, put, requestBody, get } from '@loopback/rest';
import { DeusExModelRepository } from 'models-manager/repositories/deus-ex-model.repository';
import { DeusExModel, DeusExProcessModelResponse } from '@sr2020/interface/models/deus-ex-model';
import { Empty } from '@sr2020/interface/models/empty.model';
import { ModelEngineService } from '@sr2020/interface/services';
import { inject } from '@loopback/core';

export class ModelController {
  constructor(
    @repository(DeusExModelRepository)
    public modelRepository: DeusExModelRepository,
    @inject('services.ModelEngineService')
    protected modelEngineService: ModelEngineService,
  ) {}

  @put('/model/{id}', {
    responses: {
      '200': {
        description: 'Transaction PUT success',
      },
    },
  })
  async replaceById(@param.path.number('id') id: number, @requestBody() deusExModel: DeusExModel): Promise<Empty> {
    // TODO: Validate that id == model.id
    const dbEntry = { id, model: JSON.stringify(deusExModel) };
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
    const result = await this.modelEngineService.send({ baseModel: JSON.parse(baseModel.model), events: [], timestamp: Date.now() });
    this.modelRepository.replaceById(id, { id, model: JSON.stringify(result.baseModel) });
    return result;
  }
}
