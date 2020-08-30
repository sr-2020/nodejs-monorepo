import { Client, expect } from '@loopback/testlab';
import { ModelsManagerApplication } from '../application';
import { setupApplication } from '../test-helper';

describe('PingController', function () {
  // For some reason this test is quite slow to start
  // eslint-disable-next-line no-invalid-this
  this.timeout(25000);

  let app: ModelsManagerApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({ app, client } = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  it('invokes GET /ping', async () => {
    const res = await client.get('/ping?msg=world').expect(200);
    expect(res.body).to.containEql({ greeting: 'Hello from LoopBack' });
  });
});
