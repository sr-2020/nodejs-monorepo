import { getService } from '@loopback/service-proxy';
import { inject, Provider } from '@loopback/core';
import { Sr2020CharacterProcessRequest, Sr2020CharacterProcessResponse } from '../models/sr2020-character.model';
import { LocationProcessRequest, LocationProcessResponse } from '../models/location.model';
import { ModelEngineHttpApiDataSource } from '../datasources/model-engine-http-api.datasource';

export interface ModelEngineService {
  processCharacter(req: Sr2020CharacterProcessRequest): Promise<Sr2020CharacterProcessResponse>;
  processLocation(req: LocationProcessRequest): Promise<LocationProcessResponse>;
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
