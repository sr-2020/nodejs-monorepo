import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';
import { getAllFeatures } from '@sr2020/sr2020-model-engine/scripts/character/features';
import { kSpiritAbilityIds } from '@sr2020/sr2020-model-engine/scripts/qr/spirits_library';

describe('Spirits-related abilities', () => {
  let fixture: TestFixture;

  beforeEach('setupApplication', async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Spirit abilities are valid', () => {
    for (const id of kSpiritAbilityIds) {
      expect(getAllFeatures()).containDeep([{ id }]);
    }
  });
});
