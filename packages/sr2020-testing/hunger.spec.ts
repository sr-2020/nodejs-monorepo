import { TestFixture } from './fixture';
import { duration } from 'moment';
import { expect } from '@loopback/testlab';

describe('Hunger-related events', function() {
  let fixture: TestFixture;

  beforeEach(async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Hunger leads to wounded and then clinically dead state', async () => {
    await fixture.saveCharacter();
    await fixture.advanceTime(duration(3, 'hours'));
    expect((await fixture.getCharacter()).workModel.healthState).equal('healthy');
    await fixture.advanceTime(duration(3, 'hours'));
    expect((await fixture.getCharacter()).workModel.healthState).equal('wounded');

    // Need to do it here - otherwise character will go into clinically_dead state due to being wounded.
    await fixture.sendCharacterEvent({ eventType: 'revive', data: {} });

    await fixture.advanceTime(duration(3, 'hours'));
    expect((await fixture.getCharacter()).workModel.healthState).equal('healthy');
    await fixture.advanceTime(duration(3, 'hours'));
    expect((await fixture.getCharacter()).workModel.healthState).equal('clinically_dead');
  });

  it('Eating regularly keeps you healthy', async () => {
    await fixture.saveCharacter();
    for (let i = 0; i < 24; ++i) {
      await fixture.sendCharacterEvent({ eventType: 'consumeFood', data: {} });
      expect((await fixture.getCharacter()).workModel.healthState).equal('healthy');
    }
  });
});
