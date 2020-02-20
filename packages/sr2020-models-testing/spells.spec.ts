import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';

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
      expect(workModel).containDeep({ spells: [{ eventType: 'groundHealSpell' }] });
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
    await fixture.saveQrCode({ type: 'something' });

    await fixture.client
      .post(`/character/model/0`)
      .send({ eventType: 'increaseResonanceSpell', data: { qrCode: 0 } })
      .expect(400);
    expect(fixture.getCharacterNotifications()).to.be.empty();

    expect(await fixture.getQrCode()).containDeep({ workModel: { type: 'something' } });
  });

  it('Enchant artifact and activate it later', async () => {
    await fixture.saveCharacter();
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
      await fixture.sendCharacterEvent({ eventType: 'densityHalveSpell', data: { qrCode: 0, locationId: '1' } }, 1);
      expect(await fixture.getLocation(1)).containDeep({ workModel: { manaDensity: 500 } });
    }

    {
      await fixture.sendCharacterEvent({ eventType: 'scanQr', data: { qrCode: 0, locationId: '2' } }, 2);
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
        data: { id: 'dummy-light-heal', locationId: '0', power: 5 },
      });
      expect(fixture.getCharacterNotifications().length).to.equal(1);
      expect(fixture.getCharacterNotifications()[0].body).containEql('хитов: 5');
      expect(workModel.history.length).to.equal(2); // Spell casted + Hp restored
      expect(workModel.magic).to.equal(7); // Spell casted + Hp restored
    }

    {
      fixture.advanceTime(300);
      const { workModel } = await fixture.getCharacter();
      expect(workModel.magic).to.equal(10);
    }
  });

  it('Light Heal other', async () => {
    await fixture.saveCharacter({ modelId: '1', magic: 7 });
    await fixture.saveCharacter({ modelId: '2' });
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'dummy-light-heal' } }, 1);
    const { workModel } = await fixture.sendCharacterEvent(
      { eventType: 'castSpell', data: { id: 'dummy-light-heal', locationId: '0', targetCharacterId: 2, power: 3 } },
      1,
    );
    expect(fixture.getCharacterNotifications(1).length).to.equal(1);
    expect(workModel.history.length).to.equal(1); // Spell casted
    expect(workModel.magic).to.equal(5);

    expect(fixture.getCharacterNotifications(2).length).to.equal(1);
    expect(fixture.getCharacterNotifications(2)[0].body).containEql('хитов: 3');
    expect((await fixture.getCharacter(2)).workModel.history.length).to.equal(1); // Hp restored
  });

  it('Ground Heal used', async () => {
    await fixture.saveCharacter({ modelId: '1', magic: 10 });
    await fixture.saveCharacter({ modelId: '2', healthState: 'wounded' });
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'ground-heal' } }, 1);

    fixture.advanceTime(300);

    {
      const { workModel } = await fixture.sendCharacterEvent(
        { eventType: 'castSpell', data: { id: 'ground-heal', locationId: '0', power: 2 } },
        1,
      );
      expect(fixture.getCharacterNotifications(1).length).to.equal(1);
      expect(fixture.getCharacterNotifications(1)[0].body).containEql('Ground Heal');
      expect(workModel.activeAbilities.length).to.equal(1);
      expect(workModel.activeAbilities[0].humanReadableName).to.equal('Ground Heal');
      expect(workModel.activeAbilities[0].validUntil).to.equal(1500 * 1000);
      expect(workModel.magic).to.equal(9);
    }

    let abilityEventType: string;
    {
      // Power 2 is 20 minutes = 1200 seconds.
      fixture.advanceTime(1199);
      const { workModel } = await fixture.getCharacter(1);
      expect(workModel.activeAbilities.length).to.equal(1);
      expect(workModel.activeAbilities[0].humanReadableName).to.equal('Ground Heal');
      expect(workModel.activeAbilities[0].validUntil).to.equal(1500 * 1000);
      abilityEventType = workModel.activeAbilities[0].eventType;
      expect(workModel.magic).to.equal(10);
    }

    {
      const { workModel } = await fixture.sendCharacterEvent({ eventType: abilityEventType, data: { targetCharacterId: 2 } }, 1);
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
    await fixture.sendCharacterEvent({ eventType: 'castSpell', data: { id: 'ground-heal', locationId: '0', power: 2 } });
    // Power 2 is 20 minutes = 1200 seconds.
    fixture.advanceTime(1200);
    const { workModel } = await fixture.getCharacter();
    expect(workModel.activeAbilities.length).to.equal(0);
  });

  it('Live long and prosper', async () => {
    await fixture.saveCharacter({ modelId: '1', magic: 10 });
    await fixture.saveCharacter({ modelId: '2', maxHp: 5 });
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'live-long-and-prosper' } }, 1);
    {
      const { workModel } = await fixture.sendCharacterEvent(
        { eventType: 'castSpell', data: { id: 'live-long-and-prosper', locationId: '0', targetCharacterId: 2, power: 4 } },
        1,
      );
      expect(fixture.getCharacterNotifications(1).length).to.equal(1);
      expect(workModel.history.length).to.equal(1); // Spell casted
      expect(workModel.magic).to.equal(8);
    }

    {
      expect(fixture.getCharacterNotifications(2).length).to.equal(1);
      expect(fixture.getCharacterNotifications(2)[0].body).containEql('увеличены на 2');
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
        data: { id: 'keep-yourself', locationId: '0', power: 3 },
      });
      expect(fixture.getCharacterNotifications().length).to.equal(1);
      expect(fixture.getCharacterNotifications()[0].body).containEql('на 3 на 30 минут');
      expect(workModel.maxHp).to.equal(5);
    }

    {
      fixture.advanceTime(30 * 60);
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

    await fixture.sendCharacterEvent({ eventType: 'castSpell', data: { id: 'dummy-light-heal', locationId: '0', power: 2 } }, 1);
    await fixture.advanceTime(2 * 60);
    await fixture.sendCharacterEvent({ eventType: 'castSpell', data: { id: 'fireball', locationId: '0', power: 4 } }, 1);
    await fixture.advanceTime(15 * 60);
    await fixture.sendCharacterEvent({ eventType: 'castSpell', data: { id: 'ground-heal', locationId: '0', power: 6 } }, 2);

    await fixture.saveCharacter({ modelId: '3', magic: 5 });
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'trackpoint' } }, 3);

    const { workModel, tableResponse } = await fixture.sendCharacterEvent(
      { eventType: 'castSpell', data: { id: 'trackpoint', locationId: '0', power: 5 } },
      3,
    );
    expect(workModel.magic).to.equal(2);
    expect(tableResponse.length).to.equal(2);
    expect(tableResponse).containDeep([
      {
        spellName: 'Fireball',
        timestamp: 120000,
        power: 4,
        magicFeedback: 2,
      },
      {
        spellName: 'Ground Heal',
        timestamp: 1020000,
        power: 6,
        magicFeedback: 3,
      },
    ]);

    for (const entry of tableResponse) {
      const aura: string = entry.casterAura;
      expect(aura).match(
        /[a-z?][a-z?][a-z?][a-z?]-[a-z?][a-z?][a-z?][a-z?]-[a-z?][a-z?][a-z?][a-z?]-[a-z?][a-z?][a-z?][a-z?]-[a-z?][a-z?][a-z?][a-z?]/,
      );
      expect((aura.match(/[a-z]/g) ?? []).length).to.equal(7);
    }
  });

  it('Trackpoint against Light Step', async () => {
    await fixture.saveCharacter({ modelId: '1' });
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'light-step' } }, 1);
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'fireball' } }, 1);

    await fixture.saveCharacter({ modelId: '2', magic: 10, auraReadingMultiplier: 2.0 });
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'trackpoint' } }, 2);

    await fixture.advanceTime(2 * 60);
    await fixture.sendCharacterEvent({ eventType: 'castSpell', data: { id: 'fireball', locationId: '0', power: 4 } }, 1);

    // power 8 + auraReadingMultiplier 2.0 gives us 100% read
    const { workModel, tableResponse } = await fixture.sendCharacterEvent(
      { eventType: 'castSpell', data: { id: 'trackpoint', locationId: '0', power: 8 } },
      2,
    );
    expect(workModel.magic).to.equal(6);
    expect(tableResponse.length).to.equal(1);
    expect(tableResponse).containDeep([
      {
        spellName: 'Fireball',
        timestamp: 120000,
        power: 4,
        magicFeedback: 2,
      },
    ]);

    for (const entry of tableResponse) {
      const aura: string = entry.casterAura;
      expect(aura).match(
        /[a-z?][a-z?][a-z?][a-z?]-[a-z?][a-z?][a-z?][a-z?]-[a-z?][a-z?][a-z?][a-z?]-[a-z?][a-z?][a-z?][a-z?]-[a-z?][a-z?][a-z?][a-z?]/,
      );
      expect((aura.match(/[a-z]/g) ?? []).length).to.equal(12);
    }
  });
});
