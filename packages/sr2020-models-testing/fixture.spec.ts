import { TestFixture } from './fixture';
import { getDefaultCharacter } from '@sr2020/sr2020-models/testing/test-helper';
import { expect } from '@loopback/testlab';

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
    const m = getDefaultCharacter();
    await fixture.client
      .put('/character/model')
      .send(m)
      .expect(200);
    const c = await fixture.getCharacter(m.modelId);
    expect(m).to.deepEqual(c);
  });

  it('Save and get location partial', async () => {
    await fixture.saveLocation({ manaDensity: 15 });
    const m = await fixture.getLocation();
    expect(m).to.containDeep({ manaDensity: 15 });
  });

  // TODO(aeremin): add more tests demonstrating fixture interaction
});
