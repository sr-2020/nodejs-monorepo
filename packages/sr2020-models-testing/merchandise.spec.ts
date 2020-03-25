import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';

describe('Merchandise', () => {
  let fixture: TestFixture;

  beforeEach('setupApplication', async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Food creation and consumption', async () => {
    await fixture.saveCharacter({ modelId: '1' });
    await fixture.saveQrCode({ modelId: '3' });

    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'food', additionalData: { scoring: 0.5 } } }, 3);
    await fixture.sendCharacterEvent({ eventType: 'scanQr', data: { qrCode: 3 } }, 1);

    expect(fixture.getPubSubNotifications()).to.containDeep([
      {
        topic: 'food_consumption',
        body: {
          characterId: 1,
          scoring: 0.5,
          id: 'food',
        },
      },
    ]);
  });

  it('Implant installation and removal', async () => {
    await fixture.saveCharacter({ modelId: '1' });
    await fixture.saveQrCode({ modelId: '3' });

    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'rcc-beta' } }, 3);
    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'scanQr', data: { qrCode: 3 } }, 1);
      expect(workModel.implants.length).to.equal(1);
      expect(workModel.drones.maxDifficulty).to.equal(8);
    }
    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'removeImplant', data: { id: 'rcc-beta' } }, 1);
      expect(workModel.implants.length).to.equal(0);
      expect(workModel.drones.maxDifficulty).to.equal(-1000);
    }
  });
});
