import { TestFixture } from './fixture';

import { BodyStorageQrData, typedQrData } from '@alice/sr2020-model-engine/scripts/qr/datatypes';
import { duration } from 'moment';

describe('VR abilities', () => {
  let fixture: TestFixture;

  beforeEach(async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Entering and leaving VR', async () => {
    // Chummer set up
    await fixture.saveCharacter({ maxHp: 2, body: 3, maxTimeInVr: 10 });
    await fixture.addCharacterFeature('enter-vr');

    // Body storage set up
    await fixture.saveQrCode({ modelId: '1' });
    await fixture.sendQrCodeEvent({ eventType: 'writeBodyStorage', data: { name: '' } }, '1');

    // Enter VR
    await fixture.useAbility({ id: 'enter-vr', bodyStorageId: '1' });

    {
      // Body is in storage
      const { baseModel } = await fixture.getQrCode('1');
      const storage = typedQrData<BodyStorageQrData>(baseModel);
      expect(storage.body).toEqual({
        characterId: '0',
        type: 'physical',
        metarace: 'meta-norm',
        name: 'Вася Пупкин',
      });
    }

    {
      // Chummer is in VR and has proper abilities and hp
      const { workModel } = await fixture.getCharacter();
      expect(workModel.activeAbilities).not.toContainEqual(expect.objectContaining({ id: 'enter-vr' }));
      expect(workModel.activeAbilities).toContainEqual(expect.objectContaining({ id: 'exit-vr' }));
      expect(workModel.currentBody).toBe('vr');
    }

    // Leave VR
    await fixture.useAbility({ id: 'exit-vr', bodyStorageId: '1' });

    {
      // Storage is empty
      const { baseModel } = await fixture.getQrCode('1');
      const storage = typedQrData<BodyStorageQrData>(baseModel);
      expect(storage.body).toBeUndefined();
    }

    {
      // Chummer is not in VR
      const { workModel } = await fixture.getCharacter();
      expect(workModel.activeAbilities).not.toContainEqual(expect.objectContaining({ id: 'exit-vr' }));
      expect(workModel.activeAbilities).toContainEqual(expect.objectContaining({ id: 'enter-vr' }));
      expect(workModel.currentBody).toBe('physical');
    }
  });

  it('Spending too long in VR will wound you', async () => {
    // Chummer set up
    await fixture.saveCharacter({ maxHp: 2, body: 3, maxTimeInVr: 110 });
    await fixture.addCharacterFeature('enter-vr');

    // Body storage set up
    await fixture.saveQrCode({ modelId: '1' });
    await fixture.sendQrCodeEvent({ eventType: 'writeBodyStorage', data: { name: '' } }, '1');

    // Enter VR
    await fixture.useAbility({ id: 'enter-vr', bodyStorageId: '1' });

    // Wait for long time
    await fixture.advanceTime(duration(2, 'hours'));

    // Leave VR
    await fixture.useAbility({ id: 'exit-vr', bodyStorageId: '1' });

    // Got wounded on exit
    const { workModel } = await fixture.getCharacter();
    expect(workModel.healthState).toBe('wounded');
  });

  it('Spending way too long in VR and hunger', async () => {
    // Chummer set up
    await fixture.saveCharacter({ maxHp: 2, body: 3, maxTimeInVr: 10000 });
    await fixture.addCharacterFeature('enter-vr');
    await fixture.sendCharacterEvent({ eventType: 'consumeFood', data: { id: 'food' } });

    // Body storage set up
    await fixture.saveQrCode({ modelId: '1' });
    await fixture.sendQrCodeEvent({ eventType: 'writeBodyStorage', data: { name: '' } }, '1');

    // Enter VR
    await fixture.useAbility({ id: 'enter-vr', bodyStorageId: '1' });

    // Wait for long time
    await fixture.advanceTime(duration(20, 'hours'));

    // Leave drone
    await fixture.useAbility({ id: 'exit-vr', bodyStorageId: '1' });

    // Got wounded on exit
    const { workModel } = await fixture.getCharacter();
    expect(workModel.healthState).toBe('wounded');
  });
});
