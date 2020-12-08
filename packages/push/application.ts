import { ApplicationConfig } from '@loopback/core';
import { RestExplorerBindings, RestExplorerComponent } from '@loopback/rest-explorer';
import { RepositoryMixin } from '@loopback/repository';
import { RestApplication } from '@loopback/rest';
import { ServiceMixin } from '@loopback/service-proxy';
import * as path from 'path';
import { PingController } from '@alice/push/controllers/ping.controller';
import { PushController } from '@alice/push/controllers/push.controller';
import { FirebaseMessagingServiceProvider } from '@alice/push/services/firebase-messaging.service';
import { FirebaseTokenRepository } from '@alice/push/repositories/firebase-token.repository';
import { PostgreSqlDataSource } from '@alice/push/datasources/postgre-sql.datasource';
import { FirebaseHttpApiDataSource } from '@alice/push/datasources/firebase-http-api.datasource';

export class PushApplication extends ServiceMixin(RepositoryMixin(RestApplication)) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up default home page
    this.static('/', path.join(__dirname, 'assets'));

    // Customize @loopback/rest-explorer configuration here
    this.bind(RestExplorerBindings.CONFIG).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.bind('controllers.PingController').toClass(PingController);
    this.bind('controllers.PushController').toClass(PushController);
    this.bind('services.FirebaseMessagingService').toProvider(FirebaseMessagingServiceProvider);
    this.bind('repositories.FirebaseTokenRepository').toClass(FirebaseTokenRepository);
    this.bind('datasources.PostgreSQL').toClass(PostgreSqlDataSource);
    this.bind('datasources.FirebaseHttpApi').toClass(FirebaseHttpApiDataSource);
  }
}
