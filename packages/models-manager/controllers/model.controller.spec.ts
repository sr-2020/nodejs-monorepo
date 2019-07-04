import { Client, expect } from '@loopback/testlab';
import { ModelsManagerApplication } from '../application';
import { setupApplication } from '../test-helper';
import { DeusExModelRepository } from '../repositories/deus-ex-model.repository';
import * as model from '@sr2020/interface/models/deus-ex-model-example.json';

describe('TransactionController', () => {
  let app: ModelsManagerApplication;
  let client: Client;
  let repo: DeusExModelRepository;

  beforeEach('setupApplication', async () => {
    ({ app, client } = await setupApplication());
    repo = await app.getRepository(DeusExModelRepository);
  });

  afterEach(async () => {
    await app.stop();
  });

  it('invokes PUT /model', async () => {
    await client
      .put('/model/5')
      .send(model)
      .expect(200);

    const allEntries = await repo.find();
    expect(allEntries.length).to.equal(1);
    expect(JSON.parse(allEntries[0].model)).to.containEql(model);
  });
});
