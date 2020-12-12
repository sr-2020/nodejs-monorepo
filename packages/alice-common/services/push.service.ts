import { getService } from '@loopback/service-proxy';
import { inject, Provider } from '@loopback/core';
import { PushHttpApiDataSource } from '../datasources/push-http-api.datasource';
import { PushNotification } from '../models/push-notification.model';
import { PushResult } from '../models/push-result.model';

export interface PushService {
  send(recipient: number, notification: PushNotification): Promise<PushResult>;
}

export class PushServiceProvider implements Provider<PushService> {
  constructor(
    // PushHttpApi must match the name property in the datasource json file
    @inject('datasources.PushHttpApi')
    protected dataSource: PushHttpApiDataSource = new PushHttpApiDataSource(),
  ) {}

  value(): Promise<PushService> {
    return getService(this.dataSource);
  }
}
