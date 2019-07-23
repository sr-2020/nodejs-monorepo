import { getService } from '@loopback/service-proxy';
import { inject, Provider } from '@loopback/core';
import { ModelEngineHttpApiDataSource } from '../datasources/model-engine-http-api.datasource';
import { ModelProcessRequest, ModelProcessResponse } from '../models/process-requests-respose';
import { Sr2020Character } from '../models/sr2020-character.model';
import { Location } from '../models/location.model';

export interface ModelEngineService {
  processCharacter(req: ModelProcessRequest<Sr2020Character>): Promise<ModelProcessResponse<Sr2020Character>>;
  processLocation(req: ModelProcessRequest<Location>): Promise<ModelProcessResponse<Location>>;
}

export class ModelEngineServiceProvider implements Provider<ModelEngineService> {
  constructor(
    @inject('datasources.ModelEngineHttpApi')
    protected dataSource: ModelEngineHttpApiDataSource = new ModelEngineHttpApiDataSource(),
  ) {}

  value(): Promise<ModelEngineService> {
    return getService(this.dataSource);
  }
}
