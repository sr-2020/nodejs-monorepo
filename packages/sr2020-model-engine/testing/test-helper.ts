import { createApp } from '@alice/sr2020-model-engine/application';
import * as supertest from 'supertest';
import { INestApplication } from '@nestjs/common';

let gAppWithClient: AppWithClient | null = null;

// model-engine-based apps are slow to startup as they load and preprocess bunch of model scripts.
// So intead of re-creating the app for each test, we use one global instance.
// For the same reason, we need '--exit' in packages.json when running mocha (to stop this global instance).
export async function getApplication(): Promise<AppWithClient> {
  if (!gAppWithClient) {
    gAppWithClient = await setupApplication();
  }
  return gAppWithClient;
}

export async function setupApplication(): Promise<AppWithClient> {
  const app = await createApp({ port: 0 });
  const client = supertest(app.getHttpServer());
  return { app, client };
}

export interface AppWithClient {
  app: INestApplication;
  client: supertest.SuperTest<supertest.Test>;
}
