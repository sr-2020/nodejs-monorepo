import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';

describe('Hackers-related events', function() {
  let fixture: TestFixture;

  beforeEach(async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Dump shock reduces resonance', async () => {
    await fixture.saveCharacter({ resonance: 5 });
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'dump-shock-survivor' } });
    const c = await fixture.getCharacter();
    expect(c.workModel).containDeep({ resonance: 4 });
  });
});
