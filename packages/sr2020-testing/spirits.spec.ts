import { TestFixture } from './fixture';
import { Spirit } from '@alice/sr2020-model-engine/scripts/qr/spirits_library';

describe('Spirits-related abilities', () => {
  let fixture: TestFixture;

  beforeEach(async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Entering and leaving spirit', async () => {
    // Mage set up
    await fixture.saveCharacter({ name: 'Vasya', maxHp: 2, magic: 5 });

    const spirit: Spirit = {
      name: 'Petya',
      hp: 6,
      abilityIds: ['magic-3'],
    };
    // Enter spirit
    await fixture.sendCharacterEvent({ eventType: 'enterSpirit', data: spirit });

    {
      // Mage is in spirit and has proper abilities and hp
      const { workModel } = await fixture.getCharacter();
      expect(workModel.name).toBe('Petya');
      expect(workModel.maxHp).toBe(6);
      expect(workModel.magic).toBe(6);
      expect(workModel.activeAbilities).toContainEqual(expect.objectContaining({ id: 'dispirit' }));
      expect(workModel.currentBody).toBe('ectoplasm');
    }

    // Leave spirit
    await fixture.useAbility({ id: 'dispirit' });

    {
      // Mage is not in the spirit
      const { workModel } = await fixture.getCharacter();
      expect(workModel.name).toBe('Vasya');
      expect(workModel.maxHp).toBe(2);
      expect(workModel.magic).toBe(5);
      expect(workModel.passiveAbilities).not.toContainEqual(expect.objectContaining({ id: 'magic-3' }));
      expect(workModel.activeAbilities).toHaveLength(0); // Enter spirit
      expect(workModel.currentBody).toBe('physical');
    }
  });
});
