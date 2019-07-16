import { getService } from '@loopback/service-proxy';
import { inject, Provider } from '@loopback/core';
import { DeusExProcessModelRequest, DeusExProcessModelResponse } from '../models/deus-ex-model';
import { DeusModelEngineHttpApiDataSource } from '../datasources/deus-model-engine-http-api.datasource';

export interface DeusModelEngineService {
  process(req: DeusExProcessModelRequest): DeusExProcessModelResponse;
}

export class DeusModelEngineServiceProvider implements Provider<DeusModelEngineService> {
  constructor(
    @inject('datasources.DeusModelEngineHttpApi')
    protected dataSource: DeusModelEngineHttpApiDataSource = new DeusModelEngineHttpApiDataSource(),
  ) {}

  value(): Promise<DeusModelEngineService> {
    return getService(this.dataSource);
  }
}
