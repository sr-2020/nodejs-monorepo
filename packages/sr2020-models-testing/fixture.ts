import { ModelsManagerApplication } from "@sr2020/models-manager/application";
import {
  createRestAppClient,
  givenHttpServerConfig,
  Client
} from "@loopback/testlab";

export async function setupApplication(): Promise<AppWithClient> {
  const restConfig = givenHttpServerConfig({});

  const app = new ModelsManagerApplication({
    rest: restConfig
  });

  await app.boot();
  // TODO(aeremin): bind model engine service
  // TODO(aeremin): create TypeORM connection to SQLite
  await app.start();

  const client = createRestAppClient(app);

  // TODO(aeremin): return some helper which will allow to save/read models
  return { app, client };
}

export interface AppWithClient {
  app: ModelsManagerApplication;
  client: Client;
}
