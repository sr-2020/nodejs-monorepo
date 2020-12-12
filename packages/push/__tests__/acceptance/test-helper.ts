import { PushApplication } from '../../application';
import { Client, createRestAppClient, givenHttpServerConfig } from '@loopback/testlab';
import { getDbConnectionOptions } from '@alice/push/connection';
import { createConnection } from 'typeorm';

let connectionCreated = false;

export async function setupApplication(): Promise<AppWithClient> {
  const restConfig = givenHttpServerConfig({});

  const app = new PushApplication({
    rest: restConfig,
  });

  if (!connectionCreated) {
    const prodConnectionOptions = getDbConnectionOptions();
    await createConnection({ type: 'sqljs', entities: prodConnectionOptions.entities, synchronize: true });
    connectionCreated = true;
  }

  await app.start();

  const client = createRestAppClient(app);

  return { app, client };
}

export interface AppWithClient {
  app: PushApplication;
  client: Client;
}
