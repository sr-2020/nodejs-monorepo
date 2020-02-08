import { expect } from '@loopback/testlab';
import { kAllPassiveAbilities } from '@sr2020/sr2020-models/scripts/character/features_library';

describe('Features library', () => {
  it('Not empty', async () => {
    expect(kAllPassiveAbilities).not.empty();
  });

  it('Prerequisites are valid kAllPassiveAbilities keys', () => {
    for (const [, feature] of kAllPassiveAbilities) {
      for (const prereq of feature.prerequisites ?? []) {
        expect(kAllPassiveAbilities.has(prereq)).to.be.true();
      }
    }
  });

  it('Not requiring itself', () => {
    for (const [id, feature] of kAllPassiveAbilities) {
      for (const prereq of feature.prerequisites ?? []) {
        expect(prereq).not.equal(id);
      }
    }
  });

  it('Prerequisites are not duplicated', () => {
    for (const [, feature] of kAllPassiveAbilities) {
      const prereqs = feature.prerequisites ?? [];
      expect(new Set<string>(prereqs).size).to.equal(prereqs.length);
    }
  });
});
