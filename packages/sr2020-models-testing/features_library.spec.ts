import { expect } from '@loopback/testlab';
import { getAllActiveAbilities } from '@sr2020/sr2020-models/scripts/character/library_registrator';
import { kAllPassiveAbilities } from '@sr2020/sr2020-models/scripts/character/passive_abilities_library';
import { kAllSpells } from '@sr2020/sr2020-models/scripts/character/spells_library';

describe('Features library', () => {
  const allValidPrerequisites = new Set<string>([...kAllPassiveAbilities.keys(), ...getAllActiveAbilities().keys(), ...kAllSpells.keys()]);

  it('Not empty', () => {
    expect(kAllPassiveAbilities).not.empty();
    expect(getAllActiveAbilities()).not.empty();
    expect(kAllSpells).not.empty();
  });

  it('No id duplication between different kinds of features', () => {
    expect(allValidPrerequisites.size).to.equal(kAllPassiveAbilities.size + getAllActiveAbilities().size + kAllSpells.size);
  });

  it('Passive abilities prerequisites are valid', () => {
    for (const [, feature] of kAllPassiveAbilities) {
      for (const prereq of feature.prerequisites ?? []) {
        expect(allValidPrerequisites.has(prereq)).to.be.true();
      }
    }
  });

  it('Passive ability does not require itself', () => {
    for (const [id, feature] of kAllPassiveAbilities) {
      for (const prereq of feature.prerequisites ?? []) {
        expect(prereq).not.equal(id);
      }
    }
  });

  it('Passive ability prerequisites are not duplicated', () => {
    for (const [, feature] of kAllPassiveAbilities) {
      const prereqs = feature.prerequisites ?? [];
      expect(new Set<string>(prereqs).size).to.equal(prereqs.length);
    }
  });

  it('Active abilities prerequisites are valid', () => {
    for (const [, feature] of getAllActiveAbilities()) {
      for (const prereq of feature.prerequisites ?? []) {
        expect(allValidPrerequisites.has(prereq)).to.be.true();
      }
    }
  });

  it('Active ability does not require itself', () => {
    for (const [id, feature] of getAllActiveAbilities()) {
      for (const prereq of feature.prerequisites ?? []) {
        expect(prereq).not.equal(id);
      }
    }
  });

  it('Active ability prerequisites are not duplicated', () => {
    for (const [, feature] of getAllActiveAbilities()) {
      const prereqs = feature.prerequisites ?? [];
      expect(new Set<string>(prereqs).size).to.equal(prereqs.length);
    }
  });

  it('Spells prerequisites are valid', () => {
    for (const [, feature] of kAllSpells) {
      for (const prereq of feature.prerequisites ?? []) {
        expect(allValidPrerequisites.has(prereq)).to.be.true();
      }
    }
  });

  it('Spell does not require itself', () => {
    for (const [id, feature] of kAllSpells) {
      for (const prereq of feature.prerequisites ?? []) {
        expect(prereq).not.equal(id);
      }
    }
  });

  it('Spells prerequisites are not duplicated', () => {
    for (const [, feature] of kAllSpells) {
      const prereqs = feature.prerequisites ?? [];
      expect(new Set<string>(prereqs).size).to.equal(prereqs.length);
    }
  });
});
