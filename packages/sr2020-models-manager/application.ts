import { ApplicationConfig } from '@loopback/core';
import { RestExplorerBindings, RestExplorerComponent } from '@loopback/rest-explorer';
import { RepositoryMixin } from '@loopback/repository';
import { RestApplication, RestBindings } from '@loopback/rest';
import { ServiceMixin } from '@loopback/service-proxy';
import * as path from 'path';
import { CustomRejectProvider } from '@alice/alice-models-manager/services/reject.service';
import { CharacterController } from '@alice/sr2020-models-manager/controllers/character.controller';
import { LocationController } from '@alice/sr2020-models-manager/controllers/location.controller';
import { QrCodeController } from '@alice/sr2020-models-manager/controllers/qr-code.controller';
import { PingController } from '@alice/sr2020-models-manager/controllers/ping.controller';
import { TimeServiceProvider } from '@alice/alice-models-manager/services/time.service';
import { ModelAquirerServiceProvider } from '@alice/sr2020-models-manager/services/model-aquirer.service';
import { LoggerServiceProvider } from '@alice/alice-models-manager/services/logger.service';
import { EventDispatcherServiceProvider } from '@alice/sr2020-models-manager/services/event-dispatcher.service';
import { PushServiceProvider } from '@alice/alice-common/services/push.service';
import { PubSubServiceProvider } from '@alice/alice-models-manager/services/pubsub.service';
import { ModelEngineHttpApiDataSource } from '@alice/sr2020-common/datasources/model-engine-http-api.datasource';
import { PushHttpApiDataSource } from '@alice/alice-common/datasources/push-http-api.datasource';
import { Sr2020ModelEngineHttpServiceProvider, Sr2020ModelEngineServiceProvider } from '@alice/sr2020-common/services/model-engine.service';

export class ModelsManagerApplication extends ServiceMixin(RepositoryMixin(RestApplication)) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up default home page
    this.static('/', path.join(__dirname, 'assets'));

    // Customize @loopback/rest-explorer configuration here
    this.bind(RestExplorerBindings.CONFIG).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.bind(RestBindings.SequenceActions.REJECT).toProvider(CustomRejectProvider);

    this.bind('controllers.PingController').toClass(PingController);
    this.bind('controllers.CharacterController').toClass(CharacterController);
    this.bind('controllers.LocationController').toClass(LocationController);
    this.bind('controllers.QrCodeController').toClass(QrCodeController);

    this.bind('datasources.ModelEngineHttpApi').toClass(ModelEngineHttpApiDataSource);
    this.bind('datasources.PushHttpApi').toClass(PushHttpApiDataSource);

    this.bind('services.TimeService').toProvider(TimeServiceProvider);
    this.bind('services.ModelAquirerService').toProvider(ModelAquirerServiceProvider);
    this.bind('services.LoggerService').toProvider(LoggerServiceProvider);
    this.bind('services.EventDispatcherService').toProvider(EventDispatcherServiceProvider);
    this.bind('services.ModelEngineService').toProvider(Sr2020ModelEngineServiceProvider);
    this.bind('services.ModelEngineHttpService').toProvider(Sr2020ModelEngineHttpServiceProvider);
    this.bind('services.PushService').toProvider(PushServiceProvider);
    this.bind('services.PubSubService').toProvider(PubSubServiceProvider);
  }
}
