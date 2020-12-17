import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@alice/push/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export interface AppConfig {
  port: number;
}

export async function createApp(config: AppConfig): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('');

  const options = new DocumentBuilder()
    .setTitle('Push service')
    .setDescription('Service responsible for sending push notification to players.')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('explorer', app, document);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors();

  await app.listen(config.port);
  return app;
}
