import { inject } from '@loopback/core';
import { juggler } from '@loopback/repository';

const config = {
  name: 'PostgreSQL',
  connector: 'postgresql',
  url: '',
  host: '???',
  port: 5432,
  user: 'root',
  password: '???',
  database: 'push',
};

export class PostgreSqlDataSource extends juggler.DataSource {
  static dataSourceName = 'PostgreSQL';

  constructor(
    @inject('datasources.config.PostgreSql', { optional: true })
    dsConfig = config,
  ) {
    dsConfig.host = process.env.POSTGRESQL_HOST!;
    dsConfig.user = process.env.POSTGRESQL_USER ?? dsConfig.user;
    dsConfig.password = process.env.POSTGRESQL_PASSWORD!;
    super(dsConfig);
  }
}
