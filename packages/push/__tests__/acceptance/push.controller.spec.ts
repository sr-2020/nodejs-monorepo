import { Client } from '@loopback/testlab';
import { PushApplication } from '../../application';
import { setupApplication } from './test-helper';
import { getRepository, Repository } from 'typeorm';
import { FirebaseToken } from '@alice/alice-common/models/firebase-token.model';

describe('TokenController', () => {
  let app: PushApplication;
  let client: Client;
  let repo: Repository<FirebaseToken>;

  beforeEach(async () => {
    ({ app, client } = await setupApplication());
    repo = getRepository(FirebaseToken);
  });

  afterEach(async () => {
    await app.stop();
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
