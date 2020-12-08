import { TestFixture } from './fixture';

describe('Notifications', () => {
  let fixture: TestFixture;

  beforeEach(async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Get notification on refresh', async () => {
    await fixture.saveCharacter();
    expect(fixture.getPubSubNotifications().length).toBe(0);

    await fixture.getCharacter();

    expect(fixture.getPubSubNotifications().length).toBe(1);
    expect(fixture.getPubSubNotifications()).toContainEqual(
      expect.objectContaining({
        topic: 'character_update',
        body: expect.objectContaining({
          modelId: '0',
        }),
      }),
    );
  });
});
