import { TestFixture } from './fixture';

import { duration } from 'moment';
import { calculateMagicFeedback } from '@alice/sr2020-model-engine/scripts/character/spells';
import { HealthState } from '@alice/sr2020-common/models/sr2020-character.model';
import { addTemporaryPassiveAbility } from '@alice/sr2020-model-engine/scripts/character/features';

describe('Spells', function () {
  let fixture: TestFixture;

  beforeEach(async () => {
    fixture = await TestFixture.create();
    await fixture.saveLocation();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Learn and forget increase ground heal spell', async () => {
    await fixture.saveCharacter();
    {
      const { workModel } = await fixture.addCharacterFeature('ground-heal');
      expect(workModel).toMatchObject({ spells: [{ id: 'ground-heal' }] });
    }

    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'removeFeature', data: { id: 'ground-heal' } });
      expect(workModel.spells).toHaveLength(0);
    }
  });

  it('Forget unlearned spell', async () => {
    await fixture.saveCharacter();
    const { workModel } = await fixture.sendCharacterEvent({ eventType: 'removeFeature', data: { spellName: 'ground-heal' } });
    expect(workModel.spells).toHaveLength(0);
  });

  it('Forget all spells', async () => {
    await fixture.saveCharacter();
    await fixture.addCharacterFeature('ground-heal');
    const { workModel } = await fixture.sendCharacterEvent({ eventType: 'forgetAllSpells', data: {} });
    expect(workModel.spells).toHaveLength(0);
  });

  it('Cast increase resonance spell', async () => {
    await fixture.saveCharacter({ resonance: 7 });
    await fixture.addCharacterFeature('ground-heal');
    const { workModel } = await fixture.sendCharacterEvent({ eventType: 'increaseResonanceSpell', data: {} });
    expect(workModel).toMatchObject({ resonance: 8 });
    expect(fixture.getCharacterNotifications().length).toBe(1);
  });

  it("Can't enchant already enchanted", async () => {
    await fixture.saveCharacter();
    await fixture.saveQrCode({ type: 'food' });

    const message = await fixture.sendCharacterEventExpectingError({ eventType: 'increaseResonanceSpell', data: { qrCode: '0' } });
    expect(message).toContain('уже записан');
    expect(fixture.getCharacterNotifications()).toHaveLength(0);

    expect(await fixture.getQrCode()).toMatchObject({ workModel: { type: 'food' } });
  });

  it('Enchant artifact and activate it later', async () => {
    await fixture.saveCharacter({ resonance: 0 });
    await fixture.saveQrCode();
    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'increaseResonanceSpell', data: { qrCode: 0 } });
      expect(workModel).toMatchObject({ resonance: 0 });
      expect(await fixture.getQrCode()).toMatchObject({ workModel: { usesLeft: 3 } });
    }
    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'scanQr', data: { qrCode: '0' } });
      expect(workModel).toMatchObject({ resonance: 1 });
      expect(await fixture.getQrCode()).toMatchObject({ workModel: { usesLeft: 2 } });
    }
  });

  it('Ground Heal used', async () => {
    await fixture.saveCharacter({ modelId: '1', magic: 10 });
    await fixture.saveCharacter({ modelId: '2', healthState: 'wounded' });
    await fixture.addCharacterFeature('ground-heal', 1);

    await fixture.advanceTime(duration(5, 'minutes'));

    {
      const { workModel } = await fixture.sendCharacterEvent(
        { eventType: 'castSpell', data: { id: 'ground-heal', location: { id: 0, manaLevel: 0 }, power: 2 } },
        1,
      );
      expect(fixture.getCharacterNotifications(1).length).toBe(1);
      expect(workModel.activeAbilities.length).toBe(1);
      expect(workModel.activeAbilities[0].humanReadableName).toContain('Ground Heal');
      expect(workModel.activeAbilities[0].validUntil).toBe(1500 * 1000);
    }

    let abilityId: string;
    {
      // Power 2 is 20 minutes = 1200 seconds.
      await fixture.advanceTime(duration(1199, 'seconds'));
      const { workModel } = await fixture.getCharacter(1);
      expect(workModel.activeAbilities.length).toBe(1);
      expect(workModel.activeAbilities[0].humanReadableName).toContain('Ground Heal');
      expect(workModel.activeAbilities[0].validUntil).toBe(1500 * 1000);
      abilityId = workModel.activeAbilities[0].id;
    }

    {
      const { workModel } = await fixture.useAbility({ id: abilityId, targetCharacterId: '2' }, 1);
      expect(fixture.getCharacterNotifications(1).length).toBe(1);
      expect(fixture.getCharacterNotifications(2).length).toBe(1);
      expect(fixture.getCharacterNotifications(2)[0].body).toContain('Хиты полностью восстановлены');
      expect(workModel.activeAbilities.length).toBe(0);
    }
  });

  it('Ground Heal expired', async () => {
    await fixture.saveCharacter({ magic: 10 });
    await fixture.addCharacterFeature('ground-heal');
    await fixture.sendCharacterEvent({ eventType: 'castSpell', data: { id: 'ground-heal', location: { id: 0, manaLevel: 0 }, power: 2 } });
    await fixture.advanceTime(duration(20, 'minutes'));
    const { workModel } = await fixture.getCharacter();
    expect(workModel.activeAbilities.length).toBe(0);
  });

  it('Live long and prosper', async () => {
    await fixture.saveCharacter({ modelId: '1', magic: 10 });
    await fixture.saveCharacter({ modelId: '2', maxHp: 3 });
    await fixture.addCharacterFeature('live-long-and-prosper', 1);
    {
      const { workModel } = await fixture.sendCharacterEvent(
        {
          eventType: 'castSpell',
          data: { id: 'live-long-and-prosper', location: { id: 0, manaLevel: 0 }, targetCharacterId: '2', power: 4 },
        },
        1,
      );
      expect(fixture.getCharacterNotifications(1).length).toBe(1);
      expect(workModel.history.length).toBe(1); // Spell casted
    }

    {
      expect(fixture.getCharacterNotifications(2).length).toBe(1);
      expect(fixture.getCharacterNotifications(2)[0].body).toContain('увеличены на 4');
      const { workModel } = await fixture.getCharacter(2);
      expect(workModel.history.length).toBe(1); // Hp restored
      expect(workModel.maxHp).toBe(6); // Not 7 as global maximum is 6
    }
  });

  it('Keep yourself', async () => {
    await fixture.saveCharacter({ magic: 10, maxHp: 2 });
    await fixture.addCharacterFeature('keep-yourself');
    {
      const { workModel } = await fixture.sendCharacterEvent({
        eventType: 'castSpell',
        data: { id: 'keep-yourself', location: { id: 0, manaLevel: 0 }, power: 3 },
      });
      expect(fixture.getCharacterNotifications().length).toBe(1);
      expect(fixture.getCharacterNotifications()[0].body).toContain('на 3 на 30 минут');
      expect(workModel.maxHp).toBe(5);
    }

    {
      await fixture.advanceTime(duration(30, 'minutes'));
      const { workModel } = await fixture.getCharacter();
      expect(workModel.maxHp).toBe(2);
    }
  });

  it('Trackpoint', async () => {
    await fixture.saveCharacter({ modelId: '1', magic: 100 });
    await fixture.addCharacterFeature('fireball', 1);
    await fixture.addCharacterFeature('ground-heal', 1);

    await fixture.saveCharacter({ modelId: '2' });
    await fixture.addCharacterFeature('ground-heal', 2);

    await fixture.sendCharacterEvent(
      { eventType: 'castSpell', data: { id: 'ground-heal', location: { id: 0, manaLevel: 10 }, power: 2 } },
      1,
    );
    await fixture.advanceTime(duration(2, 'minutes'));
    await fixture.sendCharacterEvent({ eventType: 'castSpell', data: { id: 'fireball', location: { id: 0, manaLevel: 10 }, power: 4 } }, 1);
    await fixture.advanceTime(duration(15, 'minutes'));
    await fixture.sendCharacterEvent(
      { eventType: 'castSpell', data: { id: 'ground-heal', location: { id: 0, manaLevel: 10 }, power: 6 } },
      2,
    );

    await fixture.saveCharacter({ modelId: '3', magic: 5 });
    await fixture.addCharacterFeature('trackpoint', 3);

    const { tableResponse } = await fixture.sendCharacterEvent(
      { eventType: 'castSpell', data: { id: 'trackpoint', location: { id: 0, manaLevel: 10 }, power: 5 } },
      3,
    );
    expect(tableResponse.length).toBe(2);
    expect(tableResponse).toContainEqual(
      expect.objectContaining({
        spellName: 'Fireball (S)',
        timestamp: 120000,
        power: 4,
        magicFeedback: 10,
      }),
    );
    expect(tableResponse).toContainEqual(
      expect.objectContaining({
        spellName: 'Ground Heal (S)',
        timestamp: 1020000,
        power: 6,
        magicFeedback: 11,
      }),
    );

    for (const entry of tableResponse) {
      const aura: string = entry.casterAura;
      expect(aura).toMatch(
        /[a-z*][a-z*][a-z*][a-z*]-[a-z*][a-z*][a-z*][a-z*]-[a-z*][a-z*][a-z*][a-z*]-[a-z*][a-z*][a-z*][a-z*]-[a-z*][a-z*][a-z*][a-z*]/,
      );
      expect((aura.match(/[a-z]/g) ?? []).length).toBe(7);
    }
  });

  it('Trackpoint against Light Step', async () => {
    await fixture.saveCharacter({ modelId: '1', magic: 5 });
    await fixture.addCharacterFeature('light-step', 1);
    await fixture.addCharacterFeature('fireball', 1);

    await fixture.saveCharacter({ modelId: '2', magic: 10, magicStats: { auraReadingMultiplier: 2.0 } });
    await fixture.addCharacterFeature('trackpoint', 2);

    await fixture.advanceTime(duration(2, 'minutes'));
    await fixture.sendCharacterEvent({ eventType: 'castSpell', data: { id: 'fireball', location: { id: 0, manaLevel: 10 }, power: 4 } }, 1);

    // power 8 + auraReadingMultiplier 2.0 gives us 100% read
    const { tableResponse } = await fixture.sendCharacterEvent(
      { eventType: 'castSpell', data: { id: 'trackpoint', location: { id: 0, manaLevel: 10 }, power: 8 } },
      2,
    );
    expect(tableResponse.length).toBe(1);
    expect(tableResponse).toContainEqual(
      expect.objectContaining({
        spellName: 'Fireball (S)',
        timestamp: 120000,
        power: 4,
        magicFeedback: 10,
      }),
    );

    for (const entry of tableResponse) {
      const aura: string = entry.casterAura;
      expect(aura).toMatch(
        /[a-z*][a-z*][a-z*][a-z*]-[a-z*][a-z*][a-z*][a-z*]-[a-z*][a-z*][a-z*][a-z*]-[a-z*][a-z*][a-z*][a-z*]-[a-z*][a-z*][a-z*][a-z*]/,
      );
      expect((aura.match(/[a-z]/g) ?? []).length).toBe(12);
    }
  });

  it('Ritual with 2 participants increase power by 1', async () => {
    await fixture.saveCharacter({ modelId: '1', magic: 5 });
    await fixture.addCharacterFeature('ritual-magic', 1);
    await fixture.addCharacterFeature('ground-heal', 1);

    await fixture.saveCharacter({ modelId: '2' });
    await fixture.saveCharacter({ modelId: '3' });

    const { workModel } = await fixture.sendCharacterEvent(
      { eventType: 'castSpell', data: { id: 'ground-heal', location: { id: 0, manaLevel: 10 }, power: 4, ritualMembersIds: ['2', '3'] } },
      1,
    );
    expect(workModel.activeAbilities.length).toBe(1);
    expect(workModel.activeAbilities[0].validUntil).toBe(600 * 6 * 1000); // power was 4, but 2 ritual participants add +2
  });

  it('Ritual with agnus dei', async () => {
    await fixture.saveCharacter({ modelId: '1', magic: 5 });
    await fixture.addCharacterFeature('ritual-magic', 1);
    await fixture.addCharacterFeature('ground-heal', 1);

    await fixture.saveCharacter({ modelId: '2' });
    await fixture.addCharacterFeature('agnus-dei', 2);
    await fixture.saveCharacter({ modelId: '3' });

    const { workModel } = await fixture.sendCharacterEvent(
      { eventType: 'castSpell', data: { id: 'ground-heal', location: { id: 0, manaLevel: 10 }, power: 4, ritualMembersIds: ['2', '3'] } },
      1,
    );
    expect(workModel.activeAbilities.length).toBe(1);
    expect(workModel.activeAbilities[0].validUntil).toBe(600 * 6 * 1000); // power was 4, but ritual participants add +2
  });

  it('Blood ritual', async () => {
    await fixture.saveCharacter({ modelId: '1', magic: 5 });
    await fixture.addCharacterFeature('bathory-charger', 1);
    await fixture.addCharacterFeature('ground-heal', 1);

    await fixture.saveCharacter({ modelId: '2', healthState: 'wounded' });

    const { workModel } = await fixture.sendCharacterEvent(
      { eventType: 'castSpell', data: { id: 'ground-heal', location: { id: 0, manaLevel: 10 }, power: 4, ritualVictimIds: ['2'] } },
      1,
    );
    expect(workModel.passiveAbilities).toContainEqual(expect.objectContaining({ id: 'magic-in-the-blood' }));
    expect(workModel.passiveAbilities).toContainEqual(expect.objectContaining({ id: 'bloody-tide' }));
    expect(workModel.magicStats.maxPowerBonus).toBe(1);
    expect(workModel.magicStats.feedbackMultiplier).toBe(1.0 / 7.0);

    expect((await fixture.getCharacter('2')).workModel.healthState).toBe('clinically_dead');
    expect((await fixture.getCharacter('2')).workModel.essence).toBe(500);
  });

  it('Blood ritual requires wounded victims', async () => {
    await fixture.saveCharacter({ modelId: '1', magic: 5 });
    await fixture.addCharacterFeature('bathory-charger', 1);
    await fixture.addCharacterFeature('ground-heal', 1);

    const states: HealthState[] = ['healthy', 'clinically_dead', 'biologically_dead'];
    for (const healthState of states) {
      await fixture.saveCharacter({ modelId: '2', healthState });
      const message = await fixture.sendCharacterEventExpectingError(
        { eventType: 'castSpell', data: { id: 'ground-heal', location: { id: 0, manaLevel: 10 }, power: 4, ritualVictimIds: ['2'] } },
        1,
      );
      expect(message).toContain('должны быть в тяжране');
    }
  });

  it('Blood ritual requires victims with essence > 100', async () => {
    await fixture.saveCharacter({ modelId: '1', magic: 5 });
    await fixture.addCharacterFeature('bathory-charger', 1);
    await fixture.addCharacterFeature('ground-heal', 1);

    await fixture.saveCharacter({ modelId: '2', healthState: 'wounded', essenceDetails: { max: 600, used: 501 } });
    await fixture.sendCharacterEvent(
      { eventType: 'castSpell', data: { id: 'ground-heal', location: { id: 0, manaLevel: 10 }, power: 4, ritualVictimIds: ['2'] } },
      1,
    );

    expect((await fixture.getCharacter('2')).workModel.healthState).toBe('wounded');
    expect((await fixture.getCharacter('2')).workModel.essence).toBe(99);
  });

  it('Tempus Fugit', async () => {
    await fixture.saveCharacter({ modelId: '1', magic: 10 });
    await fixture.addCharacterFeature('ground-heal', 1);
    await fixture.addCharacterFeature('fireball', 1);
    await fixture.addCharacterFeature('tempus-fugit', 1);

    await fixture.advanceTime(duration(600, 'seconds'));
    await fixture.sendCharacterEvent({ eventType: 'castSpell', data: { id: 'fireball', location: { id: 0, manaLevel: 10 }, power: 4 } }, 1);

    await fixture.advanceTime(duration(700, 'seconds'));
    await fixture.sendCharacterEvent(
      { eventType: 'castSpell', data: { id: 'ground-heal', location: { id: 0, manaLevel: 10 }, power: 4 } },
      1,
    );

    await fixture.advanceTime(duration(300, 'seconds'));
    await fixture.sendCharacterEvent(
      { eventType: 'castSpell', data: { id: 'tempus-fugit', location: { id: 0, manaLevel: 10 }, power: 2 } },
      1,
    );

    const { workModel } = await fixture.getLocation();
    expect(workModel.spellTraces).toContainEqual(
      expect.objectContaining({
        timestamp: 600000,
        spellName: 'Fireball (S)',
      }),
    );
    expect(workModel.spellTraces).toContainEqual(
      expect.objectContaining({
        timestamp: (1300 - 480) * 1000,
        spellName: 'Ground Heal (S)',
      }),
    );
    expect(workModel.spellTraces).toContainEqual(
      expect.objectContaining({
        timestamp: (1600 - 480) * 1000,
        spellName: 'Tempus Fugit (S)',
      }),
    );
  });

  it('Brasilia', async () => {
    await fixture.saveCharacter({ modelId: '1', magic: 100 });
    await fixture.addCharacterFeature('ground-heal', 1);
    await fixture.addCharacterFeature('fireball', 1);
    await fixture.addCharacterFeature('brasilia', 1);

    await fixture.advanceTime(duration(200, 'seconds'));
    await fixture.sendCharacterEvent(
      { eventType: 'castSpell', data: { id: 'ground-heal', location: { id: 0, manaLevel: 10 }, power: 4 } },
      1,
    );

    await fixture.advanceTime(duration(300, 'seconds'));
    await fixture.sendCharacterEvent({ eventType: 'castSpell', data: { id: 'fireball', location: { id: 0, manaLevel: 10 }, power: 2 } }, 1);

    await fixture.sendCharacterEvent({ eventType: 'castSpell', data: { id: 'brasilia', location: { id: 0, manaLevel: 10 }, power: 1 } }, 1);

    await fixture.advanceTime(duration(60, 'seconds'));

    const { workModel } = await fixture.getLocation();
    expect(workModel.spellTraces).toContainEqual(
      expect.objectContaining({
        timestamp: -100000,
        spellName: 'Ground Heal (S)',
      }),
    );
    expect(workModel.spellTraces).toContainEqual(
      expect.objectContaining({
        timestamp: 200000,
        spellName: 'Fireball (S)',
      }),
    );
    expect(workModel.spellTraces).toContainEqual(
      expect.objectContaining({
        timestamp: 200000,
        spellName: 'Brasilia (S)',
      }),
    );
  });

  it('Frog skin weak', async () => {
    await fixture.saveCharacter({ modelId: '1', charisma: 5, magic: 10 });
    await fixture.saveCharacter({ modelId: '2', charisma: 3 });
    await fixture.addCharacterFeature('frog-skin', 1);
    {
      const { workModel } = await fixture.sendCharacterEvent(
        { eventType: 'castSpell', data: { id: 'frog-skin', location: { id: 0, manaLevel: 0 }, targetCharacterId: '2', power: 2 } },
        1,
      );
      expect(workModel.charisma).toBe(5);
    }

    {
      const { workModel } = await fixture.getCharacter(2);
      expect(workModel.charisma).toBe(2);
    }
  });

  it('Frog skin strong', async () => {
    await fixture.saveCharacter({ modelId: '1', charisma: 5, magic: 10 });
    await fixture.saveCharacter({ modelId: '2', charisma: 3 });
    await fixture.addCharacterFeature('frog-skin', 1);
    {
      const { workModel } = await fixture.sendCharacterEvent(
        { eventType: 'castSpell', data: { id: 'frog-skin', location: { id: 0, manaLevel: 0 }, targetCharacterId: '2', power: 4 } },
        1,
      );
      expect(workModel.charisma).toBe(5);
    }

    {
      const { workModel } = await fixture.getCharacter(2);
      expect(workModel.charisma).toBe(1);
    }
  });

  it('Charm weak', async () => {
    await fixture.saveCharacter({ modelId: '1', charisma: 5, magic: 10 });
    await fixture.saveCharacter({ modelId: '2', charisma: 3 });
    await fixture.addCharacterFeature('charm', 1);
    {
      const { workModel } = await fixture.sendCharacterEvent(
        { eventType: 'castSpell', data: { id: 'charm', location: { id: 0, manaLevel: 0 }, targetCharacterId: '2', power: 2 } },
        1,
      );
      expect(workModel.charisma).toBe(5);
    }

    {
      const { workModel } = await fixture.getCharacter(2);
      expect(workModel.charisma).toBe(4);
    }
  });

  it('Charm strong', async () => {
    await fixture.saveCharacter({ modelId: '1', charisma: 6, magic: 10 });
    await fixture.saveCharacter({ modelId: '2', charisma: 3 });
    await fixture.addCharacterFeature('charm', 1);
    {
      const { workModel } = await fixture.sendCharacterEvent(
        { eventType: 'castSpell', data: { id: 'charm', location: { id: 0, manaLevel: 0 }, targetCharacterId: '2', power: 4 } },
        1,
      );
      expect(workModel.charisma).toBe(6);
    }

    {
      const { workModel } = await fixture.getCharacter(2);
      expect(workModel.charisma).toBe(5);
    }
  });

  it('Use reagents', async () => {
    await fixture.saveCharacter({ metarace: 'meta-elf', magic: 10 });
    const reagentIds = ['3', '6', '23'];
    for (const modelId of reagentIds) {
      await fixture.saveQrCode({ modelId });
      await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'skalozub', name: '', description: '' } }, modelId);
    }

    await fixture.addCharacterFeature('fireball');
    await fixture.sendCharacterEvent({
      eventType: 'castSpell',
      data: { id: 'fireball', location: { id: 0, manaLevel: 5 }, power: 3, reagentIds },
    });

    for (const modelId of reagentIds) {
      const qr = await fixture.getQrCode(modelId);
      expect(qr.workModel.type).toBe('box');
    }
  });

  it('Fireball', async () => {
    await fixture.saveCharacter({ magic: 10 });
    await fixture.addCharacterFeature('fireball');
    const { workModel } = await fixture.sendCharacterEvent({
      eventType: 'castSpell',
      data: { id: 'fireball', location: { id: 0, manaLevel: 0 }, power: 5 },
    });
    expect(workModel.passiveAbilities).toContainEqual(
      expect.objectContaining({
        id: 'fireball-able',
        description: `Можете кинуть 3 огненных шаров.`,
      }),
    );
  });

  it('Fast Charge', async () => {
    await fixture.saveCharacter({ magic: 10 });
    await fixture.addCharacterFeature('fast-charge');
    const { workModel } = await fixture.sendCharacterEvent({
      eventType: 'castSpell',
      data: { id: 'fast-charge', location: { id: 0, manaLevel: 0 }, power: 5 },
    });
    expect(workModel.passiveAbilities).toContainEqual(
      expect.objectContaining({
        id: 'fast-charge-able',
        description: `Можете кинуть 6 молний.`,
      }),
    );
  });

  it('Stone skin', async () => {
    await fixture.saveCharacter({ magic: 10 });
    await fixture.addCharacterFeature('stone-skin');
    {
      const { workModel } = await fixture.sendCharacterEvent({
        eventType: 'castSpell',
        data: { id: 'stone-skin', location: { id: 0, manaLevel: 0 }, power: 1 },
      });
      expect(workModel.activeAbilities).toContainEqual(expect.objectContaining({ id: 'skin-stone' }));
    }

    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'useAbility', data: { id: 'skin-stone' } });
      expect(workModel.passiveAbilities).toContainEqual(expect.objectContaining({ id: 'stone-skin-result' }));
      expect(workModel.activeAbilities).not.toContainEqual(expect.objectContaining({ id: 'skin-stone' }));
    }
  });

  it('Dumbie weak', async () => {
    await fixture.saveCharacter({ modelId: '1', intelligence: 5, magic: 10 });
    await fixture.saveCharacter({ modelId: '2', intelligence: 3 });
    await fixture.addCharacterFeature('dumbie', 1);
    {
      const { workModel } = await fixture.sendCharacterEvent(
        { eventType: 'castSpell', data: { id: 'dumbie', location: { id: 0, manaLevel: 0 }, targetCharacterId: '2', power: 2 } },
        1,
      );
      expect(workModel.intelligence).toBe(5);
    }

    {
      const { workModel } = await fixture.getCharacter(2);
      expect(workModel.intelligence).toBe(2);
    }
  });

  it('Dumbie strong', async () => {
    await fixture.saveCharacter({ modelId: '1', intelligence: 5, magic: 10 });
    await fixture.saveCharacter({ modelId: '2', intelligence: 3 });
    await fixture.addCharacterFeature('dumbie', 1);
    {
      const { workModel } = await fixture.sendCharacterEvent(
        { eventType: 'castSpell', data: { id: 'dumbie', location: { id: 0, manaLevel: 0 }, targetCharacterId: '2', power: 4 } },
        1,
      );
      expect(workModel.intelligence).toBe(5);
    }

    {
      const { workModel } = await fixture.getCharacter(2);
      expect(workModel.intelligence).toBe(1);
    }
  });

  it('Smartie weak', async () => {
    await fixture.saveCharacter({ modelId: '1', intelligence: 5, magic: 10 });
    await fixture.saveCharacter({ modelId: '2', intelligence: 3 });
    await fixture.addCharacterFeature('smartie', 1);
    {
      const { workModel } = await fixture.sendCharacterEvent(
        { eventType: 'castSpell', data: { id: 'smartie', location: { id: 0, manaLevel: 0 }, targetCharacterId: '2', power: 2 } },
        1,
      );
      expect(workModel.intelligence).toBe(5);
    }

    {
      const { workModel } = await fixture.getCharacter(2);
      expect(workModel.intelligence).toBe(4);
    }
  });

  it('Smartie strong', async () => {
    await fixture.saveCharacter({ modelId: '1', intelligence: 5, magic: 10 });
    await fixture.saveCharacter({ modelId: '2', intelligence: 3 });
    await fixture.addCharacterFeature('smartie', 1);
    {
      const { workModel } = await fixture.sendCharacterEvent(
        { eventType: 'castSpell', data: { id: 'smartie', location: { id: 0, manaLevel: 0 }, targetCharacterId: '2', power: 4 } },
        1,
      );
      expect(workModel.intelligence).toBe(5);
    }

    {
      const { workModel } = await fixture.getCharacter(2);
      expect(workModel.intelligence).toBe(5);
    }
  });

  it('Healton', async () => {
    await fixture.saveCharacter({ magic: 10 });
    await fixture.addCharacterFeature('healton');
    const { workModel } = await fixture.sendCharacterEvent({
      eventType: 'castSpell',
      data: { id: 'healton', location: { id: 0, manaLevel: 0 }, power: 1 },
    });

    expect(workModel.passiveAbilities).toContainEqual(expect.objectContaining({ id: 'healtouch' }));
  });

  it('Cacophony', async () => {
    await fixture.saveCharacter({ magic: 10 });
    await fixture.addCharacterFeature('cacophony');
    {
      const { workModel } = await fixture.sendCharacterEvent({
        eventType: 'castSpell',
        data: { id: 'cacophony', location: { id: 0, manaLevel: 0 }, power: 1 },
      });
      expect(workModel.passiveAbilities).toContainEqual(expect.objectContaining({ id: 'cacophony-able' }));
    }
  });

  it('Let it go', async () => {
    await fixture.saveCharacter({ magic: 10 });
    await fixture.addCharacterFeature('let-it-go');
    {
      const { workModel } = await fixture.sendCharacterEvent({
        eventType: 'castSpell',
        data: { id: 'let-it-go', location: { id: 0, manaLevel: 0 }, power: 1 },
      });
      expect(workModel.passiveAbilities).toContainEqual(expect.objectContaining({ id: 'let-it-go-effect' }));
    }
  });

  it('Scum stoner', async () => {
    await fixture.saveCharacter({ modelId: '1', magic: 10 });
    await fixture.addCharacterFeature('scum-stoner', 1);
    await fixture.saveCharacter({ modelId: '2' });

    await fixture.sendCharacterEvent(
      {
        eventType: 'castSpell',
        data: { id: 'scum-stoner', location: { id: 0, manaLevel: 0 }, targetCharacterId: '2', power: 1 },
      },
      1,
    );

    expect((await fixture.getCharacter('2')).workModel.activeAbilities).toContainEqual(
      expect.objectContaining({
        id: 'skin-stone',
      }),
    );
  });

  it('Tax free', async () => {
    await fixture.saveCharacter({ modelId: '1', magic: 10 });
    await fixture.addCharacterFeature('tax-free', 1);
    await fixture.saveCharacter({ modelId: '2', discounts: { everything: 1 } });
    {
      const { workModel } = await fixture.sendCharacterEvent(
        {
          eventType: 'castSpell',
          data: { id: 'tax-free', location: { id: 0, manaLevel: 0 }, targetCharacterId: '2', power: 2 },
        },
        1,
      );

      expect((await fixture.getCharacter(2)).workModel.discounts.everything).toBe(0.8);
    }
  });

  it('Shtopping', async () => {
    await fixture.saveCharacter({ modelId: '1', magic: 10 });
    await fixture.addCharacterFeature('shtopping', 1);
    await fixture.saveCharacter({ modelId: '2', discounts: { everything: 1 } });
    {
      const { workModel } = await fixture.sendCharacterEvent(
        {
          eventType: 'castSpell',
          data: { id: 'shtopping', location: { id: 0, manaLevel: 0 }, targetCharacterId: '2', power: 2 },
        },
        1,
      );

      expect((await fixture.getCharacter(2)).workModel.discounts.everything).toBe(1.2);
    }
  });

  describe('Rituals bonuses', function () {
    //no ritual: input power=4
    //Should  be: power=4, feedback=8
    it('No ritual', async () => {
      await fixture.saveCharacter({ modelId: '1', magic: 10 });
      await fixture.addCharacterFeature('fireball', 1);

      await fixture.saveCharacter({ modelId: '2', magic: 10 });
      await fixture.addCharacterFeature('trackpoint', 2);

      await fixture.sendCharacterEvent(
        { eventType: 'castSpell', data: { id: 'fireball', location: { id: 0, manaLevel: 0 }, power: 4 } },
        1,
      );

      const { tableResponse } = await fixture.sendCharacterEvent(
        { eventType: 'castSpell', data: { id: 'trackpoint', location: { id: 0, manaLevel: 0 }, power: 8 } },
        2,
      );
      expect(tableResponse.length).toBe(1);
      expect(tableResponse).toContainEqual(
        expect.objectContaining({
          spellName: 'Fireball (S)',
          power: 4,
          magicFeedback: 8,
        }),
      );
    });

    //orthodox-ritual-magic: input power=4, 1 plain participant.
    //Should  be: power=round(4+1^0.5)=5, feedback=round(8.8)/(2+1)=3
    it('Normal ritual1, members: 1 plain', async () => {
      await fixture.saveCharacter({ modelId: '1', magic: 10 });
      await fixture.addCharacterFeature('ritual-magic', 1);
      await fixture.addCharacterFeature('fireball', 1);

      await fixture.saveCharacter({ modelId: '2', magic: 10 });
      await fixture.addCharacterFeature('trackpoint', 2);
      expect((await fixture.getCharacter(2)).workModel.magicStats.participantCoefficient).toBe(1);

      await fixture.sendCharacterEvent(
        { eventType: 'castSpell', data: { id: 'fireball', location: { id: 0, manaLevel: 0 }, power: 4, ritualMembersIds: ['2'] } },
        1,
      );

      const { tableResponse } = await fixture.sendCharacterEvent(
        { eventType: 'castSpell', data: { id: 'trackpoint', location: { id: 0, manaLevel: 0 }, power: 8 } },
        2,
      );
      expect(tableResponse.length).toBe(1);
      expect(tableResponse).toContainEqual(
        expect.objectContaining({
          spellName: 'Fireball (S)',
          power: 5,
          magicFeedback: 3,
        }),
      );
    });

    it('Normal ritual2, members: 1 agnus', async () => {
      await fixture.saveCharacter({ modelId: '1', magic: 10 });
      await fixture.addCharacterFeature('ritual-magic', 1);
      await fixture.addCharacterFeature('fireball', 1);

      await fixture.saveCharacter({ modelId: '2', magic: 10 });
      await fixture.addCharacterFeature('trackpoint', 2);
      await fixture.addCharacterFeature('agnus-dei', 2);
      expect((await fixture.getCharacter(2)).workModel.magicStats.participantCoefficient).toBe(3);

      await fixture.sendCharacterEvent(
        { eventType: 'castSpell', data: { id: 'fireball', location: { id: 0, manaLevel: 0 }, power: 4, ritualMembersIds: ['2'] } },
        1,
      );

      const { tableResponse } = await fixture.sendCharacterEvent(
        { eventType: 'castSpell', data: { id: 'trackpoint', location: { id: 0, manaLevel: 0 }, power: 8 } },
        2,
      );
      expect(tableResponse.length).toBe(1);
      expect(tableResponse).toContainEqual(
        expect.objectContaining({
          spellName: 'Fireball (S)',
          power: 6,
          magicFeedback: 2,
        }),
      );
    });

    it('Normal ritual3, 2 trys, members: 1 agnus (then exhausted)', async () => {
      await fixture.saveCharacter({ modelId: '1', magic: 10 });
      await fixture.addCharacterFeature('ritual-magic', 1);
      await fixture.addCharacterFeature('fireball', 1);
      await fixture.addCharacterFeature('fast-charge', 1);

      await fixture.saveCharacter({ modelId: '2', magic: 10 });
      await fixture.addCharacterFeature('trackpoint', 2);
      await fixture.addCharacterFeature('agnus-dei', 2);

      expect((await fixture.getCharacter(2)).workModel.passiveAbilities).not.toContainEqual(
        expect.objectContaining({ id: 'soul-exhaustion' }),
      );
      expect((await fixture.getCharacter(2)).workModel.magicStats.participantCoefficient).toBe(3);

      {
        await fixture.sendCharacterEvent(
          { eventType: 'castSpell', data: { id: 'fireball', location: { id: 0, manaLevel: 0 }, power: 4, ritualMembersIds: ['2'] } },
          1,
        );

        const { tableResponse } = await fixture.sendCharacterEvent(
          { eventType: 'castSpell', data: { id: 'trackpoint', location: { id: 0, manaLevel: 0 }, power: 1 } },
          2,
        );
        expect(tableResponse.length).toBe(1);
        expect(tableResponse).toContainEqual(
          expect.objectContaining({
            spellName: 'Fireball (S)',
            power: 6,
            magicFeedback: 2,
          }),
        );
      }

      expect((await fixture.getCharacter(2)).workModel.passiveAbilities).toContainEqual(expect.objectContaining({ id: 'soul-exhaustion' }));
      expect((await fixture.getCharacter(2)).workModel.magicStats.participantCoefficient).toBe(0);

      {
        await fixture.sendCharacterEvent(
          { eventType: 'castSpell', data: { id: 'fast-charge', location: { id: 0, manaLevel: 0 }, power: 3, ritualMembersIds: ['2'] } },
          1,
        );

        const { tableResponse } = await fixture.sendCharacterEvent(
          { eventType: 'castSpell', data: { id: 'trackpoint', location: { id: 0, manaLevel: 0 }, power: 1 } },
          2,
        );
        expect(tableResponse.length).toBe(3);
        expect(tableResponse).toContainEqual(
          expect.objectContaining({
            spellName: 'Fast charge (S)',
            power: 3,
            magicFeedback: 8,
          }),
        );
      }

      await fixture.advanceTime(duration(35, 'minutes'));
      expect((await fixture.getCharacter(2)).workModel.passiveAbilities).not.toContainEqual(
        expect.objectContaining({ id: 'soul-exhaustion' }),
      );
      expect((await fixture.getCharacter(2)).workModel.magicStats.participantCoefficient).toBe(3);
    });

    it('Bloody ritual1, members: 1 plain', async () => {
      await fixture.saveCharacter({ modelId: '1', magic: 10 });
      await fixture.addCharacterFeature('bathory-charger', 1);
      await fixture.addCharacterFeature('fireball', 1);
      await fixture.addCharacterFeature('fast-charge', 1);

      await fixture.saveCharacter({ modelId: '2', magic: 10 });
      await fixture.addCharacterFeature('trackpoint', 2);

      await fixture.saveCharacter({ modelId: '3' });
      await fixture.saveCharacter({ modelId: '3', healthState: 'wounded' });

      //got bonus to user-chosen power and feedback/divider
      {
        const { workModel } = await fixture.sendCharacterEvent(
          { eventType: 'castSpell', data: { id: 'fireball', location: { id: 0, manaLevel: 0 }, power: 6, ritualVictimIds: ['3'] } },
          1,
        );
        //now user1 should get bloody-tide, magic-in-the-blood
        expect(workModel.passiveAbilities).toContainEqual(
          expect.objectContaining({ id: 'magic-in-the-blood', description: 'Увеличивает максимальную доступную тебе Мощь на 1' }),
        );
        expect(workModel.passiveAbilities).toContainEqual(expect.objectContaining({ id: 'bloody-tide' }));

        await fixture.advanceTime(duration(1, 'minutes'));
        const { tableResponse } = await fixture.sendCharacterEvent(
          { eventType: 'castSpell', data: { id: 'trackpoint', location: { id: 0, manaLevel: 0 }, power: 1 } },
          2,
        );
        expect(tableResponse.length).toBe(1);
        expect(tableResponse).toContainEqual(
          expect.objectContaining({
            spellName: 'Fireball (S)',
            power: 6,
            magicFeedback: 1,
          }),
        );
      }

      //bonus to power available in APP, but feedback/divider=1/7 still here
      {
        await fixture.advanceTime(duration(1, 'minutes'));
        const { workModel } = await fixture.sendCharacterEvent(
          { eventType: 'castSpell', data: { id: 'fast-charge', location: { id: 0, manaLevel: 0 }, power: 7 } },
          1,
        );

        await fixture.advanceTime(duration(1, 'minutes'));
        const { tableResponse } = await fixture.sendCharacterEvent(
          { eventType: 'castSpell', data: { id: 'trackpoint', location: { id: 0, manaLevel: 0 }, power: 1 } },
          2,
        );
        expect(tableResponse.length).toBe(3);
        expect(tableResponse).toContainEqual(
          expect.objectContaining({
            spellName: 'Fast charge (S)',
            power: 7,
            magicFeedback: 1,
          }),
        );
      }
    });

    it('Bloody ritual2, members: 1 strong-blood', async () => {
      await fixture.saveCharacter({ modelId: '1', magic: 10 });
      await fixture.addCharacterFeature('bathory-charger', 1);
      await fixture.addCharacterFeature('fireball', 1);

      await fixture.saveCharacter({ modelId: '2', magic: 10 });
      await fixture.addCharacterFeature('trackpoint', 2);

      await fixture.saveCharacter({ modelId: '3' });
      await fixture.saveCharacter({ modelId: '3', healthState: 'wounded' });
      await fixture.addCharacterFeature('strong-blood', 2);
      expect((await fixture.getCharacter(2)).workModel.magicStats.victimCoefficient).toBe(3);

      //got bonus to user-chosen power and feedback/divider
      {
        const { workModel } = await fixture.sendCharacterEvent(
          { eventType: 'castSpell', data: { id: 'fireball', location: { id: 0, manaLevel: 0 }, power: 6, ritualVictimIds: ['3'] } },
          1,
        );
        //now user1 should get bloody-tide, magic-in-the-blood
        expect(workModel.passiveAbilities).toContainEqual(
          expect.objectContaining({ id: 'magic-in-the-blood', description: 'Увеличивает максимальную доступную тебе Мощь на 1' }),
        );
        expect(workModel.passiveAbilities).toContainEqual(expect.objectContaining({ id: 'bloody-tide' }));

        await fixture.advanceTime(duration(1, 'minutes'));
        const { tableResponse } = await fixture.sendCharacterEvent(
          { eventType: 'castSpell', data: { id: 'trackpoint', location: { id: 0, manaLevel: 0 }, power: 1 } },
          2,
        );
        expect(tableResponse.length).toBe(1);
        expect(tableResponse).toContainEqual(
          expect.objectContaining({
            spellName: 'Fireball (S)',
            power: 6,
            magicFeedback: 1,
          }),
        );
      }
    });

    //victim with strongest-blood
    it('Bloody ritual3, members: 1 strongest-blood', async () => {
      await fixture.saveCharacter({ modelId: '1', magic: 10 });
      await fixture.addCharacterFeature('bathory-charger', 1);
      await fixture.addCharacterFeature('fireball', 1);

      await fixture.saveCharacter({ modelId: '2', magic: 10 });
      await fixture.addCharacterFeature('trackpoint', 2);

      await fixture.saveCharacter({ modelId: '3' });
      await fixture.saveCharacter({ modelId: '3', healthState: 'wounded' });
      await fixture.addCharacterFeature('strongest-blood', 3);
      expect((await fixture.getCharacter(3)).workModel.magicStats.victimCoefficient).toBe(5);

      //got bonus to user-chosen power and feedback/divider
      {
        const { workModel } = await fixture.sendCharacterEvent(
          { eventType: 'castSpell', data: { id: 'fireball', location: { id: 0, manaLevel: 0 }, power: 8, ritualVictimIds: ['3'] } },
          1,
        );
        //now user1 should get bloody-tide, magic-in-the-blood
        expect(workModel.passiveAbilities).toContainEqual(
          expect.objectContaining({ id: 'magic-in-the-blood', description: 'Увеличивает максимальную доступную тебе Мощь на 2' }),
        );
        expect(workModel.passiveAbilities).toContainEqual(expect.objectContaining({ id: 'bloody-tide' }));

        await fixture.advanceTime(duration(1, 'minutes'));
        const { tableResponse } = await fixture.sendCharacterEvent(
          { eventType: 'castSpell', data: { id: 'trackpoint', location: { id: 0, manaLevel: 0 }, power: 1 } },
          2,
        );
        expect(tableResponse.length).toBe(1);
        expect(tableResponse).toContainEqual(
          expect.objectContaining({
            spellName: 'Fireball (S)',
            power: 8,
            magicFeedback: 1,
          }),
        );
      }
    });
  });

  describe('Magic feedback calculation', function () {
    it('Example 13', () => {
      const feedback = calculateMagicFeedback({
        power: 3,
        sphereReagents: 0,
        metaTypeReagents: 0,
        ritualParticipants: 0,
        bloodRitualParticipants: 0,
        manaLevel: 4,
        inAstral: false,
        ophiuchusUsed: false,
        feedbackDurationMultiplier: 1,
        feedbackAmountMultiplier: 1,
      });

      expect(feedback).toMatchObject({ amount: 4, duration: 93 });
    });

    it('Example 14', () => {
      const feedback = calculateMagicFeedback({
        power: 3,
        sphereReagents: 0,
        metaTypeReagents: 0,
        ritualParticipants: 0,
        bloodRitualParticipants: 0,
        manaLevel: 1,
        inAstral: true,
        ophiuchusUsed: false,
        feedbackDurationMultiplier: 1,
        feedbackAmountMultiplier: 1,
      });

      expect(feedback).toMatchObject({ amount: 1, duration: 16 });
    });

    it('Example 19', () => {
      const feedback = calculateMagicFeedback({
        power: 7,
        sphereReagents: 11,
        metaTypeReagents: 0,
        ritualParticipants: 0,
        bloodRitualParticipants: 0,
        manaLevel: 1,
        inAstral: false,
        ophiuchusUsed: false,
        feedbackDurationMultiplier: 1,
        feedbackAmountMultiplier: 1,
      });

      expect(feedback).toMatchObject({ amount: 3, duration: 65 });
    });

    it('Example 20', () => {
      const feedback = calculateMagicFeedback({
        power: 7,
        sphereReagents: 0,
        metaTypeReagents: 7,
        ritualParticipants: 0,
        bloodRitualParticipants: 0,
        manaLevel: 1,
        inAstral: false,
        ophiuchusUsed: false,
        feedbackDurationMultiplier: 1,
        feedbackAmountMultiplier: 1,
      });

      expect(feedback).toMatchObject({ amount: 3, duration: 65 });
    });

    it('Example 34', () => {
      const feedback = calculateMagicFeedback({
        power: 1,
        sphereReagents: 0,
        metaTypeReagents: 0,
        ritualParticipants: 0,
        bloodRitualParticipants: 15,
        manaLevel: 1,
        inAstral: false,
        ophiuchusUsed: true,
        feedbackDurationMultiplier: 1,
        feedbackAmountMultiplier: 1,
      });

      expect(feedback).toMatchObject({ amount: 0, duration: 4 });
    });

    it('Example 38', () => {
      const feedback = calculateMagicFeedback({
        power: 1,
        sphereReagents: 0,
        metaTypeReagents: 0,
        ritualParticipants: 0,
        bloodRitualParticipants: 4,
        manaLevel: 1,
        inAstral: false,
        ophiuchusUsed: true,
        feedbackDurationMultiplier: 1,
        feedbackAmountMultiplier: 1,
      });

      expect(feedback).toMatchObject({ amount: 0, duration: 6 });
    });
  });
});
