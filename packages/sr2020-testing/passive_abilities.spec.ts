import { TestFixture } from './fixture';

describe('Passive abilities', function () {
  let fixture: TestFixture;

  beforeEach(async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Archetype Mage', async () => {
    await fixture.saveCharacter({ magic: 1 });
    await fixture.addCharacterFeature('arch-mage');
    const { workModel } = await fixture.getCharacter();
    expect(workModel.magic).toBe(3);
  });

});
