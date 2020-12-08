import { TestFixture } from './fixture';

import { duration } from 'moment';

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

  it.skip('Activating cyberdeck', async () => {
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
          id: 'jack-in',
          qrCode: {
            type: 'cyberdeck',
            data: {
              id: 'cyberdeck-chariot',
              modSlots: 4,
            },
          },
        },
      }),
    );

    await fixture.useAbility({ id: 'jack-out' });
    expect(fixture.getPubSubNotifications()).toContainEqual(
      expect.objectContaining({
        topic: 'ability_used',
        body: {
          id: 'jack-out',
        },
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
        bodyStorage: undefined,
        characterId: '0',
        drone: undefined,
        id: 'activate-soft',
        locus: undefined,
        name: 'Активация софта',
        pill: undefined,
        qrCode: {
          data: {
            basePrice: 0,
            charges: 1,
            dealId: '',
            description: 'ненадолго замедляет противника, блокируя его исходящий канал',
            gmDescription: '',
            id: 'soft-spambomb',
            kind: 'mine',
            lifestyle: '',
            name: 'спам бомба',
            ram: 2,
            rentPrice: 0,
          },
          description: 'ненадолго замедляет противника, блокируя его исходящий канал',
          eventType: '_',
          modelId: '0',

          name: 'спам бомба',
          type: 'software',
          usesLeft: 1,
        },
        qrCodeId: '0',
        targetCharacter: undefined,
        timestamp: 0,
      },
    });
  });
});
