import { inject } from '@loopback/core';
import { juggler } from '@loopback/repository';
import * as config from './deus-model-engine-http-api.datasource.json';

export class DeusModelEngineHttpApiDataSource extends juggler.DataSource {
  static dataSourceName = 'DeusModelEngineHttpApi';

  constructor(
    @inject('datasources.config.DeusModelEngineHttpApi', { optional: true })
    dsConfig = config,
  ) {
    super(dsConfig);
  }
}
