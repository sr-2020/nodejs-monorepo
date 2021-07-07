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

  it('Arr-ow', async () => {
    await fixture.saveCharacter();
    await fixture.addCharacterFeature('arr-ow');

    {
      const { workModel } = await fixture.useAbility({ id: 'arr-ow' });
      expect(workModel.passiveAbilities).toContainEqual(
        expect.objectContaining({
          id: 'arrowgant-effect',
          validUntil: 10 * 60 * 1000,
        }),
      );
    }
  });

  it('Undiena', async () => {
    await fixture.saveCharacter();
    await fixture.addCharacterFeature('undiena');

    {
      const { workModel } = await fixture.useAbility({ id: 'undiena' });
      expect(workModel.activeAbilities).toContainEqual(
        expect.objectContaining({
          id: 'ground-heal-ability',
          validUntil: 30 * 60 * 1000,
        }),
      );
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
});
