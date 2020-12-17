import { Client, givenHttpServerConfig } from '@loopback/testlab';
import { getDbConnectionOptions } from '@alice/push/connection';
import { createConnection } from 'typeorm';
import { INestApplication } from '@nestjs/common';
import { createApp } from '@alice/push/application';
import * as request from 'supertest';

let connectionCreated = false;

export async function setupApplication(): Promise<AppWithClient> {
  const restConfig = givenHttpServerConfig({});

  const app = await createApp({ port: restConfig.port });

  if (!connectionCreated) {
    const prodConnectionOptions = getDbConnectionOptions();
    await createConnection({ type: 'sqljs', entities: prodConnectionOptions.entities, synchronize: true });
    connectionCreated = true;
  }

  const client = request(app.getHttpServer());

  return { app, client };
}

export interface AppWithClient {
  app: INestApplication;
  client: Client;
}
