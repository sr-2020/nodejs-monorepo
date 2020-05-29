import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';

describe('HMHVV abilities', function() {
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
    const { workModel } = await fixture.sendCharacterEvent({ eventType: 'setRace', data: { race: 'meta-hmhvv1' } }, '1');
    expect(workModel.essence).equal(300);

    // Victim
    await fixture.saveCharacter({ modelId: '2', essenceDetails: { max: 600, gap: 450 } });

    // Bite!
    await fixture.useAbility({ id: 'vampire-feast', targetCharacterId: '2' }, '1');

    let vampire = (await fixture.getCharacter('1')).workModel;
    expect(vampire.essence).equal(450);

    const victim = (await fixture.getCharacter('2')).workModel;
    expect(victim.essence).equal(0);
    expect(victim.healthState).equal('clinically_dead');

    // A bit of cow blood now
    await fixture.saveQrCode({ modelId: '3' });
    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'cow-blood' } }, 3);
    await fixture.sendCharacterEvent({ eventType: 'scanQr', data: { qrCode: '3' } }, '1');
    vampire = (await fixture.getCharacter('1')).workModel;
    expect(vampire.essence).equal(550);
  });

  it('Ghoul', async () => {
    // Ghoul
    await fixture.saveCharacter({ modelId: '1' });
    const { workModel } = await fixture.sendCharacterEvent({ eventType: 'setRace', data: { race: 'meta-hmhvv3' } }, '1');
    expect(workModel.essence).equal(300);

    // Victim
    await fixture.saveCharacter({ modelId: '2', essenceDetails: { max: 600, gap: 300 } });

    // Bite!
    await fixture.useAbility({ id: 'ghoul-feast', targetCharacterId: '2' }, '1');

    let ghoul = (await fixture.getCharacter('1')).workModel;
    expect(ghoul.essence).equal(400);

    const victim = (await fixture.getCharacter('2')).workModel;
    expect(victim.essence).equal(200);
    expect(victim.healthState).equal('clinically_dead');

    // A bit of cow blood now
    await fixture.saveQrCode({ modelId: '3' });
    await fixture.sendQrCodeEvent({ eventType: 'createMerchandise', data: { id: 'cow-meat' } }, 3);
    await fixture.sendCharacterEvent({ eventType: 'scanQr', data: { qrCode: '3' } }, '1');
    ghoul = (await fixture.getCharacter('1')).workModel;
    expect(ghoul.essence).equal(500);
  });
});
