import { expect } from '@loopback/testlab';
import { getAllActiveAbilities } from '@alice/sr2020-model-engine/scripts/character/library_registrator';
import { kAllPassiveAbilities } from '@alice/sr2020-model-engine/scripts/character/passive_abilities_library';
import { kAllSpells } from '@alice/sr2020-model-engine/scripts/character/spells_library';

describe('Features library', () => {
  function addNo(ids: string[]): string[] {
    return [...ids, ...ids.map((id) => `!${id}`)];
  }
  const allIds = new Set([...kAllPassiveAbilities.keys(), ...getAllActiveAbilities().keys(), ...kAllSpells.keys()]);
  const allValidPrerequisites = new Set(addNo([...allIds]));

  it.skip('Not empty', () => {
    expect(kAllPassiveAbilities).not.empty();
    expect(getAllActiveAbilities()).not.empty();
    expect(kAllSpells).not.empty();
  });

  it('No id duplication between different kinds of features', () => {
    expect(allIds.size).to.equal(kAllPassiveAbilities.size + getAllActiveAbilities().size + kAllSpells.size);
  });

  it('All ids use correct format', () => {
    for (const id of allIds) {
      expect(id).to.match(/^[a-z0-9-']+$/);
    }
  });

  it.skip('Passive abilities prerequisites are valid', () => {
    for (const [, feature] of kAllPassiveAbilities) {
      for (const prereq of feature.prerequisites) {
        expect([...allValidPrerequisites]).to.containEql(prereq);
      }
    }
  });

  it('Passive ability does not require itself', () => {
    for (const [id, feature] of kAllPassiveAbilities) {
      for (const prereq of feature.prerequisites) {
        expect(prereq).not.equal(id);
      }
    }
  });

  it('Passive ability prerequisites are not duplicated', () => {
    for (const [, feature] of kAllPassiveAbilities) {
      const prereqs = feature.prerequisites;
      expect(new Set<string>(prereqs).size).to.equal(prereqs.length);
    }
  });

  it('Active abilities prerequisites are valid', () => {
    for (const [, feature] of getAllActiveAbilities()) {
      for (const prereq of feature.prerequisites) {
        expect([...allValidPrerequisites]).to.containEql(prereq);
      }
    }
  });

  it('Active ability does not require itself', () => {
    for (const [id, feature] of getAllActiveAbilities()) {
      for (const prereq of feature.prerequisites) {
        expect(prereq).not.equal(id);
      }
    }
  });

  it('Active ability prerequisites are not duplicated', () => {
    for (const [, feature] of getAllActiveAbilities()) {
      const prereqs = feature.prerequisites;
      expect(new Set<string>(prereqs).size).to.equal(prereqs.length);
    }
  });

  it('Spells prerequisites are valid', () => {
    for (const [, feature] of kAllSpells) {
      for (const prereq of feature.prerequisites) {
        expect([...allValidPrerequisites]).to.containEql(prereq);
      }
    }
  });

  it('Spell does not require itself', () => {
    for (const [id, feature] of kAllSpells) {
      for (const prereq of feature.prerequisites) {
        expect(prereq).not.equal(id);
      }
    }
  });

  it('Spells prerequisites are not duplicated', () => {
    for (const [, feature] of kAllSpells) {
      const prereqs = feature.prerequisites;
      expect(new Set<string>(prereqs).size).to.equal(prereqs.length);
    }
  });
});
