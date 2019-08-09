import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';

describe('Spells', function() {
  // tslint:disable-next-line: no-invalid-this
  this.timeout(15000);
  let fixture: TestFixture;

  beforeEach('setupApplication', async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Learn and forget dummy spell', async () => {
    await fixture.saveCharacter();
    await fixture.sendCharacterEvent({ eventType: 'learnSpell', data: { spellName: 'dummySpell' } });
    expect(await fixture.getCharacter()).containDeep({ spells: [{ eventType: 'dummySpell' }] });

    await fixture.sendCharacterEvent({ eventType: 'forgetSpell', data: { spellName: 'dummySpell' } });
    expect((await fixture.getCharacter()).spells).to.be.empty();
  });

  it('Forget unlearned spell', async () => {
    await fixture.saveCharacter();
    await fixture.sendCharacterEvent({ eventType: 'forgetSpell', data: { spellName: 'dummySpell' } });
    expect((await fixture.getCharacter()).spells).to.be.empty();
  });

  it('Forget all spells', async () => {
    await fixture.saveCharacter();
    await fixture.sendCharacterEvent({ eventType: 'learnSpell', data: { spellName: 'dummySpell' } });
    await fixture.sendCharacterEvent({ eventType: 'forgetAllSpells', data: {} });
    expect((await fixture.getCharacter()).spells).to.be.empty();
  });

  it('Cast dummy spell', async () => {
    await fixture.saveCharacter({ spellsCasted: 12 });
    await fixture.sendCharacterEvent({ eventType: 'learnSpell', data: { spellName: 'dummySpell' } });
    await fixture.sendCharacterEvent({ eventType: 'dummySpell', data: {} });
    expect(await fixture.getCharacter()).containDeep({ spellsCasted: 13 });
    expect(fixture.getCharacterNotifications().length).to.equal(1);
  });

  it("Can't enchant already enchanted", async () => {
    await fixture.saveCharacter();
    await fixture.saveQrCode({ type: 'something' });

    await fixture.client
      .post(`/character/model/0`)
      .send({ eventType: 'dummySpell', data: { qrCode: 0 } })
      .expect(400);
    expect(fixture.getCharacterNotifications()).to.be.empty();

    expect(await fixture.getQrCode()).containDeep({ type: 'something' });
  });

  it('Enchant artifact and activate it later', async () => {
    await fixture.saveCharacter();
    await fixture.saveQrCode();

    await fixture.sendCharacterEvent({ eventType: 'dummySpell', data: { qrCode: 0 } });
    expect(await fixture.getCharacter()).containDeep({ spellsCasted: 0 });
    expect(await fixture.getQrCode()).containDeep({ usesLeft: 3 });

    await fixture.sendCharacterEvent({ eventType: 'scanQr', data: { qrCode: 0 } });
    expect(await fixture.getCharacter()).containDeep({ spellsCasted: 1 });
    expect(await fixture.getQrCode()).containDeep({ usesLeft: 2 });
  });

  it('Enchant artifact, give it to another character, activate in another location', async () => {
    await fixture.saveCharacter({ modelId: '1', spellsCasted: 0 });
    await fixture.saveCharacter({ modelId: '2', spellsCasted: 0 });
    await fixture.saveQrCode();
    await fixture.saveLocation({ modelId: '1', manaDensity: 500 });
    await fixture.saveLocation({ modelId: '2', manaDensity: 400 });

    await fixture.sendCharacterEvent({ eventType: 'densityHalveSpell', data: { qrCode: 0, locationId: '1' } }, 1);
    expect(await fixture.getCharacter(1)).containDeep({ spellsCasted: 0 });
    expect(await fixture.getLocation(1)).containDeep({ manaDensity: 500 });

    await fixture.sendCharacterEvent({ eventType: 'scanQr', data: { qrCode: 0, locationId: '2' } }, 2);
    expect(await fixture.getCharacter(2)).containDeep({ spellsCasted: 1 });
    expect(await fixture.getLocation(2)).containDeep({ manaDensity: 200 });
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
});
