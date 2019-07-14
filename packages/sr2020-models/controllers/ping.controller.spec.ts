import { Client, expect } from '@loopback/testlab';
import { SR2020ModelsApplication } from '../application';
import { getApplication } from '../testing/test-helper';

describe('PingController', () => {
  let app: SR2020ModelsApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({ app, client } = await getApplication());
  });

  it('invokes GET /ping', async () => {
    const res = await client.get('/ping?msg=world').expect(200);
    expect(res.body).to.containEql({ greeting: 'Hello from LoopBack' });
  });
});
