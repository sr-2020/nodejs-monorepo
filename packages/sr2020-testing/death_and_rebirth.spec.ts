import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';
import { duration } from 'moment';

describe('Death & Rebirth', function () {
  // eslint-disable-next-line no-invalid-this
  this.timeout(15000);
  let fixture: TestFixture;

  beforeEach('setupApplication', async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Healthy -> Wounded -> Clinically dead -> Healthy', async () => {
    await fixture.saveCharacter({ healthState: 'healthy' });
    await fixture.sendCharacterEvent({ eventType: 'wound' });
    expect(await fixture.getCharacter()).containDeep({ workModel: { healthState: 'wounded' } });
    await fixture.advanceTime(duration(30, 'minutes'));
    expect(await fixture.getCharacter()).containDeep({ workModel: { healthState: 'clinically_dead' } });
    await fixture.sendCharacterEvent({ eventType: 'revive', data: {} });
    expect(await fixture.getCharacter()).containDeep({ workModel: { healthState: 'healthy' } });
  });

  it('Revive cancels death timer', async () => {
    await fixture.saveCharacter({ healthState: 'healthy' });
    await fixture.sendCharacterEvent({ eventType: 'wound' });
    expect(await fixture.getCharacter()).containDeep({ workModel: { healthState: 'wounded' } });
    await fixture.advanceTime(duration(15, 'minutes'));
    await fixture.sendCharacterEvent({ eventType: 'revive', data: {} });
    await fixture.advanceTime(duration(15, 'minutes'));
    expect(await fixture.getCharacter()).containDeep({ workModel: { healthState: 'healthy' } });
  });

  it('Healthy -> Wounded -> Revived by implant -> Wound -> No revive because cooldown', async () => {
    await fixture.saveCharacter({ healthState: 'healthy' });
    await fixture.sendCharacterEvent({ eventType: 'installImplant', data: { id: 'medkit-alpha' } });

    await fixture.sendCharacterEvent({ eventType: 'wound' });
    expect(await fixture.getCharacter()).containDeep({ workModel: { healthState: 'wounded' } });

    await fixture.advanceTime(duration(10, 'minutes'));
    expect(await fixture.getCharacter()).containDeep({ workModel: { healthState: 'healthy' } });

    await fixture.sendCharacterEvent({ eventType: 'wound' });
    await fixture.advanceTime(duration(30, 'minutes'));
    expect(await fixture.getCharacter()).containDeep({ workModel: { healthState: 'clinically_dead' } });
  });

  it('Healthy -> Wounded -> Revived by implant -> (wait) -> Wound -> Revived by implant', async () => {
    await fixture.saveCharacter({ healthState: 'healthy' });
    await fixture.sendCharacterEvent({ eventType: 'installImplant', data: { id: 'medkit-alpha' } });

    await fixture.sendCharacterEvent({ eventType: 'wound' });
    expect(await fixture.getCharacter()).containDeep({ workModel: { healthState: 'wounded' } });

    await fixture.advanceTime(duration(10, 'minutes'));
    expect(await fixture.getCharacter()).containDeep({ workModel: { healthState: 'healthy' } });

    await fixture.advanceTime(duration(4, 'hours'));

    await fixture.sendCharacterEvent({ eventType: 'wound' });
    await fixture.advanceTime(duration(10, 'minutes'));
    expect(await fixture.getCharacter()).containDeep({ workModel: { healthState: 'healthy' } });
    await fixture.advanceTime(duration(30, 'minutes'));
    expect(await fixture.getCharacter()).containDeep({ workModel: { healthState: 'healthy' } });
  });

  it('Reanimation by capsule', async () => {
    // Medic
    await fixture.saveCharacter({ modelId: '1' });
    await fixture.addCharacterFeature('reanimate', '1');

    // Patient
    await fixture.saveCharacter({ healthState: 'clinically_dead', essenceDetails: { max: 500, gap: 0, used: 0 }, modelId: '2' });

    // Capsule
    await fixture.saveQrCode({ modelId: '3' });
    await fixture.sendQrCodeEvent(
      {
        eventType: 'writeReanimateCapsule',
        data: { name: 'Reviver', description: '', essenceGet: 10, essenceAir: 30, cooldown: 55 },
      },
      '3',
    );

    // AI
    await fixture.saveQrCode({ modelId: '4' });
    await fixture.sendQrCodeEvent(
      {
        eventType: 'writeAiSymbol',
        data: { ai: 'Alie' },
      },
      '4',
    );

    // Reanimate!
    await fixture.useAbility({ id: 'reanimate', droneId: '3', qrCodeId: '4', targetCharacterId: '2' }, '1');

    {
      // Check patient state
      const { workModel } = await fixture.getCharacter('2');
      expect(workModel.healthState).equal('healthy');
      expect(workModel.essence).equal(460);
      expect(workModel.essenceDetails).deepEqual({ max: 500, gap: 40, used: 0 });
    }

    {
      // Check medic state
      const { workModel } = await fixture.getCharacter('1');
      expect(workModel.activeAbilities).containDeep([{ id: 'reanimate', cooldownUntil: 3600 * 1000 }]);
    }

    {
      // Check notifications
      expect(fixture.getPubSubNotifications()).containDeep([
        {
          topic: 'reanimates',
          body: {
            medic: '1',
            patient: '2',
            capsuleName: 'Reviver',
            essenceGet: 10,
            essenceAir: 30,
            ai: 'Alie',
          },
        },
      ]);
    }
  });
});
