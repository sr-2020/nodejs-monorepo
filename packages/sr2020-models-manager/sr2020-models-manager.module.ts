import { HttpModule, Module } from '@nestjs/common';
import { PingController } from '@alice/alice-common/controllers/ping.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CharacterController } from '@alice/sr2020-models-manager/controllers/character.controller';
import { LocationController } from '@alice/sr2020-models-manager/controllers/location.controller';
import { QrCodeController } from '@alice/sr2020-models-manager/controllers/qr-code.controller';
import { TimeServiceImpl } from '@alice/alice-models-manager/services/time.service';
import { ModelAquirerServiceImpl } from '@alice/sr2020-models-manager/services/model-aquirer.service';
import { WinstonLogger } from '@alice/alice-models-manager/services/logger.service';
import { Sr2020EventDispatcherService } from '@alice/sr2020-models-manager/services/event-dispatcher.service';
import { Sr2020ModelEngineHttpServiceRemote, Sr2020ModelEngineService } from '@alice/sr2020-common/services/model-engine.service';
import { PushServiceImpl } from '@alice/alice-common/services/push.service';
import { getPubSubService } from '@alice/alice-models-manager/services/pubsub.service';

@Module({
  imports: [
    HttpModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'assets'),
      renderPath: '/',
    }),
  ],
  controllers: [PingController, CharacterController, LocationController, QrCodeController],
  providers: [
    { provide: 'TimeService', useClass: TimeServiceImpl },
    { provide: 'ModelAquirerService', useClass: ModelAquirerServiceImpl },
    { provide: 'LoggerService', useClass: WinstonLogger },
    { provide: 'EventDispatcherService', useClass: Sr2020EventDispatcherService },
    { provide: 'ModelEngineHttpService', useClass: Sr2020ModelEngineHttpServiceRemote },
    { provide: 'ModelEngineService', useClass: Sr2020ModelEngineService },
    { provide: 'PushService', useClass: PushServiceImpl },
    { provide: 'PubSubService', useFactory: getPubSubService },
  ],
})
export class Sr2020ModelsManagerModule {}
