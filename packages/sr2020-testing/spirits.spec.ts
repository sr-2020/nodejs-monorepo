import { TestFixture } from './fixture';
import { Spirit } from '@alice/sr2020-model-engine/scripts/qr/spirits_library';
import { kSpiritTimerIds } from '@alice/sr2020-model-engine/scripts/character/spirits';
import { SpiritJarQrData, typedQrData } from '@alice/sr2020-model-engine/scripts/qr/datatypes';
import { duration } from 'moment';

describe('Spirits-related abilities', () => {
  let fixture: TestFixture;

  beforeEach(async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Put spirit in jar and free it', async () => {
    await fixture.saveQrCode();
    {
      const { workModel } = await fixture.sendQrCodeEvent({ eventType: 'writeSpiritJar', data: {} });
      expect(workModel.type).toEqual('spirit_jar');
      expect(typedQrData<SpiritJarQrData>(workModel)).toEqual({});
    }
    {
      const { workModel } = await fixture.sendQrCodeEvent({ eventType: 'putSpiritInJar', data: { spiritId: 'Petya' } });
      expect(typedQrData<SpiritJarQrData>(workModel)).toEqual({ spiritId: 'Petya', emptiness_reason: undefined });
    }
    {
      const { workModel } = await fixture.sendQrCodeEvent({ eventType: 'freeSpirit', data: { reason: 'Stuff' } });
      expect(typedQrData<SpiritJarQrData>(workModel)).toEqual({ spiritId: undefined, emptiness_reason: 'Stuff' });
    }
  });

  it('Enter and leave spirit - 2', async () => {
    await fixture.saveQrCode({ modelId: '1' });
    await fixture.sendQrCodeEvent({ eventType: 'writeSpiritJar', data: {} }, '1');
    await fixture.sendQrCodeEvent({ eventType: 'putSpiritInJar', data: { spiritId: 'xyz' } }, '1');

    await fixture.saveQrCode({ modelId: '2' });
    await fixture.sendQrCodeEvent({ eventType: 'writeBodyStorage', data: { name: '' } }, '2');

    await fixture.saveCharacter({ maxHp: 2, name: 'Tester' });

    {
      const { workModel } = await fixture.sendCharacterEvent({
        eventType: 'suitSpirit',
        data: { name: 'Petya', hp: 6, abilityIds: [], qrCodeId: '1', bodyStorageId: '2' },
      });

      expect(workModel.currentBody).toEqual('ectoplasm');
      expect(workModel.maxHp).toEqual(6);
      expect(workModel.name).toEqual('Petya');

      const bodyStorage = await fixture.getQrCode('2');
      expect(bodyStorage.workModel.data).toEqual({
        body: { characterId: '0', type: 'physical', metarace: 'meta-norm', name: 'Tester' },
      });

      const spiritStorage = await fixture.getQrCode('1');
      expect(spiritStorage.workModel.data).toEqual({ emptiness_reason: 'Дух используется.' });
    }

    {
      const { workModel } = await fixture.sendCharacterEvent({
        eventType: 'dispirit',
        data: { qrCodeId: '1', bodyStorageId: '2' },
      });

      expect(workModel.currentBody).toEqual('physical');
      expect(workModel.maxHp).toEqual(2);
      expect(workModel.name).toEqual('Tester');

      const bodyStorage = await fixture.getQrCode('2');
      expect(bodyStorage.workModel.data).toEqual({ body: undefined });

      const spiritStorage = await fixture.getQrCode('1');
      expect(spiritStorage.workModel.data).toEqual({ spiritId: 'xyz' });
    }
  });

  it('Enter spirit and get declassified in it (due to overtime or fight loss)', async () => {
    await fixture.saveQrCode({ modelId: '135' });
    await fixture.sendQrCodeEvent({ eventType: 'writeSpiritJar', data: {} }, '135');
    await fixture.sendQrCodeEvent({ eventType: 'putSpiritInJar', data: { spiritId: '357' } }, '135');

    await fixture.saveQrCode({ modelId: '246' });
    await fixture.sendQrCodeEvent({ eventType: 'writeBodyStorage', data: { name: 'testBodyStorage1' } }, '246');

    await fixture.saveCharacter({ maxHp: 2, name: 'testMage1' });
    await fixture.addCharacterFeature('ground-heal-ability');

    {
      const { workModel } = await fixture.getCharacter();
      //mage has its own active ability
      expect(workModel.activeAbilities).toContainEqual(
        expect.objectContaining({
          id: 'ground-heal-ability',
        }),
      );

      //mage hasn't spirit active ability yet
      expect(workModel.activeAbilities).not.toContainEqual(
        expect.objectContaining({
          id: 'undiena',
        }),
      );
    }

    {
      const { workModel } = await fixture.sendCharacterEvent({
        eventType: 'suitSpirit',
        data: { name: 'TestSpirit1', hp: 6, abilityIds: ['undiena'], qrCodeId: '135', bodyStorageId: '246' },
      });

      expect(workModel.currentBody).toEqual('ectoplasm');

      //mage in spirit now has spirit active ability and lacks his own
      expect(workModel.activeAbilities).not.toContainEqual(
        expect.objectContaining({
          id: 'ground-heal-ability',
        }),
      );
      expect(workModel.activeAbilities).toContainEqual(
        expect.objectContaining({
          id: 'undiena',
        }),
      );
    }

    {
      await fixture.sendCharacterEvent({
        eventType: 'zeroSpiritAbilities',
        data: {},
      });
      const { workModel } = await fixture.getCharacter();

      expect(workModel.currentBody).toEqual('ectoplasm');

      //mage in spirit looses spirit ability after overtime1 in spirit
      expect(workModel.activeAbilities).not.toContainEqual(
        expect.objectContaining({
          id: 'undiena',
        }),
      );

      expect(workModel.history[0].shortText).toBe(
        'Вам нужно срочно вернуться в мясное тело, иначе через 10 минут наступит клиническая смерть',
      );
      expect(fixture.getCharacterNotifications()[0].body).toContain(
        'Вам нужно срочно вернуться в мясное тело, иначе через 10 минут наступит клиническая смерть',
      );

      //mage gets timer per overtime2 in spirit leading to clinDeath
      expect(workModel.timers).toContainEqual(
        expect.objectContaining({
          name: kSpiritTimerIds[3],
        }),
      );
    }
  });
});
