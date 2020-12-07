import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';

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
    expect(fixture.getPubSubNotifications().length).to.equal(0);

    await fixture.getCharacter();

    expect(fixture.getPubSubNotifications().length).to.equal(1);
    expect(fixture.getPubSubNotifications()).to.containDeep([
      {
        topic: 'character_update',
        body: {
          modelId: '0',
        },
      },
    ]);
  });
});
