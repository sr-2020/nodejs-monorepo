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
import { PushServiceImpl } from '@alice/alice-common/services/push.service';
import { PubSubServiceProvider } from '@alice/alice-models-manager/services/pubsub.service';
import { Sr2020ModelEngineHttpServiceRemote, Sr2020ModelEngineService } from '@alice/sr2020-common/services/model-engine.service';
import { HttpService } from '@nestjs/common';

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

    this.bind('services.TimeService').toProvider(TimeServiceProvider);
    this.bind('services.ModelAquirerService').toProvider(ModelAquirerServiceProvider);
    this.bind('services.LoggerService').toProvider(LoggerServiceProvider);
    this.bind('services.EventDispatcherService').toProvider(EventDispatcherServiceProvider);

    const httpService = new HttpService();
    const modelEngineHttpService = new Sr2020ModelEngineHttpServiceRemote(httpService);
    this.bind('services.ModelEngineService').to(new Sr2020ModelEngineService(modelEngineHttpService));
    this.bind('services.ModelEngineHttpService').to(modelEngineHttpService);
    this.bind('services.PushService').to(new PushServiceImpl(httpService));
    this.bind('services.PubSubService').toProvider(PubSubServiceProvider);
  }
}
