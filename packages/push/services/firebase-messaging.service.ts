import { getService } from '@loopback/service-proxy';
import { inject, Provider } from '@loopback/core';
import { FirebaseHttpApiDataSource } from '../datasources/firebase-http-api.datasource';
import { PushResult } from '@alice/interface/models/push-result.model';

export interface FirebaseMessagingService {
  send(recipient: string, title: string, body: string): Promise<PushResult>;
}

export class FirebaseMessagingServiceProvider implements Provider<FirebaseMessagingService> {
  constructor(
    // FirebaseHttpApi must match the name property in the datasource json file
    @inject('datasources.FirebaseHttpApi')
    protected dataSource: FirebaseHttpApiDataSource = new FirebaseHttpApiDataSource(),
  ) {}

  value(): Promise<FirebaseMessagingService> {
    return getService(this.dataSource);
  }
}
