import { Client } from '@loopback/testlab';
import { setupApplication } from './test-helper';
import { INestApplication } from '@nestjs/common';

describe('HomePage', () => {
  let app: INestApplication;
  let client: Client;

  beforeEach(async () => {
    ({ app, client } = await setupApplication());
  });

  afterEach(async () => {
    await app.close();
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
      .expect(/<title>Swagger UI/);
  });
});
