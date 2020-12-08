import { Client } from '@loopback/testlab';
import { PushApplication } from '../../application';
import { setupApplication } from './test-helper';

describe('PingController', () => {
  let app: PushApplication;
  let client: Client;

  beforeEach(async () => {
    ({ app, client } = await setupApplication());
  });

  afterEach(async () => {
    await app.stop();
  });

  it('invokes GET /ping', async () => {
    const res = await client.get('/ping?msg=world').expect(200);
    expect(res.body).toMatchObject({ greeting: 'Hello from LoopBack' });
  });
});
