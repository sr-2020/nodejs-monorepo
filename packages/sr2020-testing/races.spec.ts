import { TestFixture } from './fixture';

import { duration } from 'moment';
import { MetaRace } from '@alice/sr2020-common/models/sr2020-character.model';

describe('Race changes', () => {
  let fixture: TestFixture;

  beforeEach(async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Races give proper abilities', async () => {
    await fixture.saveCharacter({ metarace: 'meta-spirit' });
    let { workModel } = await fixture.sendCharacterEvent({ eventType: 'setRace', data: { race: 'meta-norm' } });
    expect(workModel.metarace).toBe('meta-norm');
    expect(workModel.passiveAbilities).toHaveLength(3);
    expect(workModel.activeAbilities).toHaveLength(0);

    ({ workModel } = await fixture.sendCharacterEvent({ eventType: 'setRace', data: { race: 'meta-elf' } }));
    expect(workModel.metarace).toBe('meta-elf');
    expect(workModel.passiveAbilities).toHaveLength(2);
    expect(workModel.activeAbilities).toHaveLength(0);

    ({ workModel } = await fixture.sendCharacterEvent({ eventType: 'setRace', data: { race: 'meta-vampire' } }));
    expect(workModel.metarace).toBe('meta-vampire');
    expect(workModel.passiveAbilities).toHaveLength(7);
    expect(workModel.passiveAbilities).toContainEqual(expect.objectContaining({ id: 'blood-thirst' }));
    expect(workModel.activeAbilities).toHaveLength(1);
    expect(workModel.activeAbilities).toContainEqual(expect.objectContaining({ id: 'vampire-feast' }));

    ({ workModel } = await fixture.sendCharacterEvent({ eventType: 'setRace', data: { race: 'meta-ghoul' } }));
    expect(workModel.metarace).toBe('meta-ghoul');
    expect(workModel.passiveAbilities).toHaveLength(8);
    expect(workModel.passiveAbilities).toContainEqual(expect.objectContaining({ id: 'meat-hunger' }));
    expect(workModel.activeAbilities).toHaveLength(1);
    expect(workModel.activeAbilities).toContainEqual(expect.objectContaining({ id: 'ghoul-feast' }));
  });

  it('Can switch to any race', async () => {
    // Not a meta-norm so first switch is not a no-op
    await fixture.saveCharacter({ metarace: 'meta-spirit' });
    const allRaces: MetaRace[] = [
      'meta-norm',
      'meta-elf',
      'meta-dwarf',
      'meta-ork',
      'meta-troll',
      'meta-vampire',
      'meta-ghoul',
      'meta-ai',
      'meta-eghost',
      'meta-spirit',
    ];
    for (const race of allRaces) {
      await fixture.sendCharacterEvent({ eventType: 'setRace', data: { race } });
      // No checks, just make sure that can change to that race
    }
  });

  it('Hungry HMHHV can not use abilities', async () => {
    await fixture.saveCharacter();
    await fixture.sendCharacterEvent({ eventType: 'setRace', data: { race: 'meta-vampire' } });
    await fixture.addCharacterFeature('enter-vr');
    await fixture.advanceTime(duration(6, 'hours'));

    const message = await fixture.sendCharacterEventExpectingError({ eventType: 'useAbility', data: { id: 'enter-vr' } });
    expect(message).toContain('Недостаточно эссенции');
  });

  it('Hungry HMHHV can feed', async () => {
    await fixture.saveCharacter();
    await fixture.saveCharacter({ modelId: '5' }); // victim
    await fixture.sendCharacterEvent({ eventType: 'setRace', data: { race: 'meta-vampire' } });
    await fixture.advanceTime(duration(6, 'hours'));

    await fixture.sendCharacterEvent({ eventType: 'useAbility', data: { id: 'vampire-feast', targetCharacterId: '5' } });
  });
});
