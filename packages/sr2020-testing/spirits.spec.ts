import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';
import { getAllFeatures } from '@sr2020/sr2020-model-engine/scripts/character/features';
import { kSpiritAbilityIds } from '@sr2020/sr2020-model-engine/scripts/qr/spirits_library';
import { BodyStorageQrData, typedQrData } from '@sr2020/sr2020-model-engine/scripts/qr/datatypes';

describe('Spirits-related abilities', () => {
  let fixture: TestFixture;

  beforeEach('setupApplication', async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Spirit abilities are valid', () => {
    for (const id of kSpiritAbilityIds) {
      expect(getAllFeatures()).containDeep([{ id }]);
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
      expect(storage.body).to.deepEqual({
        characterId: '0',
        type: 'physical',
      });
    }

    {
      // Mage is in spirit and has proper abilities and hp
      const { workModel } = await fixture.getCharacter();
      expect(workModel.maxHp).to.equal(3);
      expect(workModel.activeAbilities).to.containDeep([{ id: 'dispirit' }]);
      expect(workModel.currentBody).to.equal('ectoplasm');
    }

    // Leave spirit
    await fixture.useAbility({ id: 'dispirit', bodyStorageId: '1' });

    {
      // Storage is empty
      const { baseModel } = await fixture.getQrCode('1');
      const storage = typedQrData<BodyStorageQrData>(baseModel);
      expect(storage.body).undefined();
    }

    {
      // Mage is not in the spirit
      const { workModel } = await fixture.getCharacter();
      expect(workModel.maxHp).to.equal(2);
      expect(workModel.passiveAbilities).not.to.containDeep([{ id: 'dispirit' }]);
      expect(workModel.activeAbilities).lengthOf(1); // Enter spirit
      expect(workModel.currentBody).to.equal('physical');
    }
  });
});
