import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';

describe('Essence', function() {
  let fixture: TestFixture;

  beforeEach(async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Default essence', async () => {
    await fixture.saveCharacter();
    expect((await fixture.getCharacter()).workModel.essence).equal(600);
  });

  it('Losing essence reduces stats', async () => {
    await fixture.saveCharacter({ charisma: 3, resonance: 3, magic: 3, essenceDetails: { max: 600, used: 99, gap: 0 } });
    expect((await fixture.getCharacter()).workModel).containDeep({ essence: 501, charisma: 3, resonance: 3, magic: 3 });

    await fixture.saveCharacter({ charisma: 3, resonance: 3, magic: 3, essenceDetails: { max: 600, used: 150, gap: 0 } });
    expect((await fixture.getCharacter()).workModel).containDeep({ essence: 450, charisma: 2, resonance: 2, magic: 2 });

    await fixture.saveCharacter({ charisma: 3, resonance: 3, magic: 3, essenceDetails: { max: 600, used: 500, gap: 100 } });
    expect((await fixture.getCharacter()).workModel).containDeep({ essence: 0, charisma: 0, resonance: 0, magic: 0 });

    await fixture.saveCharacter({ charisma: 6, resonance: 6, magic: 6, essenceDetails: { max: 600, used: 500, gap: 100 } });
    expect((await fixture.getCharacter()).workModel).containDeep({ essence: 0, charisma: 1, resonance: 1, magic: 1 });
  });
});
