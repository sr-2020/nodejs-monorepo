import { TestFixture } from './fixture';

describe('HMHVV abilities', function () {
  let fixture: TestFixture;

  beforeEach(async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Vampire', async () => {
    // Vampire
    await fixture.saveCharacter({ modelId: '1' });
    const { workModel } = await fixture.sendCharacterEvent({ eventType: 'setRace', data: { race: 'meta-vampire' } }, '1');
    expect(workModel.essence).toBe(300);

    // Victim
    await fixture.saveCharacter({ modelId: '2', essenceDetails: { max: 600, gap: 450 } });

    // Bite!
    await fixture.useAbility({ id: 'vampire-feast', targetCharacterId: '2' }, '1');

    let vampire = (await fixture.getCharacter('1')).workModel;
    expect(vampire.essence).toBe(450);

    const victim = (await fixture.getCharacter('2')).workModel;
    expect(victim.essence).toBe(0);
    expect(victim.healthState).toBe('healthy');
    expect(victim.chemo.concentration.vampirium).toBeGreaterThanOrEqual(1000);

    // A bit of cow blood now
    await fixture.saveQrCode({ modelId: '3' });
    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'cow-blood' } }, 3);
    await fixture.sendCharacterEvent({ eventType: 'scanQr', data: { qrCode: '3' } }, '1');
    vampire = (await fixture.getCharacter('1')).workModel;
    expect(vampire.essence).toBe(550);
  });

  it('Ghoul', async () => {
    // Ghoul
    await fixture.saveCharacter({ modelId: '1' });
    const { workModel } = await fixture.sendCharacterEvent({ eventType: 'setRace', data: { race: 'meta-ghoul' } }, '1');
    expect(workModel.essence).toBe(300);

    // Victim
    await fixture.saveCharacter({ modelId: '2', essenceDetails: { max: 600, gap: 300 } });

    // Bite!
    await fixture.useAbility({ id: 'ghoul-feast', targetCharacterId: '2' }, '1');

    let ghoul = (await fixture.getCharacter('1')).workModel;
    expect(ghoul.essence).toBe(400);

    const victim = (await fixture.getCharacter('2')).workModel;
    expect(victim.essence).toBe(200);
    expect(victim.healthState).toBe('clinically_dead');
    expect(victim.chemo.concentration.vampirium).toBe(0);

    // A bit of cow blood now
    await fixture.saveQrCode({ modelId: '3' });
    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'cow-meat' } }, 3);
    await fixture.sendCharacterEvent({ eventType: 'scanQr', data: { qrCode: '3' } }, '1');
    ghoul = (await fixture.getCharacter('1')).workModel;
    expect(ghoul.essence).toBe(500);
  });
});
