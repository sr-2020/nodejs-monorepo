import { TestFixture } from './fixture';

describe('Nanohives', () => {
  let fixture: TestFixture;

  beforeEach(async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Nanohive install gives abilities', async () => {
    await fixture.saveCharacter();
    let { workModel } = await fixture.sendCharacterEvent({ eventType: 'installImplant', data: { id: 'nanohive-badass-1' } });
    expect(workModel.activeAbilities).toHaveLength(3);
    ({ workModel } = await fixture.sendCharacterEvent({ eventType: 'removeImplant', data: { id: 'nanohive-badass-1' } }));
    expect(workModel.activeAbilities).toHaveLength(0);
  });
});
