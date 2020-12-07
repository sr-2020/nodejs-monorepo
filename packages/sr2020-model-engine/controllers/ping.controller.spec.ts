import { Client, expect } from '@loopback/testlab';
import { getApplication } from '../testing/test-helper';

describe('PingController', () => {
  let client: Client;

  beforeEach(async () => {
    client = (await getApplication()).client;
  });

  it('invokes GET /ping', async () => {
    const res = await client.get('/ping?msg=world').expect(200);
    expect(res.body).to.containEql({ greeting: 'Hello from LoopBack' });
  });
});
