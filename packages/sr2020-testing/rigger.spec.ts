import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';
import { BodyStorageQrData, typedQrData } from '@sr2020/sr2020-model-engine/scripts/qr/datatypes';
import { duration } from 'moment';
import { kDroneAbilityIds } from '@sr2020/sr2020-model-engine/scripts/qr/drone_library';
import { getAllFeatures } from '@sr2020/sr2020-model-engine/scripts/character/features';

describe('Rigger abilities', () => {
  let fixture: TestFixture;

  beforeEach('setupApplication', async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Drone abilities are valid', () => {
    for (const id of kDroneAbilityIds) {
      expect(getAllFeatures()).containDeep([{ id }]);
    }
  });

  it('Connect and disconnect to body', async () => {
    await fixture.saveCharacter({ modelId: '1' });

    await fixture.saveCharacter({ modelId: '2', healthState: 'wounded' });
    await fixture.sendCharacterEvent({ eventType: 'installImplant', data: { id: 'rcc-beta' } }, 2);

    {
      const { workModel } = await fixture.getCharacter(1);
      expect(workModel.analyzedBody).not.ok();
    }

    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'analyzeBody', data: { targetCharacterId: '2' } }, 1);
      expect(workModel.analyzedBody).ok();
      expect(workModel.analyzedBody?.essence).to.equal(480);
      expect(workModel.analyzedBody?.implants).to.containDeep([{ id: 'rcc-beta' }]);
    }

    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'disconnectFromBody', data: {} }, 1);
      expect(workModel.analyzedBody).not.ok();
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
      expect(qrWorkModel.type).to.equal('box');
      expect(workModel.analyzedBody).to.containDeep({
        implants: [
          {
            id: 'rcc-beta',
          },
        ],
      });
      expect(patientWorkModel).to.containDeep({
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
      expect(qrWorkModel).to.containDeep({ type: 'implant', usesLeft: 1, data: { id: 'rcc-beta', basePrice: 10 } });
      expect(workModel.analyzedBody?.implants.length).to.equal(0);
      expect(patientWorkModel.implants.length).to.equal(0);
      expect(patientWorkModel).to.containDeep({
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
    await fixture.addCharacterFeature('medicraft-active');

    // Body storage set up
    await fixture.saveQrCode({ modelId: '1' });
    await fixture.sendQrCodeEvent({ eventType: 'writeBodyStorage', data: { name: '' } }, '1');

    // Drone set up
    await fixture.saveQrCode({ modelId: '2' });
    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'hippocrates' } }, '2');

    // Enter drone
    await fixture.useAbility({ id: 'medicraft-active', bodyStorageId: '1', droneId: '2' });

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
      // Rigger is in drone and has proper abilities and hp
      const { workModel } = await fixture.getCharacter();
      expect(workModel.maxHp).to.equal(3);
      expect(workModel.passiveAbilities).to.containDeep([{ id: 'drone-medcart' }]);
      expect(workModel.activeAbilities).lengthOf(6); // Heals 2x2
      expect(workModel.currentBody).to.equal('drone');
    }

    // Leave drone
    await fixture.useAbility({ id: 'drone-logoff', bodyStorageId: '1' });

    {
      // Storage is empty
      const { baseModel } = await fixture.getQrCode('1');
      const storage = typedQrData<BodyStorageQrData>(baseModel);
      expect(storage.body).undefined();
    }

    {
      // Rigger is not in the drone
      const { workModel } = await fixture.getCharacter();
      expect(workModel.maxHp).to.equal(2);
      expect(workModel.passiveAbilities).not.to.containDeep([{ id: 'drone-medcart' }]);
      expect(workModel.activeAbilities).lengthOf(1); // Enter drone
      expect(workModel.activeAbilities[0].cooldownUntil).equal(
        duration(/* default recovery time */ 120 - /* body */ 3 * 5, 'minutes').asMilliseconds(),
      );
      expect(workModel.currentBody).to.equal('physical');
    }
  });

  it('Spending too long in drone will wound you', async () => {
    // Rigger set up
    await fixture.saveCharacter({ maxHp: 4, drones: { maxDifficulty: 10, medicraftBonus: 10 } });
    await fixture.addCharacterFeature('medicraft-active');

    // Body storage set up
    await fixture.saveQrCode({ modelId: '1' });
    await fixture.sendQrCodeEvent({ eventType: 'writeBodyStorage', data: { name: '' } }, '1');

    // Drone set up
    await fixture.saveQrCode({ modelId: '2' });
    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'hippocrates' } }, '2');

    // Enter drone
    await fixture.useAbility({ id: 'medicraft-active', bodyStorageId: '1', droneId: '2' });

    // Wait for long time
    await fixture.advanceTime(duration(2, 'hours'));

    // Leave drone
    await fixture.useAbility({ id: 'drone-logoff', bodyStorageId: '1' });

    // Rigger is not in the drone
    const { workModel } = await fixture.getCharacter();
    expect(workModel.healthState).equal('wounded');
  });

  it('Spending way too long in drone and hunger', async () => {
    // Rigger set up
    await fixture.saveCharacter({ maxHp: 6, drones: { maxDifficulty: 10, medicraftBonus: 10 } });
    await fixture.addCharacterFeature('medicraft-active');

    // Body storage set up
    await fixture.saveQrCode({ modelId: '1' });
    await fixture.sendQrCodeEvent({ eventType: 'writeBodyStorage', data: { name: '' } }, '1');

    // Drone set up
    await fixture.saveQrCode({ modelId: '2' });
    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'hippocrates' } }, '2');

    // Enter drone
    await fixture.useAbility({ id: 'medicraft-active', bodyStorageId: '1', droneId: '2' });

    // Wait for long time
    await fixture.advanceTime(duration(10, 'hours'));

    await fixture.getCharacter();

    // Leave drone
    await fixture.useAbility({ id: 'drone-logoff', bodyStorageId: '1' });

    // Rigger is not in the drone
    const { workModel } = await fixture.getCharacter();
    expect(workModel.healthState).equal('wounded');
  });

  it('Being in autodoc unlocks autodoc screen', async () => {
    // Rigger set up
    await fixture.saveCharacter({ drones: { maxDifficulty: 10, medicraftBonus: 10 } });
    await fixture.addCharacterFeature('medicraft-active');

    // Body storage set up
    await fixture.saveQrCode({ modelId: '1' });
    await fixture.sendQrCodeEvent({ eventType: 'writeBodyStorage', data: { name: '' } }, '1');

    // Drone set up
    await fixture.saveQrCode({ modelId: '2' });
    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'tool-autodoc-1' } }, '2');

    expect((await fixture.getCharacter()).workModel.screens.autodoc).to.be.false();

    // Enter drone
    await fixture.useAbility({ id: 'medicraft-active', bodyStorageId: '1', droneId: '2' });
    expect((await fixture.getCharacter()).workModel.screens.autodoc).to.be.true();

    // Leave drone
    await fixture.useAbility({ id: 'drone-logoff', bodyStorageId: '1' });
    expect((await fixture.getCharacter()).workModel.screens.autodoc).to.be.false();
  });
});
