import { ModelsManagerApplication } from './application';
import { createRestAppClient, givenHttpServerConfig, Client } from '@loopback/testlab';
import { juggler } from '@loopback/repository';

export async function setupApplication(): Promise<AppWithClient> {
  const restConfig = givenHttpServerConfig({});

  const app = new ModelsManagerApplication({
    rest: restConfig,
  });

  await app.boot();
  const sqlite = new juggler.DataSource({
    connector: 'sqlite3',
    file: ':memory:',
  });
  await sqlite.execute(`
    CREATE TABLE 'deus-character' (
      id int(11) NOT NULL,
      timestamp int(11) NOT NULL,
      model json NOT NULL,
      PRIMARY KEY ('id')
    );
  `);
  app.bind('datasources.MySQL').to(sqlite);

  await app.start();

  const client = createRestAppClient(app);

  return { app, client };
}

export interface AppWithClient {
  app: ModelsManagerApplication;
  client: Client;
}
