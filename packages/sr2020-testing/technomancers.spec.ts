import { TestFixture } from './fixture';

describe('Technomancers-related abilities', () => {
  let fixture: TestFixture;

  beforeEach(async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Try to use ability with enough resonance', async () => {
    await fixture.saveCharacter({ resonance: 2 });
    await fixture.addCharacterFeature('remove-half');
    await fixture.useAbility({ id: 'remove-half' });
    expect(fixture.getCharacterNotifications()).toEqual([
      {
        body: expect.stringContaining('успешно применена'),
        title: expect.stringContaining('Успех'),
      },
    ]);
  });

  it('Try to use ability with enough resonance', async () => {
    await fixture.saveCharacter({ resonance: 1 });
    await fixture.addCharacterFeature('remove-half');
    await fixture.useAbility({ id: 'remove-half' });
    expect(fixture.getCharacterNotifications()).toEqual([
      {
        body: expect.stringContaining('дампшок'),
        title: expect.stringContaining('Дампшок'),
      },
    ]);
  });
});
