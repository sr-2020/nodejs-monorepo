import { ModelsManagerApplication } from './application';
import { ApplicationConfig } from '@loopback/core';
import * as dotenv from 'dotenv';
import { createConnection } from 'typeorm';
import { CharacterDbEntity } from './models/character-db-entity';

export async function main(options: ApplicationConfig = {}) {
  dotenv.config({ path: '../../.env' });

  const app = new ModelsManagerApplication(options);

  await createConnection({
    type: 'mysql',
    database: 'model',
    host: process.env.MYSQL_HOST!!,
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD!!,
    entities: [CharacterDbEntity],
  });

  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  return app;
}

const config = {
  rest: {
    port: +(process.env.PORT || 3000),
    host: process.env.HOST,
    openApiSpec: {
      // useful when used with OASGraph to locate your application
      setServersFromRequest: true,
    },
  },
};
main(config).catch((err) => {
  console.error('Cannot start the application.', err);
  process.exit(1);
});
