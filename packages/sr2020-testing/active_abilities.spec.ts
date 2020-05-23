import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';
import { duration } from 'moment';

describe('Active abilities', function() {
  let fixture: TestFixture;

  beforeEach('setupApplication', async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('I will survive recovery', async () => {
    await fixture.saveCharacter({ magic: 10 });
    await fixture.saveLocation({ modelId: '7' });

    await fixture.addCharacterFeature('i-will-survive');

    await fixture.useAbility({ id: 'i-will-survive', location: { id: 7, manaLevel: 5 } });
    await fixture.sendCharacterEvent({ eventType: 'wound', data: {} });

    expect((await fixture.getCharacter()).workModel.healthState).equal('wounded');
    await fixture.advanceTime(duration(31, 'second'));
    expect((await fixture.getCharacter()).workModel.healthState).equal('healthy');
  });

  it('Silentium est aurum', async () => {
    await fixture.saveCharacter({ modelId: '1' }); // Ability user
    await fixture.saveCharacter({ modelId: '2' }); // Target
    const startingAura = (await fixture.getCharacter('2')).workModel.magicStats.aura;

    await fixture.addCharacterFeature('silentium-est-aurum', '1');
    await fixture.useAbility({ id: 'silentium-est-aurum', targetCharacterId: '2' }, '1');

    {
      const aura = (await fixture.getCharacter('2')).workModel.magicStats.aura;
      expect(aura.length).equal(startingAura.length);
      let sameCharacters = 0;
      for (let i = 0; i < aura.length; ++i) {
        expect(aura[i].match(/[a-z]/));
        if (aura[i] == startingAura[i]) sameCharacters++;
      }
      expect(sameCharacters).greaterThanOrEqual(aura.length * 0.8);
      expect(sameCharacters).lessThan(aura.length);
    }

    await fixture.advanceTime(duration(1, 'hour'));

    {
      const aura = (await fixture.getCharacter('2')).workModel.magicStats.aura;
      expect(aura).equal(startingAura);
    }
  });
});
