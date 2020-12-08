import { TestFixture } from './fixture';

import { BodyStorageQrData, typedQrData } from '@alice/sr2020-model-engine/scripts/qr/datatypes';
import { duration } from 'moment';
import { kDroneAbilityIds } from '@alice/sr2020-model-engine/scripts/qr/drone_library';
import { getAllFeatures } from '@alice/sr2020-model-engine/scripts/character/features';

describe('Rigger abilities', () => {
  let fixture: TestFixture;

  beforeEach(async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Drone abilities are valid', () => {
    for (const id of kDroneAbilityIds) {
      expect(getAllFeatures()).toContainEqual(expect.objectContaining({ id }));
    }
  });

  it('Connect and disconnect to body', async () => {
    await fixture.saveCharacter({ modelId: '1' });

    await fixture.saveCharacter({ modelId: '2', healthState: 'wounded' });
    await fixture.sendCharacterEvent({ eventType: 'installImplant', data: { id: 'rcc-beta' } }, 2);

    {
      const { workModel } = await fixture.getCharacter(1);
      expect(workModel.analyzedBody).toBeFalsy();
    }

    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'analyzeBody', data: { targetCharacterId: '2' } }, 1);
      expect(workModel.analyzedBody).toBeTruthy();
      expect(workModel.analyzedBody?.essence).toBe(480);
      expect(workModel.analyzedBody?.implants).toContainEqual(expect.objectContaining({ id: 'rcc-beta' }));
    }

    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'disconnectFromBody', data: {} }, 1);
      expect(workModel.analyzedBody).toBeFalsy();
    }
  });

  it('Implant installation and removal - happy path', async () => {
    await fixture.saveCharacter({ modelId: '1' }); // patient
    await fixture.saveCharacter({ modelId: '2', intelligence: 10 }); // rigger
    await fixture.saveQrCode({ modelId: '3' }); // implant
    await fixture.saveQrCode({ modelId: '4' }); // implant
    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'rcc-beta', basePrice: 10 } }, 3);
    {
      const { workModel } = await fixture.sendCharacterEvent(
        { eventType: 'riggerInstallImplant', data: { targetCharacterId: '1', qrCode: '3' } },
        2,
      );
      const patientWorkModel = (await fixture.getCharacter(1)).workModel;
      const qrWorkModel = (await fixture.getQrCode(3)).workModel;
      expect(qrWorkModel.type).toBe('box');
      expect(workModel.analyzedBody).toMatchObject({
        implants: [
          {
            id: 'rcc-beta',
          },
        ],
      });
      expect(patientWorkModel).toMatchObject({
        essence: 480,
        essenceDetails: {
          used: 120,
          gap: 0,
        },
        implants: [
          {
            id: 'rcc-beta',
          },
        ],
      });
    }
    {
      const { workModel } = await fixture.sendCharacterEvent(
        { eventType: 'riggerUninstallImplant', data: { targetCharacterId: '1', qrCode: '4', implantId: 'rcc-beta' } },
        2,
      );
      const patientWorkModel = (await fixture.getCharacter(1)).workModel;
      const qrWorkModel = (await fixture.getQrCode(4)).workModel;
      expect(qrWorkModel).toMatchObject({ type: 'implant', usesLeft: 1, data: { id: 'rcc-beta', basePrice: 10 } });
      expect(workModel.analyzedBody?.implants.length).toBe(0);
      expect(patientWorkModel.implants.length).toBe(0);
      expect(patientWorkModel).toMatchObject({
        essence: 480,
        essenceDetails: {
          used: 0,
          gap: 120,
        },
      });
    }
  });

  it('Entering and leaving drone', async () => {
    // Rigger set up
    await fixture.saveCharacter({ maxHp: 2, body: 3, drones: { maxDifficulty: 10, medicraftBonus: 10 } });
    await fixture.addCharacterFeature('medicart-active');

    // Body storage set up
    await fixture.saveQrCode({ modelId: '1' });
    await fixture.sendQrCodeEvent({ eventType: 'writeBodyStorage', data: { name: '' } }, '1');

    // Drone set up
    await fixture.saveQrCode({ modelId: '2' });
    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'hippocrates' } }, '2');

    // Enter drone
    await fixture.useAbility({ id: 'medicart-active', bodyStorageId: '1', droneId: '2' });

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
      // Rigger is in drone and has proper abilities and hp
      const { workModel } = await fixture.getCharacter();
      expect(workModel.maxHp).toBe(3);
      expect(workModel.passiveAbilities).toContainEqual(expect.objectContaining({ id: 'drone-medcart' }));
      expect(workModel.activeAbilities).toHaveLength(6); // Heals 2x2
      expect(workModel.currentBody).toBe('drone');
    }

    // Leave drone
    await fixture.useAbility({ id: 'drone-logoff', bodyStorageId: '1' });

    {
      // Storage is empty
      const { baseModel } = await fixture.getQrCode('1');
      const storage = typedQrData<BodyStorageQrData>(baseModel);
      expect(storage.body).toBeUndefined();
    }

    {
      // Rigger is not in the drone
      const { workModel } = await fixture.getCharacter();
      expect(workModel.maxHp).toBe(2);
      expect(workModel.passiveAbilities).not.toContainEqual(expect.objectContaining({ id: 'drone-medcart' }));
      expect(workModel.activeAbilities).toHaveLength(1); // Enter drone
      expect(workModel.activeAbilities[0].cooldownUntil).toBe(
        duration(/* default recovery time */ 120 - /* body */ 3 * 5, 'minutes').asMilliseconds(),
      );
      expect(workModel.currentBody).toBe('physical');
    }
  });

  it('Spending too long in drone will wound you', async () => {
    // Rigger set up
    await fixture.saveCharacter({ maxHp: 4, drones: { maxDifficulty: 10, medicraftBonus: 10 } });
    await fixture.addCharacterFeature('medicart-active');

    // Body storage set up
    await fixture.saveQrCode({ modelId: '1' });
    await fixture.sendQrCodeEvent({ eventType: 'writeBodyStorage', data: { name: '' } }, '1');

    // Drone set up
    await fixture.saveQrCode({ modelId: '2' });
    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'hippocrates' } }, '2');

    // Enter drone
    await fixture.useAbility({ id: 'medicart-active', bodyStorageId: '1', droneId: '2' });

    // Wait for long time
    await fixture.advanceTime(duration(2, 'hours'));

    // Leave drone
    await fixture.useAbility({ id: 'drone-logoff', bodyStorageId: '1' });

    // Rigger is not in the drone
    const { workModel } = await fixture.getCharacter();
    expect(workModel.healthState).toBe('wounded');
  });

  it('Spending way too long in drone and hunger', async () => {
    // Rigger set up
    await fixture.saveCharacter({ maxHp: 6, drones: { maxDifficulty: 10, medicraftBonus: 10 } });
    await fixture.addCharacterFeature('medicart-active');

    // Body storage set up
    await fixture.saveQrCode({ modelId: '1' });
    await fixture.sendQrCodeEvent({ eventType: 'writeBodyStorage', data: { name: '' } }, '1');

    // Drone set up
    await fixture.saveQrCode({ modelId: '2' });
    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'hippocrates' } }, '2');

    // Enter drone
    await fixture.useAbility({ id: 'medicart-active', bodyStorageId: '1', droneId: '2' });

    // Wait for long time
    await fixture.advanceTime(duration(10, 'hours'));

    await fixture.getCharacter();

    // Leave drone
    await fixture.useAbility({ id: 'drone-logoff', bodyStorageId: '1' });

    // Rigger is not in the drone
    const { workModel } = await fixture.getCharacter();
    expect(workModel.healthState).toBe('wounded');
  });

  it('Being in autodoc unlocks autodoc screen', async () => {
    // Rigger set up
    await fixture.saveCharacter({ drones: { maxDifficulty: 10, autodocBonus: 10 } });
    await fixture.addCharacterFeature('autodoc-active');

    // Body storage set up
    await fixture.saveQrCode({ modelId: '1' });
    await fixture.sendQrCodeEvent({ eventType: 'writeBodyStorage', data: { name: '' } }, '1');

    // Drone set up
    await fixture.saveQrCode({ modelId: '2' });
    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'tool-autodoc-1' } }, '2');

    expect((await fixture.getCharacter()).workModel.screens.autodoc).toBe(false);

    // Enter drone
    await fixture.useAbility({ id: 'autodoc-active', bodyStorageId: '1', droneId: '2' });
    expect((await fixture.getCharacter()).workModel.screens.autodoc).toBe(true);

    // Leave drone
    await fixture.useAbility({ id: 'drone-logoff', bodyStorageId: '1' });
    expect((await fixture.getCharacter()).workModel.screens.autodoc).toBe(false);
  });
});
