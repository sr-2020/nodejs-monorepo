import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';

describe('Karma events', function () {
  let fixture: TestFixture;

  beforeEach(async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Can earn karma', async () => {
    await fixture.saveCharacter();
    const { baseModel } = await fixture.sendCharacterEvent({
      eventType: 'earnKarma',
      data: { amount: 30 },
    });

    expect(baseModel.karma).to.containDeep({
      available: 30,
      cycleLimit: 70,
    });
  });

  it('Can not earn more karma than cycle cap', async () => {
    await fixture.saveCharacter();

    await fixture.sendCharacterEvent({ eventType: 'earnKarma', data: { amount: 55 } });
    const { baseModel } = await fixture.sendCharacterEvent({ eventType: 'earnKarma', data: { amount: 55 } });

    expect(baseModel.karma).to.containDeep({
      available: 100,
      cycleLimit: 0,
    });
  });

  it('Can continue earning after cycle reset', async () => {
    await fixture.saveCharacter();

    await fixture.sendCharacterEvent({ eventType: 'earnKarma', data: { amount: 55 } });
    await fixture.sendCharacterEvent({ eventType: 'resetKarmaCycleLimit', data: {} });
    const { baseModel } = await fixture.sendCharacterEvent({ eventType: 'earnKarma', data: { amount: 55 } });

    expect(baseModel.karma).to.containDeep({
      available: 110,
      cycleLimit: 45,
    });
  });

  it('Can not earn more than game limit', async () => {
    await fixture.saveCharacter();

    for (let i = 0; i < 10; ++i) {
      await fixture.sendCharacterEvent({ eventType: 'earnKarma', data: { amount: 80 } });
      await fixture.sendCharacterEvent({ eventType: 'resetKarmaCycleLimit', data: {} });
    }

    expect((await fixture.getCharacter()).baseModel.karma).to.containDeep({
      available: 500,
    });
  });
});
