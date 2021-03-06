import * as supertest from 'supertest';
import { setupApplication } from './test-helper';
import { INestApplication } from '@nestjs/common';

describe('PingController', () => {
  let app: INestApplication;
  let client: supertest.SuperTest<supertest.Test>;

  beforeEach(async () => {
    ({ app, client } = await setupApplication());
  });

  afterEach(async () => {
    await app.close();
  });

  it('invokes GET /ping', async () => {
    const res = await client.get('/ping?msg=world').expect(200);
    expect(res.body).toMatchObject({ greeting: 'Hello from LoopBack' });
  });
});
