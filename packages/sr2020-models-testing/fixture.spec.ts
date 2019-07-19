import { Client } from '@loopback/testlab';
import { ModelsManagerApplication } from '@sr2020/models-manager/application';
import { setupApplication } from './fixture';
import { getConnection } from 'typeorm';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { getDefaultCharacter } from '@sr2020/sr2020-models/testing/test-helper';

describe('Fixture', function() {
  // tslint:disable-next-line: no-invalid-this
  this.timeout(15000);

  let app: ModelsManagerApplication;
  let client: Client;

  beforeEach('setupApplication', async () => {
    ({ app, client } = await setupApplication());
  });

  afterEach(async () => {
    await app.stop();
    await getConnection().close();
  });

  it('Ping', async () => {
    await client.get('/ping').expect(200);
  });

  it('Put character', async () => {
    const m: Sr2020Character = {
      modelId: '1',
      spellsCasted: 0,
      ...getDefaultCharacter(),
    };
    await client
      .put('/character/model')
      .send(m)
      .expect(200);
  });

  // TODO(aeremin): add more tests demonstrating fixture interaction
});
