import { BillingApplication } from '../../application';
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

  const app = new BillingApplication({
    rest: restConfig,
  });

  await app.boot();
  const sqlite = new juggler.DataSource({
    connector: 'sqlite3',
    file: ':memory:',
  });
  // TODO(aeremin) Is there a way to generate it automatically based
  // on Transaction definition? It seems to happen automagically with
  // 'memory' connector (but we can't use it here as it doesn't support
  // native SQL commands).
  await sqlite.execute(`
    CREATE TABLE transactions (
      id int(11),
      created_at datetime NOT NULL,
      sin_from int(11) NOT NULL,
      sin_to int(11) NOT NULL,
      amount int(11) NOT NULL,
      comment text,
      recurrent_payment_id int(11) DEFAULT NULL
    )
  `);
  app.bind('datasources.PostgreSQL').to(sqlite);
  await app.start();

  const client = createRestAppClient(app);

  return { app, client };
}

export interface AppWithClient {
  app: BillingApplication;
  client: Client;
}
