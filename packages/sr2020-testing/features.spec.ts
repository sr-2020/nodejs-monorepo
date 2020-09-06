import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';

describe('Features-related events', function () {
  let fixture: TestFixture;

  beforeEach(async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Add and remove passive ability', async () => {
    await fixture.saveCharacter({ magic: 2 });
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'magic-3' } });
    let c = await fixture.getCharacter();
    expect(c.workModel).containDeep({ magic: 3 });
    expect(c.workModel.passiveAbilities).to.containDeep([{ id: 'magic-3' }]);

    await fixture.sendCharacterEvent({ eventType: 'removeFeature', data: { id: 'magic-3' } });
    c = await fixture.getCharacter();
    expect(c.workModel).containDeep({ magic: 2 });
    expect(c.workModel.passiveAbilities).not.to.containDeep([{ id: 'magic-3' }]);
  });

  it('Add and remove active ability', async () => {
    await fixture.saveCharacter();
    await fixture.addCharacterFeature('ground-heal-ability');
    let c = await fixture.getCharacter();
    expect(c.workModel.activeAbilities).length(1);

    await fixture.sendCharacterEvent({ eventType: 'removeFeature', data: { id: 'ground-heal-ability' } });
    c = await fixture.getCharacter();
    expect(c.workModel.activeAbilities).length(0);
  });

  it('Add and remove spell', async () => {
    await fixture.saveCharacter();
    await fixture.addCharacterFeature('ground-heal');
    let c = await fixture.getCharacter();
    expect(c.workModel.spells).length(1);

    await fixture.sendCharacterEvent({ eventType: 'removeFeature', data: { id: 'ground-heal' } });
    c = await fixture.getCharacter();
    expect(c.workModel.spells).length(0);
  });

  it('Removing non-present feature does nothing', async () => {
    await fixture.saveCharacter({ magic: 2 });
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'magic-3' } });
    let c = await fixture.getCharacter();
    expect(c.workModel).containDeep({ magic: 3 });
    const totalPassives = c.workModel.passiveAbilities.length;
    expect(c.workModel.passiveAbilities).to.containDeep([{ id: 'magic-3' }]);

    await fixture.sendCharacterEvent({ eventType: 'removeFeature', data: { id: 'magic-2' } });
    c = await fixture.getCharacter();
    expect(c.workModel).containDeep({ magic: 3 });
    expect(c.workModel.passiveAbilities).length(totalPassives);
    expect(c.workModel.passiveAbilities).to.containDeep([{ id: 'magic-3' }]);
  });

  it('Adding feature twice has no effect', async () => {
    await fixture.saveCharacter({ magic: 2 });
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'magic-3' } });
    let c = await fixture.getCharacter();
    expect(c.workModel).containDeep({ magic: 3 });
    expect(c.workModel.passiveAbilities).to.containDeep([{ id: 'magic-3' }]);
    const totalPassives = c.workModel.passiveAbilities.length;

    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'magic-3' } });
    c = await fixture.getCharacter();
    expect(c.workModel).containDeep({ magic: 3 });
    expect(c.workModel.passiveAbilities).to.containDeep([{ id: 'magic-3' }]);
    expect(c.workModel.passiveAbilities).length(totalPassives);
  });
});
