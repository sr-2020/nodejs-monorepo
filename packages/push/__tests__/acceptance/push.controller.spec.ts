import { Client, expect } from '@loopback/testlab';
import { PushApplication } from '../../application';
import { setupApplication } from './test-helper';
import { FirebaseTokenRepository } from '../../repositories/firebase-token.repository';

describe('TokenController', () => {
  let app: PushApplication;
  let client: Client;
  let repo: FirebaseTokenRepository;

  beforeEach(async () => {
    ({ app, client } = await setupApplication());
    repo = await app.getRepository(FirebaseTokenRepository);
  });

  afterEach(async () => {
    await app.stop();
  });

  it('Save token for new ID', async () => {
    await client
      .put('/save_token')
      .send({
        id: 13,
        token: 'foo',
      })
      .expect(200);

    const allEntries = await repo.find();
    expect(allEntries.length).to.equal(1);
    expect(allEntries[0]).to.containEql({
      id: 13,
      token: 'foo',
    });
  });

  it('Save token for existing ID', async () => {
    await repo.create({ id: 10, token: 'foo' });

    await client
      .put('/save_token')
      .send({
        id: 10,
        token: 'bar',
      })
      .expect(200);

    const allEntries = await repo.find();
    expect(allEntries.length).to.equal(1);
    expect(allEntries[0]).to.containEql({
      id: 10,
      token: 'bar',
    });
  });
});
