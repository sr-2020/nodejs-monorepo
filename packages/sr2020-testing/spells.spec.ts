import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';
import { duration } from 'moment';
import { calculateMagicFeedback } from '@sr2020/sr2020-model-engine/scripts/character/spells';
import { HealthState } from '@sr2020/sr2020-common/models/sr2020-character.model';

describe('Spells', function() {
  // eslint-disable-next-line no-invalid-this
  this.timeout(15000);
  let fixture: TestFixture;

  beforeEach('setupApplication', async () => {
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
      expect(workModel).containDeep({ spells: [{ id: 'ground-heal' }] });
    }

    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'removeFeature', data: { id: 'ground-heal' } });
      expect(workModel.spells).to.be.empty();
    }
  });

  it('Forget unlearned spell', async () => {
    await fixture.saveCharacter();
    const { workModel } = await fixture.sendCharacterEvent({ eventType: 'removeFeature', data: { spellName: 'ground-heal' } });
    expect(workModel.spells).to.be.empty();
  });

  it('Forget all spells', async () => {
    await fixture.saveCharacter();
    await fixture.addCharacterFeature('ground-heal');
    const { workModel } = await fixture.sendCharacterEvent({ eventType: 'forgetAllSpells', data: {} });
    expect(workModel.spells).to.be.empty();
  });

  it('Cast dummy spell', async () => {
    await fixture.saveCharacter({ resonance: 12 });
    await fixture.addCharacterFeature('ground-heal');
    const { workModel } = await fixture.sendCharacterEvent({ eventType: 'increaseResonanceSpell', data: {} });
    expect(workModel).containDeep({ resonance: 13 });
    expect(fixture.getCharacterNotifications().length).to.equal(1);
  });

  it("Can't enchant already enchanted", async () => {
    await fixture.saveCharacter();
    await fixture.saveQrCode({ type: 'food' });

    const message = await fixture.sendCharacterEventExpectingError({ eventType: 'increaseResonanceSpell', data: { qrCode: '0' } });
    expect(message).containEql('уже записан');
    expect(fixture.getCharacterNotifications()).to.be.empty();

    expect(await fixture.getQrCode()).containDeep({ workModel: { type: 'food' } });
  });

  it('Enchant artifact and activate it later', async () => {
    await fixture.saveCharacter({ resonance: 0 });
    await fixture.saveQrCode();
    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'increaseResonanceSpell', data: { qrCode: 0 } });
      expect(workModel).containDeep({ resonance: 0 });
      expect(await fixture.getQrCode()).containDeep({ workModel: { usesLeft: 3 } });
    }
    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'scanQr', data: { qrCode: '0' } });
      expect(workModel).containDeep({ resonance: 1 });
      expect(await fixture.getQrCode()).containDeep({ workModel: { usesLeft: 2 } });
    }
  });

  it('Heal self', async () => {
    await fixture.saveCharacter();
    await fixture.sendCharacterEvent({ eventType: 'fullHealSpell', data: {} });
    expect(fixture.getCharacterNotifications().length).to.equal(1);
    expect(fixture.getCharacterNotifications()[0].body).containEql('полностью восстановл');
  });

  it('Heal other', async () => {
    await fixture.saveCharacter({ modelId: '1' });
    await fixture.saveCharacter({ modelId: '2' });
    await fixture.sendCharacterEvent({ eventType: 'fullHealSpell', data: { targetCharacterId: '2' } }, 1);
    expect(fixture.getCharacterNotifications(1).length).to.equal(0);
    expect(fixture.getCharacterNotifications(2).length).to.equal(1);
    expect(fixture.getCharacterNotifications(2)[0].body).containEql('полностью восстановл');
  });

  it('Light Heal self', async () => {
    await fixture.saveCharacter({ magic: 10 });
    await fixture.addCharacterFeature('dummy-light-heal');
    {
      const { workModel } = await fixture.sendCharacterEvent({
        eventType: 'castSpell',
        data: { id: 'dummy-light-heal', location: { id: 0, manaLevel: 0 }, power: 5 },
      });
      expect(fixture.getCharacterNotifications().length).to.equal(1);
      expect(fixture.getCharacterNotifications()[0].body).containEql('хитов: 5');
      expect(workModel.history.length).to.equal(2); // Spell casted + Hp restored
      expect(workModel.magic).to.equal(-7);
    }

    {
      await fixture.advanceTime(duration(88, 'minutes'));
      const { workModel } = await fixture.getCharacter();
      expect(workModel.magic).to.equal(-7);
    }
    {
      await fixture.advanceTime(duration(1, 'minute'));
      const { workModel } = await fixture.getCharacter();
      expect(workModel.magic).to.equal(10);
    }
  });

  it('Light Heal other', async () => {
    await fixture.saveCharacter({ modelId: '1', magic: 7 });
    await fixture.saveCharacter({ modelId: '2' });
    await fixture.addCharacterFeature('dummy-light-heal', 1);
    const { workModel } = await fixture.sendCharacterEvent(
      { eventType: 'castSpell', data: { id: 'dummy-light-heal', location: { id: 0, manaLevel: 0 }, targetCharacterId: '2', power: 3 } },
      1,
    );
    expect(fixture.getCharacterNotifications(1).length).to.equal(1);
    expect(workModel.history.length).to.equal(1); // Spell casted
    expect(workModel.magic).to.equal(-8);

    expect(fixture.getCharacterNotifications(2).length).to.equal(1);
    expect(fixture.getCharacterNotifications(2)[0].body).containEql('хитов: 3');
    expect((await fixture.getCharacter(2)).workModel.history.length).to.equal(1); // Hp restored
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
      expect(fixture.getCharacterNotifications(1).length).to.equal(1);
      expect(workModel.activeAbilities.length).to.equal(1);
      expect(workModel.activeAbilities[0].humanReadableName).to.equal('Ground Heal');
      expect(workModel.activeAbilities[0].validUntil).to.equal(1500 * 1000);
      expect(workModel.magic).to.equal(-3);
    }

    let abilityId: string;
    {
      // Power 2 is 20 minutes = 1200 seconds.
      await fixture.advanceTime(duration(1199, 'seconds'));
      const { workModel } = await fixture.getCharacter(1);
      expect(workModel.activeAbilities.length).to.equal(1);
      expect(workModel.activeAbilities[0].humanReadableName).to.equal('Ground Heal');
      expect(workModel.activeAbilities[0].validUntil).to.equal(1500 * 1000);
      abilityId = workModel.activeAbilities[0].id;
    }

    {
      const { workModel } = await fixture.useAbility({ id: abilityId, targetCharacterId: '2' }, 1);
      expect(fixture.getCharacterNotifications(1).length).to.equal(1);
      expect(fixture.getCharacterNotifications(2).length).to.equal(1);
      expect(fixture.getCharacterNotifications(2)[0].body).containEql('Хиты полностью восстановлены');
      expect(workModel.activeAbilities.length).to.equal(0);
    }
  });

  it('Ground Heal expired', async () => {
    await fixture.saveCharacter({ magic: 10 });
    await fixture.addCharacterFeature('ground-heal');
    await fixture.sendCharacterEvent({ eventType: 'castSpell', data: { id: 'ground-heal', location: { id: 0, manaLevel: 0 }, power: 2 } });
    await fixture.advanceTime(duration(20, 'minutes'));
    const { workModel } = await fixture.getCharacter();
    expect(workModel.activeAbilities.length).to.equal(0);
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
      expect(fixture.getCharacterNotifications(1).length).to.equal(1);
      expect(workModel.history.length).to.equal(1); // Spell casted
      expect(workModel.magic).to.equal(-6);
    }

    {
      expect(fixture.getCharacterNotifications(2).length).to.equal(1);
      expect(fixture.getCharacterNotifications(2)[0].body).containEql('увеличены на 4');
      const { workModel } = await fixture.getCharacter(2);
      expect(workModel.history.length).to.equal(1); // Hp restored
      expect(workModel.maxHp).to.equal(6); // Not 7 as global maximum is 6
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
      expect(fixture.getCharacterNotifications().length).to.equal(1);
      expect(fixture.getCharacterNotifications()[0].body).containEql('на 3 на 30 минут');
      expect(workModel.maxHp).to.equal(5);
    }

    {
      await fixture.advanceTime(duration(30, 'minutes'));
      const { workModel } = await fixture.getCharacter();
      expect(workModel.maxHp).to.equal(2);
    }
  });

  it('Trackpoint', async () => {
    await fixture.saveCharacter({ modelId: '1' });
    await fixture.addCharacterFeature('dummy-light-heal', 1);
    await fixture.addCharacterFeature('fireball', 1);

    await fixture.saveCharacter({ modelId: '2' });
    await fixture.addCharacterFeature('ground-heal', 2);

    await fixture.sendCharacterEvent(
      { eventType: 'castSpell', data: { id: 'dummy-light-heal', location: { id: 0, manaLevel: 0 }, power: 2 } },
      1,
    );
    await fixture.advanceTime(duration(2, 'minutes'));
    await fixture.sendCharacterEvent({ eventType: 'castSpell', data: { id: 'fireball', location: { id: 0, manaLevel: 0 }, power: 4 } }, 1);
    await fixture.advanceTime(duration(15, 'minutes'));
    await fixture.sendCharacterEvent(
      { eventType: 'castSpell', data: { id: 'ground-heal', location: { id: 0, manaLevel: 0 }, power: 6 } },
      2,
    );

    await fixture.saveCharacter({ modelId: '3', magic: 5 });
    await fixture.addCharacterFeature('trackpoint', 3);

    const { workModel, tableResponse } = await fixture.sendCharacterEvent(
      { eventType: 'castSpell', data: { id: 'trackpoint', location: { id: 0, manaLevel: 0 }, power: 5 } },
      3,
    );
    expect(workModel.magic).to.equal(-12);
    expect(tableResponse.length).to.equal(2);
    expect(tableResponse).containDeep([
      {
        spellName: 'Fireball',
        timestamp: 120000,
        power: 4,
        magicFeedback: 8,
      },
      {
        spellName: 'Ground Heal',
        timestamp: 1020000,
        power: 6,
        magicFeedback: 9,
      },
    ]);

    for (const entry of tableResponse) {
      const aura: string = entry.casterAura;
      expect(aura).match(
        /[a-z*][a-z*][a-z*][a-z*]-[a-z*][a-z*][a-z*][a-z*]-[a-z*][a-z*][a-z*][a-z*]-[a-z*][a-z*][a-z*][a-z*]-[a-z*][a-z*][a-z*][a-z*]/,
      );
      expect((aura.match(/[a-z]/g) ?? []).length).to.equal(7);
    }
  });

  it('Trackpoint against Light Step', async () => {
    await fixture.saveCharacter({ modelId: '1' });
    await fixture.addCharacterFeature('light-step', 1);
    await fixture.addCharacterFeature('fireball', 1);

    await fixture.saveCharacter({ modelId: '2', magic: 10, magicStats: { auraReadingMultiplier: 2.0 } });
    await fixture.addCharacterFeature('trackpoint', 2);

    await fixture.advanceTime(duration(2, 'minutes'));
    await fixture.sendCharacterEvent({ eventType: 'castSpell', data: { id: 'fireball', location: { id: 0, manaLevel: 0 }, power: 4 } }, 1);

    // power 8 + auraReadingMultiplier 2.0 gives us 100% read
    const { workModel, tableResponse } = await fixture.sendCharacterEvent(
      { eventType: 'castSpell', data: { id: 'trackpoint', location: { id: 0, manaLevel: 0 }, power: 8 } },
      2,
    );
    expect(workModel.magic).to.equal(-9);
    expect(tableResponse.length).to.equal(1);
    expect(tableResponse).containDeep([
      {
        spellName: 'Fireball',
        timestamp: 120000,
        power: 4,
        magicFeedback: 8,
      },
    ]);

    for (const entry of tableResponse) {
      const aura: string = entry.casterAura;
      expect(aura).match(
        /[a-z*][a-z*][a-z*][a-z*]-[a-z*][a-z*][a-z*][a-z*]-[a-z*][a-z*][a-z*][a-z*]-[a-z*][a-z*][a-z*][a-z*]-[a-z*][a-z*][a-z*][a-z*]/,
      );
      expect((aura.match(/[a-z]/g) ?? []).length).to.equal(12);
    }
  });

  it('Ritual with 2 participants increase power by 1', async () => {
    await fixture.saveCharacter({ modelId: '1' });
    await fixture.addCharacterFeature('ritual-magic', 1);
    await fixture.addCharacterFeature('ground-heal', 1);

    await fixture.saveCharacter({ modelId: '2' });
    await fixture.saveCharacter({ modelId: '3' });

    const { workModel } = await fixture.sendCharacterEvent(
      { eventType: 'castSpell', data: { id: 'ground-heal', location: { id: 0, manaLevel: 0 }, power: 4, ritualMembersIds: ['2', '3'] } },
      1,
    );
    expect(workModel.activeAbilities.length).to.equal(1);
    expect(workModel.activeAbilities[0].validUntil).to.equal(600 * 6 * 1000); // power was 4, but 2 ritual participants add +2
  });

  it('Ritual with agnus dei', async () => {
    await fixture.saveCharacter({ modelId: '1' });
    await fixture.addCharacterFeature('ritual-magic', 1);
    await fixture.addCharacterFeature('ground-heal', 1);

    await fixture.saveCharacter({ modelId: '2' });
    await fixture.addCharacterFeature('agnus-dei', 2);
    await fixture.saveCharacter({ modelId: '3' });

    const { workModel } = await fixture.sendCharacterEvent(
      { eventType: 'castSpell', data: { id: 'ground-heal', location: { id: 0, manaLevel: 0 }, power: 4, ritualMembersIds: ['2', '3'] } },
      1,
    );
    expect(workModel.activeAbilities.length).to.equal(1);
    expect(workModel.activeAbilities[0].validUntil).to.equal(600 * 6 * 1000); // power was 4, but ritual participants add +2
  });

  it('Blood ritual', async () => {
    await fixture.saveCharacter({ modelId: '1', magic: 5 });
    await fixture.addCharacterFeature('bathory-charger', 1);
    await fixture.addCharacterFeature('ground-heal', 1);

    await fixture.saveCharacter({ modelId: '2', healthState: 'wounded' });

    const { workModel } = await fixture.sendCharacterEvent(
      { eventType: 'castSpell', data: { id: 'ground-heal', location: { id: 0, manaLevel: 0 }, power: 4, ritualVictimIds: ['2'] } },
      1,
    );
    expect(workModel.magic).to.equal(2);
    expect(workModel.passiveAbilities.length).to.equal(3);
    expect(workModel.magicStats.maxPowerBonus).to.equal(1);
    expect(workModel.magicStats.feedbackMultiplier).to.equal(1.0 / 7.0);

    // TODO(https://trello.com/c/bzPOYhyP/171-реализовать-кровавую-ритуальную-магию-bathory-charger) Implement and enable
    // expect((await fixture.getCharacter('2')).workModel.healthState).equal('clinically_dead');
    // expect((await fixture.getCharacter('2')).workModel.essence).equal(500);
  });

  it('Blood ritual requires wounded victims', async () => {
    await fixture.saveCharacter({ modelId: '1', magic: 5 });
    await fixture.addCharacterFeature('bathory-charger', 1);
    await fixture.addCharacterFeature('ground-heal', 1);

    const states: HealthState[] = ['healthy', 'clinically_dead', 'biologically_dead'];
    for (const healthState of states) {
      await fixture.saveCharacter({ modelId: '2', healthState });
      const message = await fixture.sendCharacterEventExpectingError(
        { eventType: 'castSpell', data: { id: 'ground-heal', location: { id: 0, manaLevel: 0 }, power: 4, ritualVictimIds: ['2'] } },
        1,
      );
      expect(message).containEql('должны быть в тяжране');
    }
  });

  it('Tempus Fugit', async () => {
    await fixture.saveCharacter({ modelId: '1' });
    await fixture.addCharacterFeature('ground-heal', 1);
    await fixture.addCharacterFeature('fireball', 1);
    await fixture.addCharacterFeature('tempus-fugit', 1);

    await fixture.advanceTime(duration(600, 'seconds'));
    await fixture.sendCharacterEvent({ eventType: 'castSpell', data: { id: 'fireball', location: { id: 0, manaLevel: 0 }, power: 4 } }, 1);

    await fixture.advanceTime(duration(700, 'seconds'));
    await fixture.sendCharacterEvent(
      { eventType: 'castSpell', data: { id: 'ground-heal', location: { id: 0, manaLevel: 0 }, power: 4 } },
      1,
    );

    await fixture.advanceTime(duration(300, 'seconds'));
    await fixture.sendCharacterEvent(
      { eventType: 'castSpell', data: { id: 'tempus-fugit', location: { id: 0, manaLevel: 0 }, power: 2 } },
      1,
    );

    const { workModel } = await fixture.getLocation();
    expect(workModel.spellTraces).containDeep([
      {
        timestamp: 600000,
        spellName: 'Fireball',
      },
      {
        timestamp: (1300 - 480) * 1000,
        spellName: 'Ground Heal',
      },
      {
        timestamp: (1600 - 480) * 1000,
        spellName: 'Tempus Fugit',
      },
    ]);
  });

  it('Brasilia', async () => {
    await fixture.saveCharacter({ modelId: '1' });
    await fixture.addCharacterFeature('ground-heal', 1);
    await fixture.addCharacterFeature('fireball', 1);
    await fixture.addCharacterFeature('brasilia', 1);

    await fixture.advanceTime(duration(200, 'seconds'));
    await fixture.sendCharacterEvent(
      { eventType: 'castSpell', data: { id: 'ground-heal', location: { id: 0, manaLevel: 0 }, power: 4 } },
      1,
    );

    await fixture.advanceTime(duration(300, 'seconds'));
    await fixture.sendCharacterEvent({ eventType: 'castSpell', data: { id: 'fireball', location: { id: 0, manaLevel: 0 }, power: 2 } }, 1);

    await fixture.sendCharacterEvent({ eventType: 'castSpell', data: { id: 'brasilia', location: { id: 0, manaLevel: 0 }, power: 1 } }, 1);

    await fixture.advanceTime(duration(60, 'seconds'));

    const { workModel } = await fixture.getLocation();
    expect(workModel.spellTraces).containDeep([
      {
        timestamp: -100000,
        spellName: 'Ground Heal',
      },
      {
        timestamp: 200000,
        spellName: 'Fireball',
      },
      {
        timestamp: 200000,
        spellName: 'Brasilia',
      },
    ]);
  });

  it('Frog skin', async () => {
    await fixture.saveCharacter({ modelId: '1', charisma: 5, magic: 10 });
    await fixture.saveCharacter({ modelId: '2', charisma: 3 });
    await fixture.addCharacterFeature('frog-skin', 1);
    {
      const { workModel } = await fixture.sendCharacterEvent(
        { eventType: 'castSpell', data: { id: 'frog-skin', location: { id: 0, manaLevel: 0 }, targetCharacterId: '2', power: 2 } },
        1,
      );
      expect(workModel.charisma).equal(5);
    }

    {
      const { workModel } = await fixture.getCharacter(2);
      expect(workModel.charisma).equal(2);
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
    const { workModel } = await fixture.sendCharacterEvent({
      eventType: 'castSpell',
      data: { id: 'fireball', location: { id: 0, manaLevel: 5 }, power: 3, reagentIds },
    });
    expect(workModel.magic).equal(2);

    for (const modelId of reagentIds) {
      const qr = await fixture.getQrCode(modelId);
      expect(qr.workModel.type).equal('box');
    }
  });

  it('Fireball', async () => {
    await fixture.saveCharacter({ magic: 10 });
    await fixture.addCharacterFeature('fireball');
    {
      const { workModel } = await fixture.sendCharacterEvent({
        eventType: 'castSpell',
        data: { id: 'fireball', location: { id: 0, manaLevel: 0 }, power: 3 },
      });
      expect(workModel.magic).equal(-5);
    }
  });

  describe('Magic feedback calculation', function() {
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

      expect(feedback).containDeep({ amount: 18, duration: 93 });
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

      expect(feedback).containDeep({ amount: 4, duration: 16 });
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

      expect(feedback).containDeep({ amount: 12, duration: 65 });
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

      expect(feedback).containDeep({ amount: 12, duration: 65 });
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

      expect(feedback).containDeep({ amount: 0, duration: 4 });
    });
  });
});
