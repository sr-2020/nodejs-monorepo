import { ModelsManagerApplication } from './application';
import { createRestAppClient, givenHttpServerConfig, Client } from '@loopback/testlab';
import { juggler } from '@loopback/repository';
import { createConnection, Connection } from 'typeorm';
import { CharacterDbEntity } from './models/character-db-entity';
import { LocationDbEntity } from './models/location-db-entity';

export async function setupApplication(): Promise<AppWithClient> {
  const restConfig = givenHttpServerConfig({
    // Customize the server configuration here.
    // Empty values (undefined, '') will be ignored by the helper.
    //
    // host: process.env.HOST,
    // port: +process.env.PORT,
  });

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

  const connection = await createConnection({
    type: 'sqljs',
    entities: [CharacterDbEntity, LocationDbEntity],
  });

  await app.start();

  const client = createRestAppClient(app);

  return { app, connection, client };
}

export interface AppWithClient {
  app: ModelsManagerApplication;
  client: Client;
  connection: Connection;
}
