import { inject } from '@loopback/core';
import { juggler } from '@loopback/repository';
import * as config from './model-engine-http-api.datasource.json';

export class ModelEngineHttpApiDataSource extends juggler.DataSource {
  static dataSourceName = 'ModelEngineHttpApi';

  constructor(
    @inject('datasources.config.ModelEngineHttpApi', { optional: true })
    dsConfig = config,
  ) {
    super(dsConfig);
  }
}
