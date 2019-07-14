import { Client } from '@loopback/testlab';
import { SR2020ModelsApplication } from './application';
import { getApplication } from './testing/test-helper';

describe('HomePage', () => {
  let app: SR2020ModelsApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({ app, client } = await getApplication());
  });

  it('exposes a default home page', async () => {
    await client
      .get('/')
      .expect(200)
      .expect('Content-Type', /text\/html/);
  });

  it('exposes self-hosted explorer', async () => {
    await client
      .get('/explorer/')
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect(/<title>LoopBack API Explorer/);
  });
});
