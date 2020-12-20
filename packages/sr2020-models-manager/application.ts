import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Sr2020ModelsManagerModule } from '@alice/sr2020-models-manager/sr2020-models-manager.module';
import { GlobalExceptionsFilter } from '@alice/alice-models-manager/utils/exceptions-filter';

export interface AppConfig {
  port: number;
}

export async function createApp(config: AppConfig): Promise<INestApplication> {
  const app = await NestFactory.create(Sr2020ModelsManagerModule);
  app.setGlobalPrefix('');

  const options = new DocumentBuilder()
    .setTitle('Models manager service')
    .setDescription('Service responsible for persisting models and sending them to clients.')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('explorer', app, document);

  app.useGlobalPipes(new ValidationPipe());
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new GlobalExceptionsFilter(httpAdapter, app.get('LoggerService')));
  app.enableCors();

  await app.listen(config.port);
  return app;
}
