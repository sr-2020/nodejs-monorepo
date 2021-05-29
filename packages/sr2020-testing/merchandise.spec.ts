import { TestFixture } from './fixture';

import { DroneQrData, MagicFocusQrData, typedQrData } from '@alice/sr2020-model-engine/scripts/qr/datatypes';
import { MerchandiseRewrittableData } from '@alice/sr2020-model-engine/scripts/qr/merchandise';

describe('Merchandise', () => {
  let fixture: TestFixture;

  beforeEach(async () => {
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

    expect(fixture.getPubSubNotifications()).toContainEqual(
      expect.objectContaining({
        topic: 'food_consumption',
        body: expect.objectContaining({
          characterId: 1,
          scoring: 0.5,
          id: 'food',
        }),
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

  it('Merchandise data rewrite', async () => {
    await fixture.saveQrCode();

    await fixture.sendQrCodeEvent({
      eventType: 'createMerchandise',
      data: { id: 'first-warmth', basePrice: 10, rentPrice: 20, dealId: 'xyz', lifestyle: 'Gold', gmDescription: 'Something' },
    });

    const { baseModel } = await fixture.sendQrCodeEvent({
      eventType: 'updateMerchandise',
      data: { rentPrice: 30, dealId: 'abc', lifestyle: 'Gold', gmDescription: '' },
    });

    const data = baseModel.data as MerchandiseRewrittableData;
    expect(data.basePrice).toEqual(10);
    expect(data.rentPrice).toEqual(30);
    expect(data.dealId).toEqual('abc');
    expect(data.lifestyle).toEqual('Gold');
    expect(data.gmDescription).toEqual('');
  });
});
