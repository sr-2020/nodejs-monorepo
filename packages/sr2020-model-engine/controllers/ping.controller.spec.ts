import { getApplication } from '../testing/test-helper';
import * as supertest from 'supertest';

describe('PingController', () => {
  let client: supertest.SuperTest<supertest.Test>;

  beforeEach(async () => {
    client = (await getApplication()).client;
  });

  it('invokes GET /ping', async () => {
    const res = await client.get('/ping?msg=world').expect(200);
    expect(res.body).toMatchObject({ greeting: 'Hello from LoopBack' });
  });
});
