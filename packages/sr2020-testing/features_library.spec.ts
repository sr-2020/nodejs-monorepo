import { getAllActiveAbilities } from '@alice/sr2020-model-engine/scripts/character/library_registrator';
import { kAllPassiveAbilities } from '@alice/sr2020-model-engine/scripts/character/passive_abilities_library';
import { kAllSpells } from '@alice/sr2020-model-engine/scripts/character/spells_library';
// Imported for side effect of populating getAllActiveAbilities().
import '@alice/sr2020-model-engine/scripts/character/active_abilities_library';

describe('Features library', () => {
  function addNo(ids: string[]): string[] {
    return [...ids, ...ids.map((id) => `!${id}`)];
  }
  const allIds = new Set([...kAllPassiveAbilities.keys(), ...getAllActiveAbilities().keys(), ...kAllSpells.keys()]);
  const allValidPrerequisites = new Set(addNo([...allIds]));

  it('Defined', () => {
    expect(kAllPassiveAbilities).toBeDefined();
    expect(getAllActiveAbilities()).toBeDefined();
    expect(kAllSpells).toBeDefined();
  });

  it('No id duplication between different kinds of features', () => {
    expect(allIds.size).toBe(kAllPassiveAbilities.size + getAllActiveAbilities().size + kAllSpells.size);
  });

  it('All ids use correct format', () => {
    for (const id of allIds) {
      expect(id).toMatch(/^[a-z0-9-']+$/);
    }
  });

  it('Passive abilities prerequisites are valid', () => {
    for (const [, feature] of kAllPassiveAbilities) {
      for (const prereq of feature.prerequisites) {
        expect([...allValidPrerequisites]).toContain(prereq);
      }
    }
  });

  it('Passive ability does not require itself', () => {
    for (const [id, feature] of kAllPassiveAbilities) {
      for (const prereq of feature.prerequisites) {
        expect(prereq).not.toBe(id);
      }
    }
  });

  it('Passive ability prerequisites are not duplicated', () => {
    for (const [, feature] of kAllPassiveAbilities) {
      const prereqs = feature.prerequisites;
      expect(new Set<string>(prereqs).size).toBe(prereqs.length);
    }
  });

  it('Active abilities prerequisites are valid', () => {
    for (const [, feature] of getAllActiveAbilities()) {
      for (const prereq of feature.prerequisites) {
        expect([...allValidPrerequisites]).toContainEqual(prereq);
      }
    }
  });

  it('Active ability does not require itself', () => {
    for (const [id, feature] of getAllActiveAbilities()) {
      for (const prereq of feature.prerequisites) {
        expect(prereq).not.toBe(id);
      }
    }
  });

  it('Active ability prerequisites are not duplicated', () => {
    for (const [, feature] of getAllActiveAbilities()) {
      const prereqs = feature.prerequisites;
      expect(new Set<string>(prereqs).size).toBe(prereqs.length);
    }
  });

  it('Spells prerequisites are valid', () => {
    for (const [, feature] of kAllSpells) {
      for (const prereq of feature.prerequisites) {
        expect([...allValidPrerequisites]).toContainEqual(prereq);
      }
    }
  });

  it('Spell does not require itself', () => {
    for (const [id, feature] of kAllSpells) {
      for (const prereq of feature.prerequisites) {
        expect(prereq).not.toBe(id);
      }
    }
  });

  it('Spells prerequisites are not duplicated', () => {
    for (const [, feature] of kAllSpells) {
      const prereqs = feature.prerequisites;
      expect(new Set<string>(prereqs).size).toBe(prereqs.length);
    }
  });
});
