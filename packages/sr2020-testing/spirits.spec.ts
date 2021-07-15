import { TestFixture } from './fixture';
import { Spirit } from '@alice/sr2020-model-engine/scripts/qr/spirits_library';
import { SpiritJarQrData, typedQrData } from '@alice/sr2020-model-engine/scripts/qr/datatypes';

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
});
