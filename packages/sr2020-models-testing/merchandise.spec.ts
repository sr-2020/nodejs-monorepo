import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';
import { DroneQrData, typedQrData } from '@sr2020/sr2020-models/scripts/qr/datatypes';

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
    await fixture.sendCharacterEvent({ eventType: 'scanQr', data: { qrCode: '3' } }, 1);

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

  it('Drone creation', async () => {
    await fixture.saveQrCode();

    const { baseModel } = await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'hippocrates' } });
    const droneData = typedQrData<DroneQrData>(baseModel);
    expect(baseModel.name).to.equal('Гиппократ');
    expect(droneData.id).to.equal('hippocrates');
    expect(droneData.modSlots).not.undefined();
    expect(droneData.moddingCapacity).not.undefined();
    expect(droneData.requiredSkill).not.undefined();
    expect(droneData.sensor).greaterThan(0);
    expect(droneData.hitpoints).greaterThan(0);
    expect(droneData.passiveAbilities).lengthOf(1);
    expect(droneData.activeAbilities).lengthOf(4);
  });
});
