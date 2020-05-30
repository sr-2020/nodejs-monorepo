import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';
import { duration } from 'moment';
import { kAllChemoEffects, kAllElements } from '@sr2020/sr2020-model-engine/scripts/character/chemo';

describe('Chemo events', function() {
  let fixture: TestFixture;

  beforeEach(async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('All effects are present', () => {
    for (const element of kAllElements) {
      for (const level of ['base', 'super', 'uber', 'crysis']) {
        const entry = kAllChemoEffects.find((it) => it.level == level && it.element == element);
        expect(entry).not.undefined();
      }
    }
  });

  it('All elements are present', () => {
    for (const effect of kAllChemoEffects) {
      expect(kAllElements.includes(effect.element)).to.be.true();
    }
  });

  it('Elements expiration', async () => {
    await fixture.saveCharacter();
    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'consumeChemo', data: { id: 'iodomarin' } });
      expect(workModel.chemo.concentration).to.containDeep({ argon: 0, iodine: 200, junius: 100, custodium: 100 });
    }

    await fixture.advanceTime(duration(30, 'minutes'));

    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'consumeChemo', data: { id: 'argo' } });
      expect(workModel.chemo.concentration).to.containDeep({ argon: 200, iodine: 300, junius: 200, custodium: 100 });
    }

    await fixture.advanceTime(duration(30, 'minutes'));

    {
      // It was just 30 minutes from the last iodine, junius and custodium intake, but 1h from the first - so they will be removed.
      // But argon must stay.
      const { workModel } = await fixture.getCharacter();
      expect(workModel.chemo.concentration).to.containDeep({ argon: 200, iodine: 0, junius: 0, custodium: 0 });
    }

    await fixture.advanceTime(duration(30, 'minutes'));

    {
      // Now argon also goes away.
      const { workModel } = await fixture.getCharacter();
      expect(workModel.chemo.concentration).to.containDeep({ argon: 0, iodine: 0, junius: 0, custodium: 0 });
    }
  });

  it('Multi opium', async () => {
    await fixture.saveCharacter();
    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'consumeChemo', data: { id: 'watson' } });
      expect(workModel.mentalAttackBonus).to.equal(3);
    }

    await fixture.advanceTime(duration(15, 'minutes'));

    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'consumeChemo', data: { id: 'pam' } });
      expect(workModel.mentalAttackBonus).to.equal(5);
    }

    await fixture.advanceTime(duration(15, 'minutes'));

    {
      const { workModel } = await fixture.getCharacter();
      expect(workModel.mentalAttackBonus).to.equal(5);
    }

    await fixture.advanceTime(duration(15, 'minutes'));

    {
      const { workModel } = await fixture.getCharacter();
      expect(workModel.mentalAttackBonus).to.equal(0);
    }
  });

  it('Chromium', async () => {
    await fixture.saveCharacter();
    await fixture.addCharacterFeature('i-dont-trust-anybody');
    {
      const { workModel } = await fixture.useAbility({ id: 'i-dont-trust-anybody' });
      expect(workModel.activeAbilities[0].cooldownUntil).to.equal(3600 * 1000);
    }
    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'consumeChemo', data: { id: 'aist' } });
      expect(workModel.activeAbilities[0].cooldownUntil).to.equal(3600 * 700);
    }
  });

  it('Custodium', async () => {
    await fixture.saveCharacter({ magic: 10 });
    await fixture.saveLocation();
    await fixture.addCharacterFeature('fireball');
    {
      const { workModel } = await fixture.sendCharacterEvent({
        eventType: 'castSpell',
        data: { id: 'fireball', power: 1, location: { manaLevel: 10, id: 0 } },
      });
      expect(workModel.magic).to.equal(-2);
    }

    await fixture.sendCharacterEvent({ eventType: 'consumeChemo', data: { id: 'jack-p' } });
    await fixture.advanceTime(duration(62, 'minutes'));

    {
      const { workModel } = await fixture.getCharacter();
      expect(workModel.magic).to.equal(10);
    }
  });

  it('Iconium', async () => {
    await fixture.saveCharacter();
    await fixture.sendCharacterEvent({ eventType: 'consumeChemo', data: { id: 'skrepa' } });

    expect((await fixture.getCharacter()).workModel.passiveAbilities).containDeep([
      {
        id: 'heavy-weapons-chemo',
        validUntil: 15 * 60 * 1000,
      },
    ]);

    await fixture.advanceTime(duration(5, 'minutes'));

    expect((await fixture.getCharacter()).workModel.passiveAbilities).containDeep([
      {
        id: 'heavy-weapons-chemo',
        validUntil: 15 * 60 * 1000,
      },
    ]);
  });

  it('Opium + Elba', async () => {
    await fixture.saveCharacter();
    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'consumeChemo', data: { id: 'watson' } });
      expect(workModel.mentalAttackBonus).to.equal(3);
      expect(workModel.chemo.concentration).to.containDeep({ opium: 200, polonium: 100, argon: 80 });
    }

    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'consumeChemo', data: { id: 'activated-coal' } });
      expect(workModel.mentalAttackBonus).to.equal(0);
      expect(workModel.chemo.concentration).to.containDeep({ opium: 0, polonium: 0, argon: 0, elba: 200, iconium: 0, moscovium: 0 });
    }
  });

  it('Addiction to silicon', async () => {
    await fixture.saveCharacter({ maxHp: 2, resonance: 3, body: 2, charisma: 4, intelligence: 5, magic: 1 });
    await fixture.sendCharacterEvent({ eventType: 'consumeChemo', data: { id: 'pam-p' } });
    await fixture.sendCharacterEvent({ eventType: 'consumeChemo', data: { id: 'pam-p' } });

    await fixture.advanceTime(duration(2, 'hours'));

    expect((await fixture.getCharacter()).workModel).containDeep({
      maxHp: 2,
      resonance: 2,
      body: 1,
      charisma: 3,
      intelligence: 4,
      magic: 0,
      healthState: 'healthy',
    });

    await fixture.advanceTime(duration(2, 'hours'));

    expect((await fixture.getCharacter()).workModel).containDeep({
      maxHp: 1,
      resonance: 2,
      body: 1,
      charisma: 3,
      intelligence: 4,
      magic: 0,
      healthState: 'healthy',
    });

    await fixture.advanceTime(duration(4, 'hours'));

    expect((await fixture.getCharacter()).workModel).containDeep({
      maxHp: 1,
      resonance: 2,
      body: 1,
      charisma: 3,
      intelligence: 4,
      magic: 0,
      healthState: 'clinically_dead',
    });
  });

  it('Dropping to 0 max hp', async () => {
    await fixture.saveCharacter({ maxHp: 1 });
    await fixture.sendCharacterEvent({ eventType: 'consumeChemo', data: { id: 'pam-p' } });
    await fixture.sendCharacterEvent({ eventType: 'consumeChemo', data: { id: 'pam-p' } });

    await fixture.advanceTime(duration(4, 'hours'));

    expect((await fixture.getCharacter()).workModel).containDeep({
      maxHp: 0,
      healthState: 'clinically_dead',
    });
  });

  it('Addiction to silicon cured by elba', async () => {
    await fixture.saveCharacter({ maxHp: 2, resonance: 3, body: 2, charisma: 4, intelligence: 5, magic: 1 });
    await fixture.sendCharacterEvent({ eventType: 'consumeChemo', data: { id: 'pam-p' } });
    await fixture.sendCharacterEvent({ eventType: 'consumeChemo', data: { id: 'pam-p' } });
    await fixture.sendCharacterEvent({ eventType: 'consumeChemo', data: { id: 'coal-p' } });
    await fixture.sendCharacterEvent({ eventType: 'consumeChemo', data: { id: 'preper' } });

    for (let i = 0; i < 10; ++i) {
      await fixture.advanceTime(duration(1, 'hour'));
      // We are advancing time by 10 hours total here. Need to feed the character to prevent from being wounded
      await fixture.sendCharacterEvent({ eventType: 'consumeFood', data: { id: 'food' } });

      expect((await fixture.getCharacter()).workModel).containDeep({
        maxHp: 2,
        resonance: 3,
        body: 2,
        charisma: 4,
        intelligence: 5,
        magic: 1,
        healthState: 'healthy',
      });
    }
  });
});
