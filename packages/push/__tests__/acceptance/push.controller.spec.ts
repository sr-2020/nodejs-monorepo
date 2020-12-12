import { Client } from '@loopback/testlab';
import { PushApplication } from '../../application';
import { setupApplication } from './test-helper';
import { Connection, createConnection, getRepository, Repository } from 'typeorm';
import { FirebaseToken } from '@alice/alice-common/models/firebase-token.model';
import { getDbConnectionOptions } from '@alice/push/connection';

describe('TokenController', () => {
  let app: PushApplication;
  let client: Client;
  let connection: Connection;
  let repo: Repository<FirebaseToken>;

  beforeAll(async () => {
    const prodConnectionOptions = getDbConnectionOptions();
    connection = await createConnection({ type: 'sqljs', entities: prodConnectionOptions.entities, synchronize: true });
  });

  beforeEach(async () => {
    ({ app, client } = await setupApplication());

    repo = connection.getRepository(FirebaseToken);
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
