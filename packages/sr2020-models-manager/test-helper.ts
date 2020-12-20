import { createApp } from '@alice/sr2020-models-manager/application';
import * as supertest from 'supertest';
import { INestApplication } from '@nestjs/common';

export async function setupApplication(): Promise<AppWithClient> {
  const app = await createApp({ port: 0 });
  const client = supertest(app.getHttpServer());
  return { app, client };
}

export interface AppWithClient {
  app: INestApplication;
  client: supertest.SuperTest<supertest.Test>;
}
