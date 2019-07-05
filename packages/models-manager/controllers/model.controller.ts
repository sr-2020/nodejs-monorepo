import { repository } from '@loopback/repository';
import { param, put, requestBody } from '@loopback/rest';
import { DeusExModelRepository } from 'models-manager/repositories/deus-ex-model.repository';
import { DeusExModel } from '@sr2020/interface/models/deus-ex-model';
import { Empty } from '@sr2020/interface/models/empty.model';

export class ModelController {
  constructor(
    @repository(DeusExModelRepository)
    public modelRepository: DeusExModelRepository,
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
}
