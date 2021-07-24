import { TestFixture } from './fixture';

import { duration } from 'moment';

describe('Active abilities', function () {
  let fixture: TestFixture;

  beforeEach(async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Trackpointer', async () => {
    await fixture.saveLocation({ modelId: '0', aura: 'abaabcbbcdccdeddefee' });

    await fixture.saveCharacter({ modelId: '1', magic: 100 });
    await fixture.addCharacterFeature('fireball', 1);
    await fixture.addCharacterFeature('ground-heal', 1);

    await fixture.saveCharacter({ modelId: '2' });
    await fixture.addCharacterFeature('fast-charge', 2);

    await fixture.sendCharacterEvent(
      { eventType: 'castSpell', data: { id: 'ground-heal', location: { id: 0, manaLevel: 10 }, power: 2 } },
      1,
    );
    await fixture.advanceTime(duration(10, 'minutes'));
    await fixture.sendCharacterEvent({ eventType: 'castSpell', data: { id: 'fireball', location: { id: 0, manaLevel: 10 }, power: 4 } }, 1);
    await fixture.advanceTime(duration(20, 'minutes'));
    await fixture.sendCharacterEvent(
      { eventType: 'castSpell', data: { id: 'fast-charge', location: { id: 0, manaLevel: 10 }, power: 6 } },
      2,
    );

    await fixture.saveCharacter({ modelId: '3', magic: 5 });
    await fixture.addCharacterFeature('trackpointer', 3);

    const { tableResponse } = await fixture.useAbility({ id: 'trackpointer', location: { id: 0, manaLevel: 10 } }, '3');
    expect(tableResponse.length).toBe(2);
    expect(tableResponse).toContainEqual(
      expect.objectContaining({
        spellName: 'Fireball (S)',
        timestamp: 600000,
        power: 4,
        magicFeedback: 10,
      }),
    );
    expect(tableResponse).toContainEqual(
      expect.objectContaining({
        spellName: 'Fast charge (S)',
        timestamp: 1800000,
        power: 6,
        magicFeedback: 11,
      }),
    );

    for (const entry of tableResponse) {
      const aura: string = entry.casterAura;
      expect((aura.match(/[a-z]/g) ?? []).length).toBe(8);
    }
  });

  it('Surge the unclean', async () => {
    await fixture.saveCharacter({ modelId: '1', magic: 3 });
    await fixture.addCharacterFeature('surge-the-unclean', '1');

    await fixture.saveCharacter({ modelId: '2', resonance: 5 });

    {
      await fixture.useAbility({ id: 'surge-the-unclean', targetCharacterId: '2' }, '1');
      const { workModel } = await fixture.getCharacter('2');
      expect(workModel.resonance).toBe(2);
    }
  });

  it('Trackeeteer', async () => {
    await fixture.saveLocation({ modelId: '0', aura: 'abaabcbbcdccdeddefee' });

    await fixture.saveCharacter({ modelId: '1', magic: 100 });
    await fixture.addCharacterFeature('fireball', 1);
    await fixture.addCharacterFeature('ground-heal', 1);

    await fixture.saveCharacter({ modelId: '2' });
    await fixture.addCharacterFeature('fast-charge', 2);

    await fixture.sendCharacterEvent(
      { eventType: 'castSpell', data: { id: 'ground-heal', location: { id: 0, manaLevel: 10 }, power: 2 } },
      1,
    );
    await fixture.advanceTime(duration(10, 'minutes'));
    await fixture.sendCharacterEvent({ eventType: 'castSpell', data: { id: 'fireball', location: { id: 0, manaLevel: 10 }, power: 4 } }, 1);
    await fixture.advanceTime(duration(10, 'minutes'));
    await fixture.sendCharacterEvent(
      { eventType: 'castSpell', data: { id: 'fast-charge', location: { id: 0, manaLevel: 10 }, power: 6 } },
      2,
    );

    await fixture.saveCharacter({ modelId: '3', magic: 5 });
    await fixture.addCharacterFeature('trackeeteer', 3);

    const { tableResponse } = await fixture.useAbility({ id: 'trackeeteer', location: { id: 0, manaLevel: 10 } }, '3');
    expect(tableResponse.length).toBe(2);
    expect(tableResponse).toContainEqual(
      expect.objectContaining({
        spellName: 'Fireball (S)',
        timestamp: 600000,
        power: 4,
        magicFeedback: 10,
      }),
    );
    expect(tableResponse).toContainEqual(
      expect.objectContaining({
        spellName: 'Fast charge (S)',
        timestamp: 1200000,
        power: 6,
        magicFeedback: 11,
      }),
    );

    for (const entry of tableResponse) {
      const aura: string = entry.casterAura;
      expect((aura.match(/[a-z]/g) ?? []).length).toBe(16);
    }
  });

  it('Surge the unclean', async () => {
    await fixture.saveCharacter({ modelId: '1', magic: 3 });
    await fixture.addCharacterFeature('surge-the-unclean', '1');

    await fixture.saveCharacter({ modelId: '2', resonance: 5 });

    {
      await fixture.useAbility({ id: 'surge-the-unclean', targetCharacterId: '2' }, '1');
      const { workModel } = await fixture.getCharacter('2');
      expect(workModel.resonance).toBe(2);
    }
  });

  it('Reefwise', async () => {
    await fixture.saveCharacter({ modelId: '1', magic: 10 });
    await fixture.addCharacterFeature('reefwise', '1');
    await fixture.saveLocation({ modelId: '7', aura: 'abaabcbbcdccdeddefee' });

    {
      const { workModel } = await fixture.useAbility({ id: 'reefwise', location: { id: 7, manaLevel: 5 } }, '1');
      expect(fixture.getCharacterNotifications('1')[0].body).toContain('abaa-bcbb-cdcc-dedd-efee');
      expect(workModel.history[1].shortText).toBe('abaa-bcbb-cdcc-dedd-efee');
    }
  });

  it('Auriel', async () => {
    await fixture.saveCharacter({ modelId: '1', magic: 10, maxHp: 2 });
    await fixture.addCharacterFeature('auriel', '1');
    await fixture.saveCharacter({ modelId: '2', magicStats: { auraMask: 10 } });
    await fixture.saveCharacter({ modelId: '3', magicStats: { auraMask: 20 } });

    //95-5*10=45% => should by 11* in result
    {
      const { workModel } = await fixture.useAbility({ id: 'auriel', targetCharacterId: '2' }, '1');
      expect(fixture.getCharacterNotifications('1').length).toBe(1);
      expect(fixture.getCharacterNotifications('1')[0].body.split('*').length - 1).toBe(11);
    }

    //waiting for cooldown
    fixture.advanceTime(duration(10, 'minutes'));
    //95-5*20=0% => should by 20* in result
    {
      const { workModel } = await fixture.useAbility({ id: 'auriel', targetCharacterId: '3' }, '1');
      expect(fixture.getCharacterNotifications('1').length).toBe(1);
      expect(fixture.getCharacterNotifications('1')[0].body.split('*').length - 1).toBe(20);
    }
  });

  it('Get high', async () => {
    await fixture.saveCharacter({ modelId: '1', magic: 3 });
    await fixture.addCharacterFeature('get-high', '1');

    await fixture.saveCharacter({ modelId: '2', magicStats: { recoverySpeedMultiplier: 1 } });
    const { workModel } = await fixture.getCharacter('2');
    expect(workModel.magicStats.recoverySpeedMultiplier).toBe(1);

    {
      await fixture.useAbility({ id: 'get-high', targetCharacterId: '2' }, '1');
      const { workModel } = await fixture.getCharacter('2');
      expect(workModel.magicStats.recoverySpeedMultiplier).toBe(1.5);
    }
  });

  it('Get low', async () => {
    await fixture.saveCharacter({ modelId: '1', magic: 3 });
    await fixture.addCharacterFeature('get-low', '1');

    await fixture.saveCharacter({ modelId: '2', magicStats: { feedbackMultiplier: 1 } });

    {
      await fixture.useAbility({ id: 'get-low', targetCharacterId: '2' }, '1');
      const { workModel } = await fixture.getCharacter('2');
      expect(workModel.magicStats.feedbackMultiplier).toBe(0.3);
    }
  });

  it('Celestial song', async () => {
    await fixture.saveCharacter({ modelId: '1', magic: 3 });
    await fixture.addCharacterFeature('celestial-song', '1');

    await fixture.saveCharacter({ modelId: '2', magicStats: { participantCoefficient: 1 } });
    await fixture.addCharacterFeature('agnus-dei', '2');

    {
      await fixture.useAbility({ id: 'celestial-song', targetCharacterId: '2' }, '1');
      const { workModel } = await fixture.getCharacter('2');
      expect(workModel.magicStats.participantCoefficient).toBe(15);
    }
  });

  it('Werewolf activated', async () => {
    await fixture.saveCharacter({ modelId: '1' });
    await fixture.addCharacterFeature('meta-werewolf', '1');
    await fixture.addCharacterFeature('strongest-blood', '1');

    await fixture.saveCharacter({ modelId: '2' });
    await fixture.addCharacterFeature('meta-werewolf', '2');

    await fixture.saveCharacter({ modelId: '3' });
    await fixture.addCharacterFeature('strong-blood', '3');
    await fixture.addCharacterFeature('meta-werewolf', '3');

    //werewolf wasn't activated, no extra victim bonus, just troll's
    {
      const { workModel } = await fixture.getCharacter('1');
      expect(workModel.magicStats.victimCoefficient).toBe(5);
    }

    //werewolf was activated, there is big extra victim bonus
    {
      const { workModel } = await fixture.useAbility({ id: 'meta-werewolf' }, '2');
      expect(fixture.getCharacterNotifications('2')[0].body).toContain('На 60 минут ты принял свой истинный облик');
      expect(workModel.modifiers).toContainEqual(
        expect.objectContaining({
          amount: 10,
          effects: [
            {
              enabled: true,
              handler: 'multiplyVictimCoefficient',
              type: 'normal',
            },
          ],
        }),
      );
      expect(workModel.magicStats.victimCoefficient).toBe(10);
    }

    //werewolf was activated on ork, there is huge extra victim bonus
    {
      const { workModel } = await fixture.useAbility({ id: 'meta-werewolf' }, '3');
      expect(workModel.magicStats.victimCoefficient).toBe(30);
    }
  });

  it('I will survive recovery', async () => {
    await fixture.saveCharacter({ magic: 10 });
    await fixture.saveLocation({ modelId: '7' });

    await fixture.addCharacterFeature('i-will-survive');

    await fixture.useAbility({ id: 'i-will-survive', location: { id: 7, manaLevel: 5 } });
    await fixture.sendCharacterEvent({ eventType: 'wound', data: {} });

    expect((await fixture.getCharacter()).workModel.healthState).toBe('wounded');
    await fixture.advanceTime(duration(31, 'second'));
    expect((await fixture.getCharacter()).workModel.healthState).toBe('healthy');
  });

  it('Ground Heal - Эффект', async () => {
    await fixture.saveCharacter({ modelId: '1', magic: 10 });
    await fixture.addCharacterFeature('ground-heal-ability', 1);

    await fixture.saveCharacter({ modelId: '2', healthState: 'wounded' });
    await fixture.saveCharacter({ modelId: '3', healthState: 'clinically_dead' });

    expect((await fixture.getCharacter('2')).workModel.healthState).toBe('wounded');
    await fixture.useAbility({ id: 'ground-heal-ability', targetCharacterId: '2' }, '1');
    expect((await fixture.getCharacter('2')).workModel.healthState).toBe('healthy');
    expect(fixture.getCharacterNotifications('2')[0].body).toContain('Хиты полностью восстановлены');

    await fixture.advanceTime(duration(31, 'second'));

    expect((await fixture.getCharacter('3')).workModel.healthState).toBe('clinically_dead');
    await fixture.sendCharacterEventExpectingError(
      { eventType: 'useAbility', data: { id: 'ground-heal-ability', targetCharacterId: '3' } },
      '1',
    );
    expect((await fixture.getCharacter('3')).workModel.healthState).toBe('clinically_dead');
  });

  it('Silentium est aurum', async () => {
    await fixture.saveCharacter({ modelId: '1' }); // Ability user
    await fixture.saveCharacter({ modelId: '2' }); // Target
    const startingAura = (await fixture.getCharacter('2')).workModel.magicStats.aura;

    await fixture.addCharacterFeature('silentium-est-aurum', '1');
    await fixture.useAbility({ id: 'silentium-est-aurum', targetCharacterId: '2' }, '1');

    {
      const aura = (await fixture.getCharacter('2')).workModel.magicStats.aura;
      expect(aura).not.toBe(startingAura);
      expect(aura.length).toBe(startingAura.length);
      let sameCharacters = 0;
      for (let i = 0; i < aura.length; ++i) {
        expect(aura[i].match(/[a-z]/));
        if (aura[i] == startingAura[i]) sameCharacters++;
      }
      expect(sameCharacters).toBeGreaterThanOrEqual(aura.length * 0.8);
      expect(sameCharacters).toBeLessThan(aura.length);
    }

    await fixture.advanceTime(duration(1, 'hour'));

    {
      const aura = (await fixture.getCharacter('2')).workModel.magicStats.aura;
      expect(aura).toBe(startingAura);
    }
  });
  it('Aurma', async () => {
    await fixture.saveCharacter({ modelId: '1' }); // Ability user
    await fixture.saveCharacter({ modelId: '2' }); // Target
    const startingAura = (await fixture.getCharacter('2')).workModel.magicStats.aura;

    await fixture.addCharacterFeature('aurma', '1');
    await fixture.useAbility({ id: 'aurma', targetCharacterId: '2' }, '1');

    {
      const aura = (await fixture.getCharacter('2')).workModel.magicStats.aura;
      expect(aura).not.toBe(startingAura);
      expect(aura.length).toBe(startingAura.length);
      let sameCharacters = 0;
      for (let i = 0; i < aura.length; ++i) {
        expect(aura[i].match(/[a-z]/));
        if (aura[i] == startingAura[i]) sameCharacters++;
      }
      expect(sameCharacters).toBeLessThanOrEqual(aura.length * 0.7);
      expect(sameCharacters).toBeLessThan(aura.length);
    }

    await fixture.advanceTime(duration(80, 'minutes'));

    {
      const aura = (await fixture.getCharacter('2')).workModel.magicStats.aura;
      expect(aura).toBe(startingAura);
    }
  });

  it('Astralopithecus', async () => {
    await fixture.saveCharacter({ modelId: '1' });
    await fixture.addCharacterFeature('astralopithecus', '1');

    {
      const { workModel } = await fixture.useAbility({ id: 'astralopithecus' }, 1);
      expect(workModel.passiveAbilities).toContainEqual(
        expect.objectContaining({
          id: 'astralopithecus-rage',
          validUntil: 20 * 60 * 1000,
        }),
      );
    }
  });

  it('Undiena', async () => {
    await fixture.saveCharacter({ modelId: '1' });
    await fixture.addCharacterFeature('undiena', '1');

    await fixture.saveCharacter({ modelId: '2', healthState: 'wounded' });

    {
      await fixture.useAbility({ id: 'undiena', targetCharacterId: '2' }, '1');
      expect((await fixture.getCharacter('2')).workModel.healthState).toBe('healthy');
    }
  });

  it('Aval festival', async () => {
    await fixture.saveCharacter();
    await fixture.addCharacterFeature('aval-festival');

    {
      const { workModel } = await fixture.useAbility({ id: 'aval-festival' });
      expect(workModel.passiveAbilities).toContainEqual(
        expect.objectContaining({
          id: 'avalanche-able',
          validUntil: 3 * 60 * 1000,
        }),
      );
    }
  });

  it('Date of birds', async () => {
    await fixture.saveCharacter();
    await fixture.addCharacterFeature('date-of-birds');

    {
      const { workModel } = await fixture.useAbility({ id: 'date-of-birds' });
      expect(workModel.passiveAbilities).toContainEqual(
        expect.objectContaining({
          id: 'birds-able',
          validUntil: 15 * 60 * 1000,
        }),
      );
    }
  });

  it('How much is the pssh', async () => {
    await fixture.saveCharacter();
    await fixture.addCharacterFeature('how-much-is-the-pssh');
    await fixture.saveLocation();

    {
      const { workModel } = await fixture.useAbility({ id: 'how-much-is-the-pssh', location: { id: '0', manaLevel: 5 } });
      expect(fixture.getCharacterNotifications()[0].body).toContain('Сейчас здесь мана на уровне: 5');
    }
  });

  it('I feel it in the water', async () => {
    await fixture.saveCharacter();
    await fixture.addCharacterFeature('i-feel-it-in-the-water');
    await fixture.saveLocation();

    {
      const { workModel } = await fixture.useAbility({ id: 'i-feel-it-in-the-water', location: { id: '0', manaLevel: 4 } });
      expect(fixture.getCharacterNotifications()[0].body).toContain('Сейчас здесь мана на уровне: 4');
    }
  });

  it('Finish him on body', async () => {
    await fixture.saveLocation();
    await fixture.saveCharacter({ modelId: '1' });
    await fixture.addCharacterFeature('finish-him', '1');

    await fixture.saveCharacter({ modelId: '2', healthState: 'wounded' });

    await fixture.useAbility({ id: 'finish-him', location: { id: '0', manaLevel: 5 }, targetCharacterId: '2' }, '1');

    expect((await fixture.getCharacter('2')).workModel.healthState).toBe('clinically_dead');
  });

  it('Finish him does not work on healthy', async () => {
    await fixture.saveLocation();
    await fixture.saveCharacter({ modelId: '1' });
    await fixture.addCharacterFeature('finish-him', '1');

    await fixture.saveCharacter({ modelId: '2', healthState: 'healthy' });

    await fixture.sendCharacterEventExpectingError(
      { eventType: 'useAbility', data: { id: 'finish-him', location: { id: '0', manaLevel: 5 }, targetCharacterId: '2' } },
      '1',
    );

    expect((await fixture.getCharacter('2')).workModel.healthState).toBe('healthy');
  });

  it('Repoman', async () => {
    await fixture.saveCharacter({ modelId: '1' }); // victim

    await fixture.saveCharacter({ modelId: '2', intelligence: 10 }); // repoman
    await fixture.addCharacterFeature('repoman-active', '2');

    await fixture.saveCharacter({ modelId: '3', rigging: { implantsBonus: 100 }, drones: { maxDifficulty: 100, autodocBonus: 100 } }); // rigger
    await fixture.addCharacterFeature('arch-rigger', '3');
    await fixture.addCharacterFeature('drones-active', '3');

    await fixture.saveQrCode({ modelId: '3' }); // implant
    await fixture.saveQrCode({ modelId: '4' }); // implant
    await fixture.saveQrCode({ modelId: '5' }); // container
    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'cyber-hand-alpha' } }, 3);
    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'cyber-hand-beta' } }, 4);

    await fixture.saveQrCode({ modelId: '6' }); // drone
    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'tool-autodoc-1' } }, '6');
    await fixture.saveQrCode({ modelId: '7' }); // body storage
    await fixture.sendQrCodeEvent({ eventType: 'writeBodyStorage', data: { name: '' } }, '7');
    await fixture.useAbility({ id: 'drones-active', bodyStorageId: '7', droneId: '6' }, '3');

    await fixture.sendCharacterEvent({ eventType: 'riggerInstallImplant', data: { targetCharacterId: '1', qrCode: '3' } }, '3');
    await fixture.sendCharacterEvent({ eventType: 'riggerInstallImplant', data: { targetCharacterId: '1', qrCode: '4' } }, '3');
    await fixture.useAbility({ id: 'repoman-active', targetCharacterId: '1', qrCodeId: '5' }, '2');

    const containerQr = await fixture.getQrCode('5');
    expect(containerQr.workModel).toMatchObject({
      usesLeft: 1,
      type: 'implant',
      data: {
        id: 'cyber-hand-alpha',
      },
    });

    const victim = await fixture.getCharacter('1');
    expect(victim.workModel.implants).not.toContain(expect.objectContaining({ id: 'cyber-hand-beta' }));
  });

  it('Black repoman', async () => {
    await fixture.saveCharacter({ modelId: '1' }); // victim
    await fixture.saveCharacter({ modelId: '2', intelligence: 10 }); // repoman
    await fixture.addCharacterFeature('repoman-black', '2');

    await fixture.saveCharacter({ modelId: '3', rigging: { implantsBonus: 100 }, drones: { maxDifficulty: 100, autodocBonus: 100 } }); // rigger
    await fixture.addCharacterFeature('arch-rigger', '3');
    await fixture.addCharacterFeature('drones-active', '3');

    await fixture.saveQrCode({ modelId: '3' }); // implant
    await fixture.saveQrCode({ modelId: '4' }); // implant
    await fixture.saveQrCode({ modelId: '5' }); // container
    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'cyber-hand-alpha' } }, 3);
    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'cyber-hand-beta' } }, 4);

    await fixture.saveQrCode({ modelId: '6' }); // drone
    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'tool-autodoc-1' } }, '6');
    await fixture.saveQrCode({ modelId: '7' }); // body storage
    await fixture.sendQrCodeEvent({ eventType: 'writeBodyStorage', data: { name: '' } }, '7');
    await fixture.useAbility({ id: 'drones-active', bodyStorageId: '7', droneId: '6' }, '3');

    await fixture.sendCharacterEvent({ eventType: 'riggerInstallImplant', data: { targetCharacterId: '1', qrCode: '3' } }, 3);
    await fixture.sendCharacterEvent({ eventType: 'riggerInstallImplant', data: { targetCharacterId: '1', qrCode: '4' } }, 3);
    await fixture.useAbility({ id: 'repoman-black', targetCharacterId: '1', qrCodeId: '5' }, '2');

    const containerQr = await fixture.getQrCode('5');
    expect(containerQr.workModel).toMatchObject({
      usesLeft: 1,
      type: 'implant',
      data: {
        id: 'cyber-hand-beta',
      },
    });

    const victim = await fixture.getCharacter('1');
    expect(victim.workModel.implants).not.toContain(expect.objectContaining({ id: 'cyber-hand-alpha' }));
  });

  it('Settle backdoor', async () => {
    await fixture.saveLocation({ modelId: '7' });

    await fixture.saveCharacter();
    await fixture.addCharacterFeature('settle-backdoor');

    await fixture.saveQrCode({ modelId: '2' });
    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'sprite-pipe' } }, '2');

    await fixture.saveQrCode({ modelId: '3' });
    await fixture.sendQrCodeEvent({ eventType: 'writeFoundationNode', data: { id: 'birch' } }, '3');

    await fixture.useAbility({ id: 'settle-backdoor', qrCodeId: '2', nodeId: '3', location: { id: 7, manaLevel: 5 } });

    expect(fixture.getPubSubNotifications()).toContainEqual(
      expect.objectContaining({
        topic: 'ability_used',
        body: expect.objectContaining({
          characterId: '0',
          id: 'settle-backdoor',
          qrCodeId: '2',
          qrCode: expect.objectContaining({ data: expect.objectContaining({ id: 'sprite-pipe' }) }),
          nodeId: '3',
          node: expect.objectContaining({ data: { id: 'birch' } }),
        }),
      }),
    );
  });

  it('Sleep check no body', async () => {
    await fixture.saveCharacter(); // attacker
    await fixture.addCharacterFeature('sleep-check');

    await fixture.saveQrCode({ modelId: '7' }); // body storage
    await fixture.sendQrCodeEvent({ eventType: 'writeBodyStorage', data: { name: '' } }, '7');

    const message = await fixture.sendCharacterEventExpectingError({
      eventType: 'useAbility',
      data: { id: 'sleep-check', bodyStorageId: '7' },
    });
    expect(message).toContain('Это телохранилище пусто');
  });

  it('Sleep check with body', async () => {
    await fixture.saveCharacter({ modelId: '1' }); // attacker
    await fixture.addCharacterFeature('sleep-check', '1');

    await fixture.saveCharacter({ modelId: '2' }); // victim
    await fixture.addCharacterFeature('enter-vr', '2');

    await fixture.saveQrCode({ modelId: '7' }); // body storage
    await fixture.sendQrCodeEvent({ eventType: 'writeBodyStorage', data: { name: '' } }, '7');

    await fixture.useAbility({ id: 'enter-vr', bodyStorageId: '7' }, '2');

    await fixture.useAbility({ id: 'sleep-check', bodyStorageId: '7' }, '1');
  });
});
