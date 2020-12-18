import { getDbConnectionOptions } from '@alice/push/connection';
import { createConnection } from 'typeorm';
import { INestApplication } from '@nestjs/common';
import { createApp } from '@alice/push/application';
import * as supertest from 'supertest';

let connectionCreated = false;

export async function setupApplication(): Promise<AppWithClient> {
  const app = await createApp({ port: 0 });

  if (!connectionCreated) {
    const prodConnectionOptions = getDbConnectionOptions();
    await createConnection({ type: 'sqljs', entities: prodConnectionOptions.entities, synchronize: true });
    connectionCreated = true;
  }

  const client = supertest(app.getHttpServer());

  return { app, client };
}

export interface AppWithClient {
  app: INestApplication;
  client: supertest.SuperTest<supertest.Test>;
}
