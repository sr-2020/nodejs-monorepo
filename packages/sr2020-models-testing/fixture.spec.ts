import { TestFixture } from './fixture';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { getDefaultCharacter } from '@sr2020/sr2020-models/testing/test-helper';

describe('Fixture', function() {
  // tslint:disable-next-line: no-invalid-this
  this.timeout(15000);

  let fixture: TestFixture;

  beforeEach('setupApplication', async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Ping', async () => {
    await fixture.client.get('/ping').expect(200);
  });

  it('Put character', async () => {
    const m: Sr2020Character = {
      modelId: '1',
      spellsCasted: 0,
      ...getDefaultCharacter(),
    };
    await fixture.client
      .put('/character/model')
      .send(m)
      .expect(200);
  });

  // TODO(aeremin): add more tests demonstrating fixture interaction
});
