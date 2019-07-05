import { getService } from '@loopback/service-proxy';
import { inject, Provider } from '@loopback/core';
import { DeusExProcessModelRequest, DeusExProcessModelResponse } from '../models/deus-ex-model';
import { ModelEngineHttpApiDataSource } from '../datasources/model-engine-http-api.datasource';

export interface ModelEngineService {
  send(req: DeusExProcessModelRequest): DeusExProcessModelResponse;
}

export class ModelEngineServiceProvider implements Provider<ModelEngineService> {
  constructor(
    // ModelEngineHttpApi must match the name property in the datasource json file
    @inject('datasources.ModelEngineHttpApi')
    protected dataSource: ModelEngineHttpApiDataSource = new ModelEngineHttpApiDataSource(),
  ) {}

  value(): Promise<ModelEngineService> {
    return getService(this.dataSource);
  }
}
