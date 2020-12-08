import { TestFixture } from './fixture';

import { DroneQrData, MagicFocusQrData, typedQrData } from '@alice/sr2020-model-engine/scripts/qr/datatypes';

describe('Merchandise', () => {
  let fixture: TestFixture;

  beforeEach(async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it.skip('Food creation and consumption', async () => {
    await fixture.saveCharacter({ modelId: '1' });
    await fixture.saveQrCode({ modelId: '3' });

    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'food', additionalData: { scoring: 0.5 } } }, 3);
    await fixture.sendCharacterEvent({ eventType: 'scanQr', data: { qrCode: '3' } }, 1);

    expect(fixture.getPubSubNotifications()).toContainEqual(
      expect.objectContaining({
        topic: 'food_consumption',
        body: {
          characterId: 1,
          scoring: 0.5,
          id: 'food',
        },
      }),
    );
  });

  it('Drone creation', async () => {
    await fixture.saveQrCode();

    const { baseModel } = await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'hippocrates' } });
    const droneData = typedQrData<DroneQrData>(baseModel);
    expect(baseModel.name).toBe('Гиппократ');
    expect(droneData.id).toBe('hippocrates');
    expect(droneData.modSlots).toBeDefined();
    expect(droneData.moddingCapacity).toBeDefined();
    expect(droneData.type).toBeDefined();
    expect(droneData.sensor).toBeGreaterThan(0);
    expect(droneData.hitpoints).toBeGreaterThan(0);
    expect(droneData.passiveAbilities).toHaveLength(1);
    expect(droneData.activeAbilities).toHaveLength(6);
  });

  it('Focus creation', async () => {
    await fixture.saveQrCode();

    const { baseModel } = await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'first-warmth' } });
    const focusData = typedQrData<MagicFocusQrData>(baseModel);
    expect(baseModel.name).toBe('Первое тепло - фокус сферы лечения');
    expect(focusData.id).toBe('first-warmth');
    expect(focusData.sphere).toBe('healing');
    expect(focusData.amount).toBe(3);
  });
});
