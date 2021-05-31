import { TestFixture } from './fixture';

import { BodyStorageQrData, DroneQrData, typedQrData } from '@alice/sr2020-model-engine/scripts/qr/datatypes';
import { duration } from 'moment';
import { kDroneAbilityIds } from '@alice/sr2020-model-engine/scripts/qr/drone_library';
import { getAllFeatures } from '@alice/sr2020-model-engine/scripts/character/features';
import { AnalyzedBody } from '@alice/sr2020-common/models/sr2020-character.model';

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
      expect((workModel.analyzedBody as AnalyzedBody).essence).toBe(480);
      expect((workModel.analyzedBody as AnalyzedBody).implants).toContainEqual(expect.objectContaining({ id: 'rcc-beta' }));
    }

    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'disconnectFromBody', data: {} }, 1);
      expect(workModel.analyzedBody).toBeFalsy();
    }
  });

  it('Implant installation and removal - happy path', async () => {
    await fixture.saveCharacter({ modelId: '1' }); // patient

    await fixture.saveCharacter({ modelId: '2', rigging: { implantsBonus: 100 }, drones: { maxDifficulty: 100, autodocBonus: 100 } }); // rigger
    await fixture.addCharacterFeature('arch-rigger', '2');
    await fixture.addCharacterFeature('drones-active', '2');

    await fixture.saveQrCode({ modelId: '6' }); // drone
    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'tool-autodoc-1' } }, '6');
    await fixture.saveQrCode({ modelId: '7' }); // body storage
    await fixture.sendQrCodeEvent({ eventType: 'writeBodyStorage', data: { name: '' } }, '7');
    await fixture.useAbility({ id: 'drones-active', bodyStorageId: '7', droneId: '6' }, '2');

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
      expect((workModel.analyzedBody as AnalyzedBody).implants.length).toBe(0);
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
    await fixture.addCharacterFeature('arch-rigger');
    await fixture.addCharacterFeature('drones-active');

    // Body storage set up
    await fixture.saveQrCode({ modelId: '1' });
    await fixture.sendQrCodeEvent({ eventType: 'writeBodyStorage', data: { name: '' } }, '1');

    // Drone set up
    await fixture.saveQrCode({ modelId: '2' });
    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'hippocrates' } }, '2');

    // Enter drone
    await fixture.useAbility({ id: 'drones-active', bodyStorageId: '1', droneId: '2' });

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
        duration(/* default recovery time */ 120 - /* body with arch-rigger bonus */ 5 * 5, 'minutes').asMilliseconds(),
      );
      expect(workModel.currentBody).toBe('physical');
    }
  });

  it('Breaking and repairing drone', async () => {
    // Rigger set up
    await fixture.saveCharacter({ maxHp: 2, body: 3, drones: { maxDifficulty: 10, medicraftBonus: 10, recoverySkill: 100 } });
    await fixture.addCharacterFeature('arch-rigger');
    await fixture.addCharacterFeature('drones-active');

    // Body storage set up
    await fixture.saveQrCode({ modelId: '1' });
    await fixture.sendQrCodeEvent({ eventType: 'writeBodyStorage', data: { name: '' } }, '1');

    // Drone set up
    await fixture.saveQrCode({ modelId: '2' });
    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'hippocrates' } }, '2');

    // Enter drone
    await fixture.useAbility({ id: 'drones-active', bodyStorageId: '1', droneId: '2' });

    // Mark drone as broken
    await fixture.useAbility({ id: 'drone-danger', bodyStorageId: '1' });

    // Leave drone
    await fixture.useAbility({ id: 'drone-logoff', bodyStorageId: '1' });

    {
      const { workModel } = await fixture.getQrCode('2');
      expect(workModel.type).toBe('drone');
      expect(typedQrData<DroneQrData>(workModel).broken).toBe(true);
      expect(workModel.name).toContain('(сломан)');
    }

    // Repair drone
    await fixture.addCharacterFeature('drone-recovery');
    await fixture.saveQrCode({ modelId: '3' });
    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'repair-kit-1' } }, '3');
    await fixture.useAbility({ id: 'drone-recovery', droneId: '2', qrCodeId: '3' });

    {
      const { workModel } = await fixture.getQrCode('2');
      expect(workModel.type).toBe('drone');
      expect(typedQrData<DroneQrData>(workModel).broken).toBe(false);
      expect(workModel.name).not.toContain('(сломан)');
    }
  });

  it('Spending too long in drone will wound you', async () => {
    // Rigger set up
    await fixture.saveCharacter({ maxHp: 4, drones: { maxDifficulty: 10, medicraftBonus: 10 } });
    await fixture.addCharacterFeature('arch-rigger');
    await fixture.addCharacterFeature('drones-active');

    // Body storage set up
    await fixture.saveQrCode({ modelId: '1' });
    await fixture.sendQrCodeEvent({ eventType: 'writeBodyStorage', data: { name: '' } }, '1');

    // Drone set up
    await fixture.saveQrCode({ modelId: '2' });
    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'hippocrates' } }, '2');

    // Enter drone
    await fixture.useAbility({ id: 'drones-active', bodyStorageId: '1', droneId: '2' });

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
    await fixture.addCharacterFeature('arch-rigger');
    await fixture.addCharacterFeature('drones-active');

    // Body storage set up
    await fixture.saveQrCode({ modelId: '1' });
    await fixture.sendQrCodeEvent({ eventType: 'writeBodyStorage', data: { name: '' } }, '1');

    // Drone set up
    await fixture.saveQrCode({ modelId: '2' });
    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'hippocrates' } }, '2');

    // Enter drone
    await fixture.useAbility({ id: 'drones-active', bodyStorageId: '1', droneId: '2' });

    // Wait for long time
    await fixture.advanceTime(duration(20, 'hours'));

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
    await fixture.addCharacterFeature('arch-rigger');
    await fixture.addCharacterFeature('drones-active');

    // Body storage set up
    await fixture.saveQrCode({ modelId: '1' });
    await fixture.sendQrCodeEvent({ eventType: 'writeBodyStorage', data: { name: '' } }, '1');

    // Drone set up
    await fixture.saveQrCode({ modelId: '2' });
    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'tool-autodoc-1' } }, '2');

    expect((await fixture.getCharacter()).workModel.screens.autodoc).toBe(false);

    // Enter drone
    await fixture.useAbility({ id: 'drones-active', bodyStorageId: '1', droneId: '2' });
    expect((await fixture.getCharacter()).workModel.screens.autodoc).toBe(true);

    // Leave drone
    await fixture.useAbility({ id: 'drone-logoff', bodyStorageId: '1' });
    expect((await fixture.getCharacter()).workModel.screens.autodoc).toBe(false);
  });
});
