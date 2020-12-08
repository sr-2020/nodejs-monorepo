import { TestFixture } from './fixture';

import { satisfiesPrerequisites } from '@alice/sr2020-model-engine/scripts/character/features';
import { kAllPassiveAbilities } from '@alice/sr2020-model-engine/scripts/character/passive_abilities_library';

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
    expect(c.workModel).toMatchObject({ magic: 3 });
    expect(c.workModel.passiveAbilities).toContainEqual(expect.objectContaining({ id: 'magic-3' }));

    await fixture.sendCharacterEvent({ eventType: 'removeFeature', data: { id: 'magic-3' } });
    c = await fixture.getCharacter();
    expect(c.workModel).toMatchObject({ magic: 2 });
    expect(c.workModel.passiveAbilities).not.toContainEqual(expect.objectContaining({ id: 'magic-3' }));
  });

  it('Add and remove active ability', async () => {
    await fixture.saveCharacter();
    await fixture.addCharacterFeature('ground-heal-ability');
    let c = await fixture.getCharacter();
    expect(c.workModel.activeAbilities).toHaveLength(1);

    await fixture.sendCharacterEvent({ eventType: 'removeFeature', data: { id: 'ground-heal-ability' } });
    c = await fixture.getCharacter();
    expect(c.workModel.activeAbilities).toHaveLength(0);
  });

  it('Add and remove spell', async () => {
    await fixture.saveCharacter();
    await fixture.addCharacterFeature('ground-heal');
    let c = await fixture.getCharacter();
    expect(c.workModel.spells).toHaveLength(1);

    await fixture.sendCharacterEvent({ eventType: 'removeFeature', data: { id: 'ground-heal' } });
    c = await fixture.getCharacter();
    expect(c.workModel.spells).toHaveLength(0);
  });

  it('Removing non-present feature does nothing', async () => {
    await fixture.saveCharacter({ magic: 2 });
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'magic-3' } });
    let c = await fixture.getCharacter();
    expect(c.workModel).toMatchObject({ magic: 3 });
    const totalPassives = c.workModel.passiveAbilities.length;
    expect(c.workModel.passiveAbilities).toContainEqual(expect.objectContaining({ id: 'magic-3' }));

    await fixture.sendCharacterEvent({ eventType: 'removeFeature', data: { id: 'magic-2' } });
    c = await fixture.getCharacter();
    expect(c.workModel).toMatchObject({ magic: 3 });
    expect(c.workModel.passiveAbilities).toHaveLength(totalPassives);
    expect(c.workModel.passiveAbilities).toContainEqual(expect.objectContaining({ id: 'magic-3' }));
  });

  it('Adding feature twice has no effect', async () => {
    await fixture.saveCharacter({ magic: 2 });
    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'magic-3' } });
    let c = await fixture.getCharacter();
    expect(c.workModel).toMatchObject({ magic: 3 });
    expect(c.workModel.passiveAbilities).toContainEqual(expect.objectContaining({ id: 'magic-3' }));
    const totalPassives = c.workModel.passiveAbilities.length;

    await fixture.sendCharacterEvent({ eventType: 'addFeature', data: { id: 'magic-3' } });
    c = await fixture.getCharacter();
    expect(c.workModel).toMatchObject({ magic: 3 });
    expect(c.workModel.passiveAbilities).toContainEqual(expect.objectContaining({ id: 'magic-3' }));
    expect(c.workModel.passiveAbilities).toHaveLength(totalPassives);
  });

  describe('satisfiesPrerequisites', () => {
    it('True if no prerequisites', async () => {
      await fixture.saveCharacter();
      expect(satisfiesPrerequisites((await fixture.getCharacter()).workModel, kAllPassiveAbilities.get('arch-face')!)).toBe(true);
    });

    it('True if prerequisites are satisfied', async () => {
      await fixture.saveCharacter();
      await fixture.addCharacterFeature('arch-samurai-assasin');
      await fixture.addCharacterFeature('marauder-1');
      expect(satisfiesPrerequisites((await fixture.getCharacter()).workModel, kAllPassiveAbilities.get('marauder-2')!)).toBe(true);
    });

    it('False if prerequisites are not satisfied', async () => {
      await fixture.saveCharacter();
      expect(satisfiesPrerequisites((await fixture.getCharacter()).workModel, kAllPassiveAbilities.get('marauder-2')!)).toBe(false);
    });

    it('False if prerequisites are only partially satisfied', async () => {
      await fixture.saveCharacter();
      await fixture.addCharacterFeature('arch-samurai-assasin');
      expect(satisfiesPrerequisites((await fixture.getCharacter()).workModel, kAllPassiveAbilities.get('marauder-2')!)).toBe(false);
    });

    it('True if negative prerequisite is satisfied', async () => {
      await fixture.saveCharacter();
      await fixture.addCharacterFeature('arch-rigger');
      expect(satisfiesPrerequisites((await fixture.getCharacter()).workModel, kAllPassiveAbilities.get('arch-rigger-pilot')!)).toBe(true);
    });

    it('False if negative prerequisite is not satisfied', async () => {
      await fixture.saveCharacter();
      await fixture.addCharacterFeature('arch-rigger');
      await fixture.addCharacterFeature('tech-blockade');
      expect(satisfiesPrerequisites((await fixture.getCharacter()).workModel, kAllPassiveAbilities.get('arch-rigger-pilot')!)).toBe(false);
    });

    it('False if feature already present', async () => {
      await fixture.saveCharacter();
      await fixture.addCharacterFeature('arch-rigger');
      expect(satisfiesPrerequisites((await fixture.getCharacter()).workModel, kAllPassiveAbilities.get('arch-rigger')!)).toBe(false);
    });
  });
});
