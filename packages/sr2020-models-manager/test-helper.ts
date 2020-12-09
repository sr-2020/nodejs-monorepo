import { ModelsManagerApplication } from './application';
import { Client, createRestAppClient, givenHttpServerConfig } from '@loopback/testlab';

export async function setupApplication(): Promise<AppWithClient> {
  const restConfig = givenHttpServerConfig({});

  const app = new ModelsManagerApplication({
    rest: restConfig,
  });

  await app.start();

  const client = createRestAppClient(app);

  return { app, client };
}

export interface AppWithClient {
  app: ModelsManagerApplication;
  client: Client;
}
