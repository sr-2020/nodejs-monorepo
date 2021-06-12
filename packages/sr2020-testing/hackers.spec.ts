import { TestFixture } from './fixture';

import { duration } from 'moment';
import { CyberDeckQrData, typedQrData } from '@alice/sr2020-model-engine/scripts/qr/datatypes';

describe('Hackers-related events', function () {
  let fixture: TestFixture;

  beforeEach(async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it.skip('Dump shock reduces resonance', async () => {
    await fixture.saveCharacter({ resonance: 5 });
    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'dumpshock', data: {} });
      expect(workModel.resonance).toBe(4);
    }
    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'dumpshock', data: {} });
      expect(workModel.resonance).toBe(3);
    }
  });

  it.skip('Dump shock versus dumpty humpty', async () => {
    await fixture.saveCharacter({ modelId: '1', resonance: 5 }); // Hacker
    await fixture.saveCharacter({ modelId: '2', magic: 10 }); // Caster
    await fixture.saveLocation(); // Needed by spell
    await fixture.addCharacterFeature('dumpty-humpty', '2');

    const castEvent = {
      eventType: 'castSpell',
      data: { id: 'dumpty-humpty', targetCharacterId: '1', power: 1, location: { id: 0, manaLevel: 0 } },
    };
    await fixture.sendCharacterEvent(castEvent, '2');

    expect((await fixture.getCharacter('1')).workModel.resonance).toBe(5); // No increase
    await fixture.advanceTime(duration(1, 'hour'));
    expect((await fixture.getCharacter('1')).workModel.resonance).toBe(5); // No decrease either

    await fixture.sendCharacterEvent({ eventType: 'dumpshock', data: {} }, '1');
    expect((await fixture.getCharacter('1')).workModel.resonance).toBe(4); // Damaged by dumpshock

    await fixture.sendCharacterEvent(castEvent, '2');
    expect((await fixture.getCharacter('1')).workModel.resonance).toBe(5); // Healed a bit

    await fixture.sendCharacterEvent(castEvent, '2');
    expect((await fixture.getCharacter('1')).workModel.resonance).toBe(5); // Not more!

    await fixture.advanceTime(duration(10, 'minutes'));
    expect((await fixture.getCharacter('1')).workModel.resonance).toBe(4); // Only temporary :(
  });

  it('Activating cyberdeck', async () => {
    // Hacker set up
    await fixture.saveCharacter();
    await fixture.addCharacterFeature('jack-in');
    await fixture.addCharacterFeature('jack-out');

    // Cyberdeck set up
    await fixture.saveQrCode();
    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'cyberdeck-chariot' } }, '0');

    // Jack in to the deck
    await fixture.useAbility({ id: 'jack-in', qrCodeId: '0' });

    expect(fixture.getPubSubNotifications()).toContainEqual(
      expect.objectContaining({
        topic: 'ability_used',
        body: {
          characterId: '0',
          id: 'jack-in',
          name: 'Jack-in',
          qrCode: expect.objectContaining({
            data: expect.objectContaining({
              id: 'cyberdeck-chariot',
              modSlots: 3,
            }),
            type: 'cyberdeck',
          }),
          qrCodeId: '0',
          timestamp: 0,
        },
      }),
    );

    await fixture.useAbility({ id: 'jack-out' });
    expect(fixture.getPubSubNotifications()).toContainEqual(
      expect.objectContaining({
        topic: 'ability_used',
        body: expect.objectContaining({
          id: 'jack-out',
        }),
      }),
    );
  });

  it('Activating software', async () => {
    // Hacker set up
    await fixture.saveCharacter();
    await fixture.addCharacterFeature('activate-soft');

    // Soft set up
    await fixture.saveQrCode();
    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'soft-spambomb' } }, '0');

    // Activate soft
    await fixture.useAbility({ id: 'activate-soft', qrCodeId: '0' });

    expect(fixture.getPubSubNotifications()).toContainEqual({
      topic: 'ability_used',
      body: {
        characterId: '0',
        id: 'activate-soft',
        name: 'Активация софта',
        qrCode: expect.objectContaining({
          data: expect.objectContaining({
            id: 'soft-spambomb',
          }),
          type: 'software',
        }),
        qrCodeId: '0',
        timestamp: 0,
      },
    });
  });

  it('Breaking cyberdeck', async () => {
    // Hacker set up
    await fixture.saveCharacter();
    await fixture.addCharacterFeature('jack-in');

    // Cyberdeck set up
    await fixture.saveQrCode({ modelId: '2' });
    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'cyberdeck-navigator' } }, '2');

    {
      // Break cyberdeck
      const { workModel } = await fixture.sendQrCodeEvent({ eventType: 'breakCyberDeck', data: {} }, '2');
      expect(workModel.type).toBe('cyberdeck');
      expect(typedQrData<CyberDeckQrData>(workModel).broken).toBe(true);
      expect(workModel.name).toContain('(сломана)');
    }

    // Try (and fail) to jack in
    await fixture.sendCharacterEventExpectingError({ eventType: 'useAbility', data: { id: 'jack-in', qrCodeId: '2' } });
  });
});
