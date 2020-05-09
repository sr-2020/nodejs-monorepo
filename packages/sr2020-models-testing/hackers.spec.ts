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
    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'dumpshock', data: {} });
      expect(workModel.resonance).equal(4);
    }
    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'dumpshock', data: {} });
      expect(workModel.resonance).equal(3);
    }
  });
});
