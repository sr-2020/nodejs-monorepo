import { Client } from '@loopback/testlab';
import { getApplication } from './testing/test-helper';

describe('HomePage', () => {
  let client: Client;

  beforeEach(async () => {
    client = (await getApplication()).client;
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
