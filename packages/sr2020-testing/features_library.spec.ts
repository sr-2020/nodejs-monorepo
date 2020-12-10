import {
  getAllActiveAbilities,
  getAllPassiveAbilities,
  getAllSpells,
} from '@alice/sr2020-model-engine/scripts/character/library_registrator';

describe('Features library', () => {
  function addNo(ids: string[]): string[] {
    return [...ids, ...ids.map((id) => `!${id}`)];
  }
  const allIds = new Set([...getAllActiveAbilities().keys(), ...getAllPassiveAbilities().keys(), ...getAllSpells().keys()]);
  const allValidPrerequisites = new Set(addNo([...allIds]));

  it('Defined', () => {
    expect(getAllActiveAbilities()).toBeDefined();
    expect(getAllPassiveAbilities()).toBeDefined();
    expect(getAllSpells()).toBeDefined();
  });

  it('No id duplication between different kinds of features', () => {
    expect(allIds.size).toBe(getAllActiveAbilities().size + getAllPassiveAbilities().size + getAllSpells().size);
  });

  it('All ids use correct format', () => {
    for (const id of allIds) {
      expect(id).toMatch(/^[a-z0-9-']+$/);
    }
  });

  it('Passive abilities prerequisites are valid', () => {
    for (const [, feature] of getAllActiveAbilities()) {
      for (const prereq of feature.prerequisites) {
        expect([...allValidPrerequisites]).toContain(prereq);
      }
    }
  });

  it('Passive ability does not require itself', () => {
    for (const [id, feature] of getAllActiveAbilities()) {
      for (const prereq of feature.prerequisites) {
        expect(prereq).not.toBe(id);
      }
    }
  });

  it('Passive ability prerequisites are not duplicated', () => {
    for (const [, feature] of getAllActiveAbilities()) {
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
    for (const [, feature] of getAllSpells()) {
      for (const prereq of feature.prerequisites) {
        expect([...allValidPrerequisites]).toContainEqual(prereq);
      }
    }
  });

  it('Spell does not require itself', () => {
    for (const [id, feature] of getAllSpells()) {
      for (const prereq of feature.prerequisites) {
        expect(prereq).not.toBe(id);
      }
    }
  });

  it('Spells prerequisites are not duplicated', () => {
    for (const [, feature] of getAllSpells()) {
      const prereqs = feature.prerequisites;
      expect(new Set<string>(prereqs).size).toBe(prereqs.length);
    }
  });
});
