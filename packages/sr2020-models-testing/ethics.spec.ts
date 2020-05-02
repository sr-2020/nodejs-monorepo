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
      data: { id: '30df06cb-5d9e-11ea-b518-e5c6714f0b78' },
    });
    expect(baseModel).containDeep({
      ethic: {
        state: [
          { scale: 'violence', value: 1 },
          { scale: 'control', value: 0 },
          { scale: 'individualism', value: 0 },
          { scale: 'mind', value: 1 },
        ],
      },
    });
  });

  it('Go to the previous level without side-effect', async () => {
    await fixture.saveCharacter();
    const { baseModel } = await fixture.sendCharacterEvent({
      eventType: 'ethicTrigger',
      data: { id: '30df06cc-5d9e-11ea-b518-e5c6714f0b78' },
    });
    expect(baseModel).containDeep({
      ethic: {
        state: [
          { scale: 'violence', value: -1 },
          { scale: 'control', value: 0 },
          { scale: 'individualism', value: 0 },
          { scale: 'mind', value: 0 },
        ],
      },
    });
  });

  it('Get a crysis and resolve it', async () => {
    await fixture.saveCharacter();
    {
      // Break a principle, get a crysis
      const { baseModel } = await fixture.sendCharacterEvent({
        eventType: 'ethicTrigger',
        data: { id: '30df06ca-5d9e-11ea-b518-e5c6714f0b78' },
      });
      expect(baseModel).containDeep({
        ethic: {
          state: [
            { scale: 'violence', value: 0 },
            { scale: 'control', value: 0 },
            { scale: 'individualism', value: 0 },
            { scale: 'mind', value: 0 },
          ],
          trigger: [{ id: '3104de44-5d9e-11ea-b518-e5c6714f0b78', kind: 'crysis' }],
        },
      });
    }
    {
      // Do an action, shift to another level, but crysis stays with you
      const { baseModel } = await fixture.sendCharacterEvent({
        eventType: 'ethicTrigger',
        data: { id: '30df06cc-5d9e-11ea-b518-e5c6714f0b78' },
      });
      expect(baseModel).containDeep({
        ethic: {
          state: [
            { scale: 'violence', value: -1 },
            { scale: 'control', value: 0 },
            { scale: 'individualism', value: 0 },
            { scale: 'mind', value: 0 },
          ],
          trigger: [{ id: '3104de44-5d9e-11ea-b518-e5c6714f0b78', kind: 'crysis' }],
        },
      });
    }
    {
      // Resolve it crysis, it changes stats and goes away
      const { baseModel } = await fixture.sendCharacterEvent({
        eventType: 'ethicTrigger',
        data: { id: '3104de44-5d9e-11ea-b518-e5c6714f0b78' },
      });
      expect(baseModel).containDeep({
        ethic: {
          state: [
            { scale: 'violence', value: -1 },
            { scale: 'control', value: -1 },
            { scale: 'individualism', value: 0 },
            { scale: 'mind', value: -1 },
          ],
        },
      });
      expect(baseModel).not.containDeep({
        ethic: { trigger: [{ id: '3104de44-5d9e-11ea-b518-e5c6714f0b78', kind: 'crysis' }] },
      });
    }
  });

  it('Can not have max on many scales', async () => {
    await fixture.saveCharacter();
    {
      // Set to pre-max value
      const { baseModel } = await fixture.sendCharacterEvent({
        eventType: 'ethicSet',
        data: { violence: 3, control: -3, individualism: 2, mind: -3 },
      });
      expect(baseModel).containDeep({
        ethic: {
          state: [
            { scale: 'violence', value: 3 },
            { scale: 'control', value: -3 },
            { scale: 'individualism', value: 2 },
            { scale: 'mind', value: -3 },
          ],
        },
      });
    }
    {
      // Get to max (ok, min) on mind
      const { baseModel } = await fixture.sendCharacterEvent({
        eventType: 'ethicTrigger',
        data: { id: '30df070e-5d9e-11ea-b518-e5c6714f0b78' },
      });
      expect(baseModel).containDeep({
        ethic: {
          state: [
            { scale: 'violence', value: 3 },
            { scale: 'control', value: -3 },
            { scale: 'individualism', value: 2 },
            { scale: 'mind', value: -4 },
          ],
        },
      });
    }
    {
      // Get to max on violence
      const { baseModel } = await fixture.sendCharacterEvent({
        eventType: 'ethicTrigger',
        data: { id: '30df06d4-5d9e-11ea-b518-e5c6714f0b78' },
      });
      expect(baseModel).containDeep({
        ethic: {
          state: [
            { scale: 'violence', value: 4 },
            { scale: 'control', value: -3 },
            { scale: 'individualism', value: 2 },
            { scale: 'mind', value: -3 },
          ],
        },
      });
    }
  });
});
