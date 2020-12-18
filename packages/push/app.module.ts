import { HttpModule, Module } from '@nestjs/common';
import { PingController } from '@alice/alice-common/controllers/ping.controller';
import { PushController } from '@alice/push/controllers/push.controller';
import { FirebaseMessagingServiceImpl } from '@alice/push/services/firebase-messaging.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    HttpModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'assets'),
      renderPath: '/',
    }),
  ],
  controllers: [PingController, PushController],
  providers: [{ provide: 'FirebaseMessagingService', useClass: FirebaseMessagingServiceImpl }],
})
export class AppModule {}
