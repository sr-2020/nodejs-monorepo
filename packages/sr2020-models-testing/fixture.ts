import { ModelsManagerApplication } from '@sr2020/models-manager/application';
import { createRestAppClient, givenHttpServerConfig, Client } from '@loopback/testlab';
import { createConnection } from 'typeorm';
import { CharacterDbEntity } from 'models-manager/models/character-db-entity';
import { LocationDbEntity } from 'models-manager/models/location-db-entity';

export async function setupApplication(): Promise<AppWithClient> {
  const restConfig = givenHttpServerConfig({});

  const app = new ModelsManagerApplication({
    rest: restConfig,
  });

  await app.boot();
  // TODO(aeremin): bind model engine service
  await createConnection({
    type: 'sqljs',
    synchronize: true,
    entities: [CharacterDbEntity, LocationDbEntity],
  });
  await app.start();

  const client = createRestAppClient(app);

  // TODO(aeremin): return some helper which will allow to save/read models
  return { app, client };
}

export interface AppWithClient {
  app: ModelsManagerApplication;
  client: Client;
}
