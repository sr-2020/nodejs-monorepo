import { Client } from '@loopback/testlab';
import { ModelsManagerApplication } from '@sr2020/models-manager/application';
import { setupApplication } from './fixture';

describe('Fixture', () => {
  let app: ModelsManagerApplication;
  let client: Client;

  beforeEach('setupApplication', async () => {
    ({ app, client } = await setupApplication());
  });

  afterEach(async () => {
    await app.stop();
  });

  it('Returns 200 on success', async () => {
    await client.get('/ping').expect(200);
  });

  // TODO(aeremin): add more tests demonstrating fixture interaction
});
