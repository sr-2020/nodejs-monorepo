import { expect } from '@loopback/testlab';
import { kAllFeatures } from '@sr2020/sr2020-models/scripts/character/features_library';

describe('Features library', () => {
  it('Not empty', async () => {
    expect(kAllFeatures).not.empty();
  });

  it('Prerequisites are valid kAllFeatures keys', () => {
    for (const [, feature] of kAllFeatures) {
      for (const prereq of feature.prerequisites || []) {
        expect(kAllFeatures.has(prereq)).to.be.true();
      }
    }
  });

  it('Not requiring itself', () => {
    for (const [id, feature] of kAllFeatures) {
      for (const prereq of feature.prerequisites || []) {
        expect(prereq).not.equal(id);
      }
    }
  });

  it('Prerequisites are not duplicated', () => {
    for (const [, feature] of kAllFeatures) {
      const prereqs = feature.prerequisites || [];
      expect(new Set<string>(prereqs).size).to.equal(prereqs.length);
    }
  });
});
