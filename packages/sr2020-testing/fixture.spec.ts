import { TestFixture } from './fixture';

describe('Fixture', function () {
  let fixture: TestFixture;

  beforeEach(async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Ping', async () => {
    await fixture.client.get('/ping').expect(200);
  });

  it('Save and get location partial', async () => {
    await fixture.saveLocation({ aura: 'aaa' });
    const { workModel } = await fixture.getLocation();
    expect(workModel).toMatchObject({ aura: 'aaa' });
  });

  it('Send character event', async () => {
    await fixture.saveCharacter({ resonance: 12 });
    await fixture.sendCharacterEvent({ eventType: 'increase-resonance-spell', data: {} });
    expect(await fixture.getCharacter()).toMatchObject({ workModel: { resonance: 13 } });
    expect(fixture.getCharacterNotifications().length).toBe(1);
  });

  it('Consume QR code', async () => {
    await fixture.saveQrCode({ usesLeft: 5, type: 'event' });
    await fixture.sendQrCodeEvent({
      eventType: 'consume',
      data: { id: '0' },
    });
    expect(await fixture.getQrCode()).toMatchObject({ workModel: { usesLeft: 4, type: 'event' } });
  });

  it('Completely consume QR code', async () => {
    await fixture.saveQrCode({ usesLeft: 1, type: 'event' });
    await fixture.sendQrCodeEvent({
      eventType: 'consume',
      data: {},
    });
    expect(await fixture.getQrCode()).toMatchObject({ workModel: { usesLeft: 0, type: 'empty' } });
  });

  it('QR codes with events', async () => {
    await fixture.saveCharacter({ resonance: 10 });
    await fixture.saveQrCode({ usesLeft: 5, type: 'event', eventType: 'increase-resonance-spell', data: {} });
    await fixture.sendCharacterEvent({
      eventType: 'scan-qr',
      data: { qrCode: '0' },
    });
    expect(await fixture.getQrCode()).toMatchObject({ workModel: { usesLeft: 4, type: 'event' } });
    expect(await fixture.getCharacter()).toMatchObject({ workModel: { resonance: 11 } });
  });
});
