import { inject } from '@loopback/core';
import { juggler } from '@loopback/repository';
import * as config from './postgre-sql.datasource.json';

export class PostgreSqlDataSource extends juggler.DataSource {
  static dataSourceName = 'PostgreSQL';

  constructor(
    @inject('datasources.config.PostgreSQL', { optional: true })
    dsConfig = config,
  ) {
    dsConfig.host = process.env.POSTGRESQL_HOST!!;
    dsConfig.user = process.env.POSTGRESQL_USER || dsConfig.user;
    dsConfig.password = process.env.POSTGRESQL_PASSWORD!!;
    super(dsConfig);
  }
}
