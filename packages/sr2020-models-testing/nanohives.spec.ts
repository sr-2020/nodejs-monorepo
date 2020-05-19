import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';

describe('Nanohives', () => {
  let fixture: TestFixture;

  beforeEach('setupApplication', async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Nanohive install gives abilities', async () => {
    await fixture.saveCharacter();
    let { workModel } = await fixture.sendCharacterEvent({ eventType: 'installImplant', data: { id: 'nanohive-badass-1' } });
    expect(workModel.activeAbilities).lengthOf(4);
    ({ workModel } = await fixture.sendCharacterEvent({ eventType: 'removeImplant', data: { id: 'nanohive-badass-1' } }));
    expect(workModel.activeAbilities).lengthOf(0);
  });
});
