import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';
import { duration } from 'moment';

describe('Race changes', () => {
  let fixture: TestFixture;

  beforeEach('setupApplication', async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Races give proper abilities', async () => {
    await fixture.saveCharacter();
    let { workModel } = await fixture.sendCharacterEvent({ eventType: 'setRace', data: { race: 'meta-norm' } });
    expect(workModel.metarace).equal('meta-norm');
    expect(workModel.passiveAbilities).lengthOf(0);
    expect(workModel.activeAbilities).lengthOf(0);

    ({ workModel } = await fixture.sendCharacterEvent({ eventType: 'setRace', data: { race: 'meta-elf' } }));
    expect(workModel.metarace).equal('meta-elf');
    expect(workModel.passiveAbilities).lengthOf(0);
    expect(workModel.activeAbilities).lengthOf(0);

    ({ workModel } = await fixture.sendCharacterEvent({ eventType: 'setRace', data: { race: 'meta-hmhvv1' } }));
    expect(workModel.metarace).equal('meta-hmhvv1');
    expect(workModel.passiveAbilities).lengthOf(1);
    expect(workModel.passiveAbilities).containDeep([{ id: 'blood-thirst' }]);
    expect(workModel.activeAbilities).lengthOf(1);
    expect(workModel.activeAbilities).containDeep([{ id: 'vampire-feast' }]);

    ({ workModel } = await fixture.sendCharacterEvent({ eventType: 'setRace', data: { race: 'meta-hmhvv3' } }));
    expect(workModel.metarace).equal('meta-hmhvv3');
    expect(workModel.passiveAbilities).lengthOf(1);
    expect(workModel.passiveAbilities).containDeep([{ id: 'meat-hunger' }]);
    expect(workModel.activeAbilities).lengthOf(1);
    expect(workModel.activeAbilities).containDeep([{ id: 'ghoul-feast' }]);
  });

  it('Hungry HMHHV can not use abilities', async () => {
    await fixture.saveCharacter();
    await fixture.sendCharacterEvent({ eventType: 'setRace', data: { race: 'meta-hmhvv1' } });
    await fixture.advanceTime(duration(6, 'hours'));
    const resp = await fixture.client
      .post(`/character/model/0`)
      .send({ eventType: 'useAbility', data: { id: 'vampire-feast' } })
      .expect(400);
    expect(resp.body.error.message).containEql('Недостаточно эссенции');
  });
});
