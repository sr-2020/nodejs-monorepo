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

    const vampire = (await fixture.getCharacter('1')).workModel;
    expect(vampire.essence).equal(450);

    const victim = (await fixture.getCharacter('2')).workModel;
    expect(victim.essence).equal(0);
    expect(victim.healthState).equal('clinically_dead');
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

    const vampire = (await fixture.getCharacter('1')).workModel;
    expect(vampire.essence).equal(400);

    const victim = (await fixture.getCharacter('2')).workModel;
    expect(victim.essence).equal(200);
    expect(victim.healthState).equal('clinically_dead');
  });
});
