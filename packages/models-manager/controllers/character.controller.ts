import { repository } from '@loopback/repository';
import { param, put, requestBody, get, post, HttpErrors } from '@loopback/rest';
import { Empty } from '@sr2020/interface/models/empty.model';
import { ModelEngineService } from '@sr2020/interface/services';
import { inject } from '@loopback/core';
import { EventRequest } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020Character, Sr2020CharacterProcessResponse } from '@sr2020/interface/models/sr2020-character.model';
import { CharacterRepository } from 'models-manager/repositories/character.repository';
import { CharacterDbEntity } from 'models-manager/models/character-db-entity';

const MAX_RETRIES = 20;

export class CharacterController {
  constructor(
    @repository(CharacterRepository)
    public modelRepository: CharacterRepository,
    @inject('services.ModelEngineService')
    protected modelEngineService: ModelEngineService,
  ) {}

  @put('/character/model', {
    responses: {
      '200': {
        description: 'Transaction PUT success',
      },
    },
  })
  async replaceById(@requestBody() model: Sr2020Character): Promise<Empty> {
    const dbEntry = CharacterDbEntity.fromModel(model);
    try {
      await this.modelRepository.replaceById(dbEntry.id, dbEntry);
    } catch {
      await this.modelRepository.create(dbEntry);
    }
    return new Empty();
  }

  @get('/character/model/{id}', {
    responses: {
      '200': {
        description: 'Transaction GET success',
        content: { 'application/json': { schema: { 'x-ts-type': Sr2020CharacterProcessResponse } } },
      },
    },
  })
  async get(@param.path.number('id') id: number): Promise<Sr2020CharacterProcessResponse> {
    for (let i = 0; i < MAX_RETRIES; ++i) {
      const baseModel = await this.modelRepository.findById(id);
      const result = await this.modelEngineService.processCharacter({ baseModel: baseModel.getModel(), events: [], timestamp: Date.now() });
      const updated = await this.modelRepository.updateAll(CharacterDbEntity.fromModel(result.baseModel), {
        and: [{ id }, { timestamp: baseModel.timestamp }],
      });
      if (updated.count == 1) return result;
    }
    throw new HttpErrors.Conflict('Too many simultaneous model updates');
  }

  @get('/character/model/{id}/predict', {
    responses: {
      '200': {
        description: 'Transaction GET success',
        content: { 'application/json': { schema: { 'x-ts-type': Sr2020CharacterProcessResponse } } },
      },
    },
  })
  async predict(@param.path.number('id') id: number, @param.query.number('t') timestamp: number): Promise<Sr2020CharacterProcessResponse> {
    const baseModel = await this.modelRepository.findById(id);
    const result = await this.modelEngineService.processCharacter({ baseModel: baseModel.getModel(), events: [], timestamp });
    return result;
  }

  @post('/character/model/{id}', {
    responses: {
      '200': {
        description: 'Transaction GET success',
        content: { 'application/json': { schema: { 'x-ts-type': Sr2020CharacterProcessResponse } } },
      },
    },
  })
  async postEvent(@param.path.number('id') id: number, @requestBody() event: EventRequest): Promise<Sr2020CharacterProcessResponse> {
    for (let i = 0; i < MAX_RETRIES; ++i) {
      const baseModel = await this.modelRepository.findById(id);
      const timestamp = Date.now();
      const result = await this.modelEngineService.processCharacter({
        baseModel: baseModel.getModel(),
        events: [{ ...event, modelId: id.toString(), timestamp }],
        timestamp,
      });
      const updated = await this.modelRepository.updateAll(CharacterDbEntity.fromModel(result.baseModel), {
        and: [{ id }, { timestamp: baseModel.timestamp }],
      });
      if (updated.count == 1) return result;
    }
    throw new HttpErrors.Conflict('Too many simultaneous model updates');
  }
}
