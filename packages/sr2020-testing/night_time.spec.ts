import { TestFixture } from './fixture';
import { duration } from 'moment';

describe('Night time', () => {
  let fixture: TestFixture;

  beforeEach(async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Can pause for night', async () => {
    await fixture.saveCharacter();
    await fixture.sendCharacterEvent({ eventType: 'consumeFood', data: { id: 'food' } });
    await fixture.sendCharacterEvent({ eventType: 'pauseAndPostpone', data: { pauseDurationHours: 7, postponeDurationHours: 8 } });
    await fixture.advanceTime(duration(6, 'hours'));
    let { workModel } = await fixture.getCharacter();
    // No hunger effect due to timer shift
    expect(workModel.screens.activeAbilities).toBe(false);
    expect(workModel.healthState).toBe('healthy');

    await fixture.advanceTime(duration(1, 'hours'));
    ({ workModel } = await fixture.getCharacter());
    // Still no hunger effect due to timer shift
    expect(workModel.screens.activeAbilities).toBe(true);
    expect(workModel.healthState).toBe('healthy');

    await fixture.advanceTime(duration(13, 'hours'));
    ({ workModel } = await fixture.getCharacter());
    // Hunger finally activates
    expect(workModel.screens.activeAbilities).toBe(true);
    expect(workModel.healthState).toBe('wounded');
  });
});
