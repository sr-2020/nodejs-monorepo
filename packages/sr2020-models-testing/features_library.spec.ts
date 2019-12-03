import { expect } from '@loopback/testlab';
import { kAllFeatures } from '@sr2020/sr2020-models/scripts/character/features_library';

describe('Features library', () => {
  it('Not empty', async () => {
    expect(kAllFeatures).not.empty();
  });
});
