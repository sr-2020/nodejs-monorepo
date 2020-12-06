import { PushApplication } from '../../application';
import { createRestAppClient, givenHttpServerConfig, Client } from '@loopback/testlab';
import { juggler } from '@loopback/repository';

export async function setupApplication(): Promise<AppWithClient> {
  const restConfig = givenHttpServerConfig({
    // Customize the server configuration here.
    // Empty values (undefined, '') will be ignored by the helper.
    //
    // host: process.env.HOST,
    // port: +process.env.PORT,
  });

  const app = new PushApplication({
    rest: restConfig,
  });

  await app.boot();

  const sqlite = new juggler.DataSource({
    connector: 'sqlite3',
    file: ':memory:',
  });
  await sqlite.execute(`
    CREATE TABLE firebase_tokens (
      id int(11) NOT NULL,
      token varchar(200) DEFAULT NULL,
      PRIMARY KEY ('id')
    );
  `);
  app.bind('datasources.PostgreSQL').to(sqlite);

  await app.start();

  const client = createRestAppClient(app);

  return { app, client };
}

export interface AppWithClient {
  app: PushApplication;
  client: Client;
}
