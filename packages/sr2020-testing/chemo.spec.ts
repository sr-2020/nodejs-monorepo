import { TestFixture } from './fixture';

import { duration } from 'moment';
import { kAllChemoEffects, kAllElements } from '@alice/sr2020-model-engine/scripts/character/chemo';
import { shouldBeConsumed } from '@alice/sr2020-model-engine/scripts/character/scan_qr';

describe('Chemo events', function () {
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
        expect(entry).toBeDefined();
      }
    }
  });

  it('All elements are present', () => {
    for (const effect of kAllChemoEffects) {
      expect(kAllElements.includes(effect.element)).toBe(true);
    }
  });

  it('Elements expiration', async () => {
    await fixture.saveCharacter();
    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'consumeChemo', data: { id: 'iodomarin' } });
      expect(workModel.chemo.concentration).toMatchObject({ argon: 0, iodine: 200, junius: 100, custodium: 100 });
    }

    await fixture.advanceTime(duration(30, 'minutes'));

    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'consumeChemo', data: { id: 'argo' } });
      expect(workModel.chemo.concentration).toMatchObject({ argon: 200, iodine: 300, junius: 200, custodium: 100 });
    }

    await fixture.advanceTime(duration(30, 'minutes'));

    {
      // It was just 30 minutes from the last iodine, junius and custodium intake, but 1h from the first - so they will be removed.
      // But argon must stay.
      const { workModel } = await fixture.getCharacter();
      expect(workModel.chemo.concentration).toMatchObject({ argon: 200, iodine: 0, junius: 0, custodium: 0 });
    }

    await fixture.advanceTime(duration(30, 'minutes'));

    {
      // Now argon also goes away.
      const { workModel } = await fixture.getCharacter();
      expect(workModel.chemo.concentration).toMatchObject({ argon: 0, iodine: 0, junius: 0, custodium: 0 });
    }
  });

  it('Multi opium', async () => {
    await fixture.saveCharacter();
    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'consumeChemo', data: { id: 'watson' } });
      expect(workModel.mentalAttackBonus).toBe(3);
    }

    await fixture.advanceTime(duration(15, 'minutes'));

    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'consumeChemo', data: { id: 'pam' } });
      expect(workModel.mentalAttackBonus).toBe(5);
    }

    await fixture.advanceTime(duration(15, 'minutes'));

    {
      const { workModel } = await fixture.getCharacter();
      expect(workModel.mentalAttackBonus).toBe(5);
    }

    await fixture.advanceTime(duration(15, 'minutes'));

    {
      const { workModel } = await fixture.getCharacter();
      expect(workModel.mentalAttackBonus).toBe(0);
    }
  });

  it('Chromium', async () => {
    await fixture.saveCharacter();
    await fixture.addCharacterFeature('i-dont-trust-anybody');
    {
      const { workModel } = await fixture.useAbility({ id: 'i-dont-trust-anybody' });
      expect(workModel.activeAbilities[0].cooldownUntil).toBe(40 * 60 * 1000);
    }
    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'consumeChemo', data: { id: 'aist' } });
      expect(workModel.activeAbilities[0].cooldownUntil).toBe(40 * 60 * 700);
    }
  });

  it('Custodium', async () => {
    await fixture.saveCharacter({ magic: 10 });
    await fixture.saveLocation();
    await fixture.addCharacterFeature('fireball');

    await fixture.sendCharacterEvent({
      eventType: 'castSpell',
      data: { id: 'fireball', power: 1, location: { manaLevel: 10, id: 0 } },
    });

    await fixture.sendCharacterEvent({ eventType: 'consumeChemo', data: { id: 'jack-p' } });
    await fixture.advanceTime(duration(62, 'minutes'));

    {
      const { workModel } = await fixture.getCharacter();
      expect(workModel.magic).toBe(10);
    }
  });

  it('Iconium', async () => {
    await fixture.saveCharacter();
    await fixture.sendCharacterEvent({ eventType: 'consumeChemo', data: { id: 'skrepa' } });

    expect((await fixture.getCharacter()).workModel.passiveAbilities).toContainEqual(
      expect.objectContaining({
        id: 'heavy-weapons-unlock',
        validUntil: 15 * 60 * 1000,
      }),
    );

    await fixture.advanceTime(duration(5, 'minutes'));

    expect((await fixture.getCharacter()).workModel.passiveAbilities).toContainEqual(
      expect.objectContaining({
        id: 'heavy-weapons-unlock',
        validUntil: 15 * 60 * 1000,
      }),
    );
  });

  it('Opium + Elba', async () => {
    await fixture.saveCharacter();
    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'consumeChemo', data: { id: 'watson' } });
      expect(workModel.mentalAttackBonus).toBe(3);
      expect(workModel.chemo.concentration).toMatchObject({ opium: 200, polonium: 100, argon: 80 });
    }

    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'consumeChemo', data: { id: 'activated-coal' } });
      expect(workModel.mentalAttackBonus).toBe(0);
      expect(workModel.chemo.concentration).toMatchObject({ opium: 0, polonium: 0, argon: 0, elba: 200, iconium: 0, moscovium: 0 });
    }
  });

  it('Addiction to silicon', async () => {
    await fixture.saveCharacter({ maxHp: 2, resonance: 3, body: 2, charisma: 4, intelligence: 5, magic: 1 });
    await fixture.sendCharacterEvent({ eventType: 'consumeChemo', data: { id: 'pam-p' } });
    await fixture.sendCharacterEvent({ eventType: 'consumeChemo', data: { id: 'pam-p' } });

    await fixture.advanceTime(duration(2, 'hours'));

    expect((await fixture.getCharacter()).workModel).toMatchObject({
      maxHp: 2,
      resonance: 2,
      body: 1,
      charisma: 3,
      intelligence: 4,
      magic: 0,
      healthState: 'healthy',
    });

    await fixture.advanceTime(duration(2, 'hours'));

    expect((await fixture.getCharacter()).workModel).toMatchObject({
      maxHp: 1,
      resonance: 2,
      body: 1,
      charisma: 3,
      intelligence: 4,
      magic: 0,
      healthState: 'healthy',
    });

    await fixture.advanceTime(duration(4, 'hours'));

    expect((await fixture.getCharacter()).workModel).toMatchObject({
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

    expect((await fixture.getCharacter()).workModel).toMatchObject({
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

      expect((await fixture.getCharacter()).workModel).toMatchObject({
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

  it('Good pills ability', async () => {
    await fixture.saveCharacter();
    await fixture.addCharacterFeature('good-pills');

    await fixture.saveQrCode(); // Charge
    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'iodomarin-p' } });

    const character = (await fixture.getCharacter()).workModel;
    const qr = (await fixture.getQrCode()).workModel;
    let used = 0;
    for (let i = 0; i < 100; ++i) {
      if (shouldBeConsumed(qr, character)) ++used;
    }

    expect(used).toBeLessThanOrEqual(80);
    expect(used).toBeGreaterThanOrEqual(60);
  });
});
