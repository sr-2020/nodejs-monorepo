import { Client } from '@loopback/testlab';
import { getApplication } from '../testing/test-helper';

describe('PingController', () => {
  let client: Client;

  beforeEach(async () => {
    client = (await getApplication()).client;
  });

  it('invokes GET /ping', async () => {
    const res = await client.get('/ping?msg=world').expect(200);
    expect(res.body).toMatchObject({ greeting: 'Hello from LoopBack' });
  });
});
