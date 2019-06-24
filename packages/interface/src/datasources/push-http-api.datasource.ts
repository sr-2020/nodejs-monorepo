import { inject } from '@loopback/core';
import { juggler } from '@loopback/repository';
import * as config from './push-http-api.datasource.json';

export class PushHttpApiDataSource extends juggler.DataSource {
  static dataSourceName = 'PushHttpApi';

  constructor(
    @inject('datasources.config.PushHttpApi', { optional: true })
    dsConfig = config,
  ) {
    super(dsConfig);
  }
}
