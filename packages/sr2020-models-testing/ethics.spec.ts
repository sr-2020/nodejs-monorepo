import { TestFixture } from './fixture';
import { expect } from '@loopback/testlab';

describe('Ethic events', function() {
  let fixture: TestFixture;

  beforeEach(async () => {
    fixture = await TestFixture.create();
  });

  afterEach(async () => {
    await fixture.destroy();
  });

  it('Go to the next level with side-effect', async () => {
    await fixture.saveCharacter();
    const { baseModel } = await fixture.sendCharacterEvent({
      eventType: 'ethicTrigger',
      data: { id: 'e13587dc-5cb1-11ea-86b6-136c0966c3fe' },
    });
    expect(baseModel).containDeep({
      ethicState: [
        { scale: 'violence', value: 1 },
        { scale: 'control', value: 0 },
        { scale: 'individualism', value: 0 },
        { scale: 'mind', value: 1 },
      ],
    });
  });

  it('Go to the previous level without side-effect', async () => {
    await fixture.saveCharacter();
    const { baseModel } = await fixture.sendCharacterEvent({
      eventType: 'ethicTrigger',
      data: { id: 'e13587dd-5cb1-11ea-86b6-136c0966c3fe' },
    });
    expect(baseModel).containDeep({
      ethicState: [
        { scale: 'violence', value: -1 },
        { scale: 'control', value: 0 },
        { scale: 'individualism', value: 0 },
        { scale: 'mind', value: 0 },
      ],
    });
  });

  it('Get a crysis and resolve it', async () => {
    await fixture.saveCharacter();
    {
      // Break a principle, get a crysis
      const { baseModel } = await fixture.sendCharacterEvent({
        eventType: 'ethicTrigger',
        data: { id: 'e13587db-5cb1-11ea-86b6-136c0966c3fe' },
      });
      expect(baseModel).containDeep({
        ethicState: [
          { scale: 'violence', value: 0 },
          { scale: 'control', value: 0 },
          { scale: 'individualism', value: 0 },
          { scale: 'mind', value: 0 },
        ],
        ethicTrigger: [{ id: 'e157dce4-5cb1-11ea-86b6-136c0966c3fe', kind: 'crysis' }],
      });
    }
    {
      // Do an action, shift to another level, but crysis stays with you
      const { baseModel } = await fixture.sendCharacterEvent({
        eventType: 'ethicTrigger',
        data: { id: 'e13587dd-5cb1-11ea-86b6-136c0966c3fe' },
      });
      expect(baseModel).containDeep({
        ethicState: [
          { scale: 'violence', value: -1 },
          { scale: 'control', value: 0 },
          { scale: 'individualism', value: 0 },
          { scale: 'mind', value: 0 },
        ],
        ethicTrigger: [{ id: 'e157dce4-5cb1-11ea-86b6-136c0966c3fe', kind: 'crysis' }],
      });
    }
    {
      // Resolve it crysis, it changes stats and goes away
      const { baseModel } = await fixture.sendCharacterEvent({
        eventType: 'ethicTrigger',
        data: { id: 'e157dce4-5cb1-11ea-86b6-136c0966c3fe' },
      });
      expect(baseModel).containDeep({
        ethicState: [
          { scale: 'violence', value: -1 },
          { scale: 'control', value: -1 },
          { scale: 'individualism', value: 0 },
          { scale: 'mind', value: -1 },
        ],
      });
      expect(baseModel).not.containDeep({
        ethicTrigger: [{ id: 'e157dce4-5cb1-11ea-86b6-136c0966c3fe', kind: 'crysis' }],
      });
    }
  });

  it('Can not have max on many scales', async () => {
    await fixture.saveCharacter();
    {
      // Set to pre-max value
      const { baseModel } = await fixture.sendCharacterEvent({
        eventType: 'ethicSet',
        data: { violence: 3, control: -3, individualism: 2, mind: 2 },
      });
      expect(baseModel).containDeep({
        ethicState: [
          { scale: 'violence', value: 3 },
          { scale: 'control', value: -3 },
          { scale: 'individualism', value: 2 },
          { scale: 'mind', value: 2 },
        ],
      });
    }
    {
      // Get to max (ok, min) on control
      const { baseModel } = await fixture.sendCharacterEvent({
        eventType: 'ethicTrigger',
        data: { id: 'e13587ed-5cb1-11ea-86b6-136c0966c3fe' },
      });
      expect(baseModel).containDeep({
        ethicState: [
          { scale: 'violence', value: 3 },
          { scale: 'control', value: -4 },
          { scale: 'individualism', value: 2 },
          { scale: 'mind', value: 2 },
        ],
      });
    }
    {
      // Get to max on violence
      const { baseModel } = await fixture.sendCharacterEvent({
        eventType: 'ethicTrigger',
        data: { id: 'e13587e5-5cb1-11ea-86b6-136c0966c3fe' },
      });
      expect(baseModel).containDeep({
        ethicState: [
          { scale: 'violence', value: 4 },
          { scale: 'control', value: -3 },
          { scale: 'individualism', value: 2 },
          { scale: 'mind', value: 2 },
        ],
      });
    }
  });
});
