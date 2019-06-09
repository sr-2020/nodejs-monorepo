import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './my-sql.datasource.json';

export class MySqlDataSource extends juggler.DataSource {
  static dataSourceName = 'MySQL';

  constructor(
    @inject('datasources.config.MySQL', {optional: true})
    dsConfig: object = config,
  ) {
    const fullConfig = {
      ...dsConfig,
      host: process.env.MYSQL_HOST || 'localhost',
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE || 'billing',
    };
    super(fullConfig);
  }
}
