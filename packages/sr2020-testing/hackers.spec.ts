import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';
import { duration } from 'moment';

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
      expect(workModel.resonance).equal(4);
    }
    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'dumpshock', data: {} });
      expect(workModel.resonance).equal(3);
    }
  });

  it('Dump shock versus dumpty humpty', async () => {
    await fixture.saveCharacter({ modelId: '1', resonance: 5 }); // Hacker
    await fixture.saveCharacter({ modelId: '2', magic: 10 }); // Caster
    await fixture.saveLocation(); // Needed by spell
    await fixture.addCharacterFeature('dumpty-humpty', '2');

    const castEvent = {
      eventType: 'castSpell',
      data: { id: 'dumpty-humpty', targetCharacterId: '1', power: 1, location: { id: 0, manaLevel: 0 } },
    };
    await fixture.sendCharacterEvent(castEvent, '2');

    expect((await fixture.getCharacter('1')).workModel.resonance).to.equal(5); // No increase
    await fixture.advanceTime(duration(1, 'hour'));
    expect((await fixture.getCharacter('1')).workModel.resonance).to.equal(5); // No decrease either

    await fixture.sendCharacterEvent({ eventType: 'dumpshock', data: {} }, '1');
    expect((await fixture.getCharacter('1')).workModel.resonance).to.equal(4); // Damaged by dumpshock

    await fixture.sendCharacterEvent(castEvent, '2');
    expect((await fixture.getCharacter('1')).workModel.resonance).to.equal(5); // Healed a bit

    await fixture.sendCharacterEvent(castEvent, '2');
    expect((await fixture.getCharacter('1')).workModel.resonance).to.equal(5); // Not more!

    await fixture.advanceTime(duration(10, 'minutes'));
    expect((await fixture.getCharacter('1')).workModel.resonance).to.equal(4); // Only temporary :(
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
  });
});
