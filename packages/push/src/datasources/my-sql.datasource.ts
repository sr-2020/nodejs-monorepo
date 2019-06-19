import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './my-sql.datasource.json';

export class MySqlDataSource extends juggler.DataSource {
  static dataSourceName = 'MySQL';

  constructor(
    @inject('datasources.config.MySql', {optional: true})
    dsConfig = config,
  ) {
    dsConfig.host = process.env.MYSQL_HOST!!;
    dsConfig.user = process.env.MYSQL_USER || dsConfig.user;
    dsConfig.password = process.env.MYSQL_PASSWORD!!;
    super(dsConfig);
  }
}
