import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './firebase-http-api.datasource.json';

export class FirebaseHttpApiDataSource extends juggler.DataSource {
  static dataSourceName = 'FirebaseHttpApi';

  constructor(
    @inject('datasources.config.FirebaseHttpApi', {optional: true})
    dsConfig = config,
  ) {
    dsConfig.options.headers.authorization =
      'key=' + process.env.FIREBASE_SERVER_TOKEN;
    super(dsConfig);
  }
}
