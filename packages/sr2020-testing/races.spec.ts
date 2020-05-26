import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';

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
});
