import { Client, expect } from '@loopback/testlab';
import { ModelsManagerApplication } from '../application';
import { setupApplication } from '../test-helper';

describe('PingController', function () {
  let app: ModelsManagerApplication;
  let client: Client;

  beforeEach(async () => {
    ({ app, client } = await setupApplication());
  });

  afterEach(async () => {
    await app.stop();
  });

  it('invokes GET /ping', async () => {
    const res = await client.get('/ping?msg=world').expect(200);
    expect(res.body).to.containEql({ greeting: 'Hello from LoopBack' });
  });
});
