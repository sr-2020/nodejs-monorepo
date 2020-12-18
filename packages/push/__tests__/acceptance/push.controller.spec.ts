import * as supertest from 'supertest';
import { setupApplication } from './test-helper';
import { getRepository, Repository } from 'typeorm';
import { FirebaseToken } from '@alice/alice-common/models/firebase-token.model';
import { INestApplication } from '@nestjs/common';

describe('TokenController', () => {
  let app: INestApplication;
  let client: supertest.SuperTest<supertest.Test>;
  let repo: Repository<FirebaseToken>;

  beforeEach(async () => {
    ({ app, client } = await setupApplication());
    repo = getRepository(FirebaseToken);
  });

  afterEach(async () => {
    await app.close();
    await repo.clear();
  });

  it('Save token for new ID', async () => {
    await client
      .put('/save_token')
      .send({
        id: 13,
        token: 'foo',
      })
      .expect(200);

    const allEntries = await getRepository(FirebaseToken).find({});
    expect(allEntries.length).toEqual(1);
    expect(allEntries[0]).toEqual({
      id: 13,
      token: 'foo',
    });
  });

  it('Save token for existing ID', async () => {
    await repo.save({ id: 10, token: 'foo' });

    await client
      .put('/save_token')
      .send({
        id: 10,
        token: 'bar',
      })
      .expect(200);

    const allEntries = await repo.find();
    expect(allEntries.length).toEqual(1);
    expect(allEntries[0]).toEqual({
      id: 10,
      token: 'bar',
    });
  });
});
