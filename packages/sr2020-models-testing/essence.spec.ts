import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';

describe('Essence', function() {
  let fixture: TestFixture;

  beforeEach(async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Default essence', async () => {
    await fixture.saveCharacter();
    expect((await fixture.getCharacter()).workModel.essence).equal(600);
  });
});
