import { SR2020ModelsApplication } from '../application';
import { createRestAppClient, givenHttpServerConfig, Client } from '@loopback/testlab';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { Location } from '@sr2020/interface/models/location.model';

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

export function getDefaultCharacter(): Sr2020Character {
  return {
    spellsCasted: 0,

    modelId: '0',
    timestamp: 0,
    conditions: [],
    modifiers: [],
    timers: {},
  };
}

export function getDefaultLocation(): Location {
  return {
    manaDensity: 0,

    modelId: '0',
    timestamp: 0,
    conditions: [],
    modifiers: [],
    timers: {},
  };
}
