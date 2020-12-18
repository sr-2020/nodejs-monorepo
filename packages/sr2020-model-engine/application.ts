import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Sr2020ModelEngineModule } from '@alice/sr2020-model-engine/sr2020-model-engine.module';

export interface AppConfig {
  port: number;
}

export async function createApp(config: AppConfig): Promise<INestApplication> {
  const app = await NestFactory.create(Sr2020ModelEngineModule);
  app.setGlobalPrefix('');

  const options = new DocumentBuilder()
    .setTitle('Model Engine service')
    .setDescription('Service responsible for calculating update model state.')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('explorer', app, document);

  app.useGlobalPipes(new ValidationPipe({ whitelist: false }));
  app.enableCors();

  await app.listen(config.port);
  return app;
}
