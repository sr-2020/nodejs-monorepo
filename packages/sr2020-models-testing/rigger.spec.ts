import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';

describe('Rigger abilities', () => {
  let fixture: TestFixture;

  beforeEach('setupApplication', async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
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
      // TODO(https://trello.com/c/bMqcwbvv/280-сделать-параметр-персонажа-эссенс): Implement
      expect(workModel.analyzedBody?.essence).to.equal(666);
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
    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'rcc-beta' } }, 3);
    {
      const { workModel } = await fixture.sendCharacterEvent(
        { eventType: 'riggerInstallImplant', data: { targetCharacterId: '1', qrCode: 3 } },
        2,
      );
      const patientWorkModel = (await fixture.getCharacter(1)).workModel;
      const qrWorkModel = (await fixture.getQrCode(3)).workModel;
      expect(qrWorkModel.type).to.equal('empty');
      expect(workModel.analyzedBody).to.containDeep({
        implants: [
          {
            id: 'rcc-beta',
          },
        ],
      });
      expect(patientWorkModel).to.containDeep({
        implants: [
          {
            id: 'rcc-beta',
          },
        ],
      });
    }
    {
      const { workModel } = await fixture.sendCharacterEvent(
        { eventType: 'riggerUninstallImplant', data: { targetCharacterId: '1', qrCode: 3, implantId: 'rcc-beta' } },
        2,
      );
      const patientWorkModel = (await fixture.getCharacter(1)).workModel;
      const qrWorkModel = (await fixture.getQrCode(3)).workModel;
      expect(qrWorkModel).to.containDeep({ type: 'merchandise', usesLeft: 1, data: { id: 'rcc-beta' } });
      expect(workModel.analyzedBody?.implants.length).to.equal(0);
      expect(patientWorkModel.implants.length).to.equal(0);
    }
  });
});
