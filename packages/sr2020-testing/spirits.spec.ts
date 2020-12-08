import { TestFixture } from './fixture';

import { getAllFeatures } from '@alice/sr2020-model-engine/scripts/character/features';
import { kSpiritAbilityIds } from '@alice/sr2020-model-engine/scripts/qr/spirits_library';
import { BodyStorageQrData, typedQrData } from '@alice/sr2020-model-engine/scripts/qr/datatypes';

describe('Spirits-related abilities', () => {
  let fixture: TestFixture;

  beforeEach(async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Spirit abilities are valid', () => {
    for (const id of kSpiritAbilityIds) {
      expect(getAllFeatures()).toContainEqual(expect.objectContaining({ id }));
    }
  });

  it('Entering and leaving spirit', async () => {
    // Mage set up
    await fixture.saveCharacter({ maxHp: 2, magic: 5 });
    await fixture.addCharacterFeature('own-spirit');

    // Body storage set up
    await fixture.saveQrCode({ modelId: '1' });
    await fixture.sendQrCodeEvent({ eventType: 'writeBodyStorage', data: { name: '' } }, '1');

    // Spirit set up
    await fixture.saveQrCode({ modelId: '2' });
    await fixture.sendQrCodeEvent({ eventType: 'writeSpirit', data: { id: 'spirit-type-1' } }, '2');

    // Enter spirit
    await fixture.useAbility({ id: 'own-spirit', bodyStorageId: '1', droneId: '2' });

    {
      // Body is in storage
      const { baseModel } = await fixture.getQrCode('1');
      const storage = typedQrData<BodyStorageQrData>(baseModel);
      expect(storage.body).toEqual({
        characterId: '0',
        type: 'physical',
      });
    }

    {
      // Mage is in spirit and has proper abilities and hp
      const { workModel } = await fixture.getCharacter();
      expect(workModel.maxHp).toBe(4);
      expect(workModel.activeAbilities).toContainEqual(expect.objectContaining({ id: 'dispirit' }));
      expect(workModel.currentBody).toBe('ectoplasm');
    }

    // Leave spirit
    await fixture.useAbility({ id: 'dispirit', bodyStorageId: '1' });

    {
      // Storage is empty
      const { baseModel } = await fixture.getQrCode('1');
      const storage = typedQrData<BodyStorageQrData>(baseModel);
      expect(storage.body).toBeUndefined();
    }

    {
      // Mage is not in the spirit
      const { workModel } = await fixture.getCharacter();
      expect(workModel.maxHp).toBe(2);
      expect(workModel.passiveAbilities).not.toContainEqual(expect.objectContaining({ id: 'dispirit' }));
      expect(workModel.activeAbilities).toHaveLength(1); // Enter spirit
      expect(workModel.currentBody).toBe('physical');
    }
  });
});
