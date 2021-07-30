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

  it('Dump shock reduces resonance', async () => {
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

  it('Dump shock versus dumpty humpty', async () => {
    await fixture.saveCharacter({ modelId: '1', resonance: 5, intelligence: 3 }); // Hacker
    await fixture.saveCharacter({ modelId: '2', magic: 10 }); // Caster
    await fixture.saveLocation(); // Needed by spell
    await fixture.addCharacterFeature('dumpty-humpty', '2');

    const weakCastEvent = {
      eventType: 'castSpell',
      data: { id: 'dumpty-humpty', targetCharacterId: '1', power: 3, location: { id: 0, manaLevel: 10 } },
    };

    const strongCastEvent = {
      eventType: 'castSpell',
      data: { id: 'dumpty-humpty', targetCharacterId: '1', power: 4, location: { id: 0, manaLevel: 10 } },
    };

    await fixture.sendCharacterEvent(weakCastEvent, '2');

    expect((await fixture.getCharacter('1')).workModel.resonance).toBe(5); // No increase
    await fixture.advanceTime(duration(1, 'hour'));
    expect((await fixture.getCharacter('1')).workModel.resonance).toBe(5); // No decrease either

    await fixture.sendCharacterEvent({ eventType: 'dumpshock', data: {} }, '1');
    await fixture.sendCharacterEvent({ eventType: 'dumpshock', data: {} }, '1');
    await fixture.sendCharacterEvent({ eventType: 'dumpshock', data: {} }, '1');
    expect((await fixture.getCharacter('1')).workModel.resonance).toBe(2); // Damaged by dumpshock
    expect((await fixture.getCharacter('1')).workModel.intelligence).toBe(3); // Damaged by dumpshock

    await fixture.sendCharacterEvent(weakCastEvent, '2');
    expect((await fixture.getCharacter('1')).workModel.resonance).toBe(3); // Healed a bit
    expect((await fixture.getCharacter('1')).workModel.intelligence).toBe(3); // Healed a bit

    await fixture.sendCharacterEvent(strongCastEvent, '2');
    expect((await fixture.getCharacter('1')).workModel.resonance).toBe(5); // Not more!
    expect((await fixture.getCharacter('1')).workModel.intelligence).toBe(3); // Not more!

    await fixture.advanceTime(duration(10, 'hours'));
    expect((await fixture.getCharacter('1')).workModel.resonance).toBe(5);
    expect((await fixture.getCharacter('1')).workModel.intelligence).toBe(3);
  });

  it('Activating cyberdeck', async () => {
    // Hacker set up
    await fixture.saveCharacter();
    await fixture.addCharacterFeature('jack-in');

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
          aura: expect.stringContaining(''),
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

    {
      const { workModel } = await fixture.getQrCode('0');
      expect(typedQrData<CyberDeckQrData>(workModel).inUse).toBe(true);
    }

    await fixture.useAbility({ id: 'jack-out' });
    expect(fixture.getPubSubNotifications()).toContainEqual(
      expect.objectContaining({
        topic: 'ability_used',
        body: expect.objectContaining({
          id: 'jack-out',
        }),
      }),
    );

    {
      const { workModel } = await fixture.getQrCode('0');
      expect(typedQrData<CyberDeckQrData>(workModel).inUse).toBe(false);
    }
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
        aura: expect.stringContaining(''),
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
