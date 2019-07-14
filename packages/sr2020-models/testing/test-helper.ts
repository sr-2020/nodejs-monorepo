import { SR2020ModelsApplication } from '../application';
import { createRestAppClient, givenHttpServerConfig, Client } from '@loopback/testlab';

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

async function setupApplication(): Promise<AppWithClient> {
  const restConfig = givenHttpServerConfig({});

  const app = new SR2020ModelsApplication({
    rest: restConfig,
  });

  await app.boot();
  await app.start();

  const client = createRestAppClient(app);

  return { app, client };
}

export interface AppWithClient {
  app: SR2020ModelsApplication;
  client: Client;
}
