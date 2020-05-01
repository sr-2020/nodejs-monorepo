import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';
import { duration } from 'moment';

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
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'ground-heal' } });
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
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'ground-heal' } });
    const { workModel } = await fixture.sendCharacterEvent({ eventType: 'forgetAllSpells', data: {} });
    expect(workModel.spells).to.be.empty();
  });

  it('Cast dummy spell', async () => {
    await fixture.saveCharacter({ resonance: 12 });
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'ground-heal' } });
    const { workModel } = await fixture.sendCharacterEvent({ eventType: 'increaseResonanceSpell', data: {} });
    expect(workModel).containDeep({ resonance: 13 });
    expect(fixture.getCharacterNotifications().length).to.equal(1);
  });

  it("Can't enchant already enchanted", async () => {
    await fixture.saveCharacter();
    await fixture.saveQrCode({ type: 'food' });

    await fixture.client
      .post(`/character/model/0`)
      .send({ eventType: 'increaseResonanceSpell', data: { qrCode: 0 } })
      .expect(400);
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
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'scanQr', data: { qrCode: 0 } });
      expect(workModel).containDeep({ resonance: 1 });
      expect(await fixture.getQrCode()).containDeep({ workModel: { usesLeft: 2 } });
    }
  });

  it('Enchant artifact, give it to another character, activate in another location', async () => {
    await fixture.saveCharacter({ modelId: '1' });
    await fixture.saveCharacter({ modelId: '2' });
    await fixture.saveQrCode();
    await fixture.saveLocation({ modelId: '1', manaDensity: 500 });
    await fixture.saveLocation({ modelId: '2', manaDensity: 400 });

    {
      await fixture.sendCharacterEvent({ eventType: 'densityHalveSpell', data: { qrCode: 0, location: { id: 1, manaLevel: 500 } } }, 1);
      expect(await fixture.getLocation(1)).containDeep({ workModel: { manaDensity: 500 } });
    }

    {
      await fixture.sendCharacterEvent({ eventType: 'scanQr', data: { qrCode: 0, location: { id: 2, manaLevel: 400 } } }, 2);
      expect(await fixture.getLocation(2)).containDeep({ workModel: { manaDensity: 200 } });
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
    await fixture.sendCharacterEvent({ eventType: 'fullHealSpell', data: { targetCharacterId: 2 } }, 1);
    expect(fixture.getCharacterNotifications(1).length).to.equal(0);
    expect(fixture.getCharacterNotifications(2).length).to.equal(1);
    expect(fixture.getCharacterNotifications(2)[0].body).containEql('полностью восстановл');
  });

  it('Light Heal self', async () => {
    await fixture.saveCharacter({ magic: 10 });
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'dummy-light-heal' } });
    {
      const { workModel } = await fixture.sendCharacterEvent({
        eventType: 'castSpell',
        data: { id: 'dummy-light-heal', location: { id: 0, manaLevel: 0 }, power: 5 },
      });
      expect(fixture.getCharacterNotifications().length).to.equal(1);
      expect(fixture.getCharacterNotifications()[0].body).containEql('хитов: 5');
      expect(workModel.history.length).to.equal(2); // Spell casted + Hp restored
      expect(workModel.magic).to.equal(3);
    }

    {
      fixture.advanceTime(duration(5, 'days'));
      const { workModel } = await fixture.getCharacter();
      expect(workModel.magic).to.equal(3);
    }
    {
      fixture.advanceTime(duration(10, 'days'));
      const { workModel } = await fixture.getCharacter();
      expect(workModel.magic).to.equal(10);
    }
  });

  it('Light Heal other', async () => {
    await fixture.saveCharacter({ modelId: '1', magic: 7 });
    await fixture.saveCharacter({ modelId: '2' });
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'dummy-light-heal' } }, 1);
    const { workModel } = await fixture.sendCharacterEvent(
      { eventType: 'castSpell', data: { id: 'dummy-light-heal', location: { id: 0, manaLevel: 0 }, targetCharacterId: 2, power: 3 } },
      1,
    );
    expect(fixture.getCharacterNotifications(1).length).to.equal(1);
    expect(workModel.history.length).to.equal(1); // Spell casted
    expect(workModel.magic).to.equal(1);

    expect(fixture.getCharacterNotifications(2).length).to.equal(1);
    expect(fixture.getCharacterNotifications(2)[0].body).containEql('хитов: 3');
    expect((await fixture.getCharacter(2)).workModel.history.length).to.equal(1); // Hp restored
  });

  it('Ground Heal used', async () => {
    await fixture.saveCharacter({ modelId: '1', magic: 10 });
    await fixture.saveCharacter({ modelId: '2', healthState: 'wounded' });
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'ground-heal' } }, 1);

    fixture.advanceTime(duration(5, 'minutes'));

    {
      const { workModel } = await fixture.sendCharacterEvent(
        { eventType: 'castSpell', data: { id: 'ground-heal', location: { id: 0, manaLevel: 0 }, power: 2 } },
        1,
      );
      expect(fixture.getCharacterNotifications(1).length).to.equal(1);
      expect(fixture.getCharacterNotifications(1)[0].body).containEql('Ground Heal');
      expect(workModel.activeAbilities.length).to.equal(1);
      expect(workModel.activeAbilities[0].humanReadableName).to.equal('Ground Heal');
      expect(workModel.activeAbilities[0].validUntil).to.equal(1500 * 1000);
      expect(workModel.magic).to.equal(5);
    }

    let abilityId: string;
    {
      // Power 2 is 20 minutes = 1200 seconds.
      fixture.advanceTime(duration(1199, 'seconds'));
      const { workModel } = await fixture.getCharacter(1);
      expect(workModel.activeAbilities.length).to.equal(1);
      expect(workModel.activeAbilities[0].humanReadableName).to.equal('Ground Heal');
      expect(workModel.activeAbilities[0].validUntil).to.equal(1500 * 1000);
      abilityId = workModel.activeAbilities[0].id;
    }

    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: 'useAbility', data: { id: abilityId, targetCharacterId: 2 } }, 1);
      expect(fixture.getCharacterNotifications(1).length).to.equal(1);
      expect(fixture.getCharacterNotifications(1)[0].body).containEql('Ground Heal');
      expect(fixture.getCharacterNotifications(2).length).to.equal(1);
      expect(fixture.getCharacterNotifications(2)[0].body).containEql('Хиты полностью восстановлены');
      expect(workModel.activeAbilities.length).to.equal(0);
    }
  });

  it('Ground Heal expired', async () => {
    await fixture.saveCharacter({ magic: 10 });
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'ground-heal' } });
    await fixture.sendCharacterEvent({ eventType: 'castSpell', data: { id: 'ground-heal', location: { id: 0, manaLevel: 0 }, power: 2 } });
    fixture.advanceTime(duration(20, 'minutes'));
    const { workModel } = await fixture.getCharacter();
    expect(workModel.activeAbilities.length).to.equal(0);
  });

  it('Live long and prosper', async () => {
    await fixture.saveCharacter({ modelId: '1', magic: 10 });
    await fixture.saveCharacter({ modelId: '2', maxHp: 3 });
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'live-long-and-prosper' } }, 1);
    {
      const { workModel } = await fixture.sendCharacterEvent(
        {
          eventType: 'castSpell',
          data: { id: 'live-long-and-prosper', location: { id: 0, manaLevel: 0 }, targetCharacterId: 2, power: 4 },
        },
        1,
      );
      expect(fixture.getCharacterNotifications(1).length).to.equal(1);
      expect(workModel.history.length).to.equal(1); // Spell casted
      expect(workModel.magic).to.equal(3);
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
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'keep-yourself' } });
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
      fixture.advanceTime(duration(30, 'minutes'));
      const { workModel } = await fixture.getCharacter();
      expect(workModel.maxHp).to.equal(2);
    }
  });

  it('Trackpoint', async () => {
    await fixture.saveCharacter({ modelId: '1' });
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'dummy-light-heal' } }, 1);
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'fireball' } }, 1);

    await fixture.saveCharacter({ modelId: '2' });
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'ground-heal' } }, 2);

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
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'trackpoint' } }, 3);

    const { workModel, tableResponse } = await fixture.sendCharacterEvent(
      { eventType: 'castSpell', data: { id: 'trackpoint', location: { id: 0, manaLevel: 0 }, power: 5 } },
      3,
    );
    expect(workModel.magic).to.equal(-2);
    expect(tableResponse.length).to.equal(2);
    expect(tableResponse).containDeep([
      {
        spellName: 'Fireball',
        timestamp: 120000,
        power: 4,
        magicFeedback: 7,
      },
      {
        spellName: 'Ground Heal',
        timestamp: 1020000,
        power: 6,
        magicFeedback: 8,
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
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'light-step' } }, 1);
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'fireball' } }, 1);

    await fixture.saveCharacter({ modelId: '2', magic: 10, magicStats: { auraReadingMultiplier: 2.0 } });
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'trackpoint' } }, 2);

    await fixture.advanceTime(duration(2, 'minutes'));
    await fixture.sendCharacterEvent({ eventType: 'castSpell', data: { id: 'fireball', location: { id: 0, manaLevel: 0 }, power: 4 } }, 1);

    // power 8 + auraReadingMultiplier 2.0 gives us 100% read
    const { workModel, tableResponse } = await fixture.sendCharacterEvent(
      { eventType: 'castSpell', data: { id: 'trackpoint', location: { id: 0, manaLevel: 0 }, power: 8 } },
      2,
    );
    expect(workModel.magic).to.equal(1);
    expect(tableResponse.length).to.equal(1);
    expect(tableResponse).containDeep([
      {
        spellName: 'Fireball',
        timestamp: 120000,
        power: 4,
        magicFeedback: 7,
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
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'ritual-magic' } }, 1);
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'ground-heal' } }, 1);

    await fixture.saveCharacter({ modelId: '2' });
    await fixture.saveCharacter({ modelId: '3' });

    const { workModel } = await fixture.sendCharacterEvent(
      { eventType: 'castSpell', data: { id: 'ground-heal', location: { id: 0, manaLevel: 0 }, power: 4, ritualMembersIds: ['2', '3'] } },
      1,
    );
    expect(workModel.activeAbilities.length).to.equal(1);
    expect(workModel.activeAbilities[0].validUntil).to.equal(600 * 5 * 1000); // power was 4, but 2 ritual participants add +1
  });

  it('Ritual with agnus dei', async () => {
    await fixture.saveCharacter({ modelId: '1' });
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'ritual-magic' } }, 1);
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'ground-heal' } }, 1);

    await fixture.saveCharacter({ modelId: '2' });
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'agnus-dei' } }, 2);
    await fixture.saveCharacter({ modelId: '3' });

    const { workModel } = await fixture.sendCharacterEvent(
      { eventType: 'castSpell', data: { id: 'ground-heal', location: { id: 0, manaLevel: 0 }, power: 4, ritualMembersIds: ['2', '3'] } },
      1,
    );
    expect(workModel.activeAbilities.length).to.equal(1);
    expect(workModel.activeAbilities[0].validUntil).to.equal(600 * 6 * 1000); // power was 4, but ritual participants add +2
  });

  it('Tempus Fugit', async () => {
    await fixture.saveCharacter({ modelId: '1' });
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'ground-heal' } }, 1);
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'fireball' } }, 1);
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'tempus-fugit' } }, 1);

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
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'ground-heal' } }, 1);
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'fireball' } }, 1);
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'brasilia' } }, 1);

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
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'frog-skin' } }, 1);
    {
      const { workModel } = await fixture.sendCharacterEvent(
        { eventType: 'castSpell', data: { id: 'frog-skin', location: { id: 0, manaLevel: 0 }, targetCharacterId: 2, power: 2 } },
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

    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'fireball' } });
    const { workModel } = await fixture.sendCharacterEvent({
      eventType: 'castSpell',
      data: { id: 'fireball', location: { id: 0, manaLevel: 5 }, power: 3, reagentIds },
    });
    expect(workModel.magic).equal(6);

    for (const modelId of reagentIds) {
      const qr = await fixture.getQrCode(modelId);
      expect(qr.workModel.type).equal('empty');
    }
  });
});
