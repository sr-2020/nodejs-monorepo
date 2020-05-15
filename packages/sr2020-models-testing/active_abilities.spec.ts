import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';
import { duration } from 'moment';

describe('Active abilities', function() {
  let fixture: TestFixture;

  beforeEach('setupApplication', async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('I will survive recovery', async () => {
    await fixture.saveCharacter({ magic: 10 });
    await fixture.saveLocation({ manaDensity: 5, modelId: '7' });

    await fixture.addCharacterFeature('i-will-survive');

    await fixture.sendCharacterEvent({ eventType: 'useAbility', data: { id: 'i-will-survive', location: { id: 7, manaLevel: 5 } } });
    await fixture.sendCharacterEvent({ eventType: 'wound', data: {} });

    expect((await fixture.getCharacter()).workModel.healthState).equal('wounded');
    await fixture.advanceTime(duration(31, 'second'));
    expect((await fixture.getCharacter()).workModel.healthState).equal('healthy');
  });
});
