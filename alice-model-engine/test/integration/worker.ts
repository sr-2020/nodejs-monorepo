import { EngineResultOk } from 'alice-model-engine-api';
import { expect } from 'chai';
import 'mocha';
import { Config, EventHandler } from '../../src/config';
import { Worker } from '../../src/worker';

describe('Worker', () => {
  let worker: Worker;

  beforeEach(() => {
    const eventHandlers: EventHandler[] = [
      {
        eventType: 'noop',
        effects: [
          'noop',
        ],
      },

      {
        eventType: 'add',
        effects: [
          'add',
        ],
      },

      {
        eventType: 'mul',
        effects: [
          'mul',
        ],
      },

      {
        eventType: 'concat',
        effects: [
          'concat',
        ],
      },

      {
        eventType: 'delayedConcat',
        effects: [
          'delayedConcat',
        ],
      },

      {
        eventType: 'sendMessage',
        effects: [
          'sendMessage',
        ],
      },
    ];

    const config = Config.parse({
      events: eventHandlers,
    });

    worker = Worker.load(`${__dirname}/../test-models/trivial`).configure(config);
  });

  it('Should process some models', async () => {
    const context = { timestamp: 0, value: 0 };

    const timestamp = Date.now();

    const events = [
      { characterId: '0000', eventType: 'add', data: { operand: 'value', value: '2' }, timestamp: timestamp - 2000 },
      { characterId: '0000', eventType: 'add', data: { operand: 'value', value: '3' }, timestamp: timestamp - 1000 },
      { characterId: '0000', eventType: 'mul', data: { operand: 'value', value: '2' }, timestamp },
    ];

    let result = await worker.process(context, events);

    expect(result.status).to.equals('ok');
    result = result as EngineResultOk;

    expect(result.baseModel).to.deep.equal({ timestamp: timestamp, value: (2 + 3) * 2, timers: {} });
    expect(result.workingModel.timestamp).to.equal(timestamp);
  });

  it('Should process some timers', async () => {
    const context = { timestamp: 0, value: '' };
    const timestamp = Date.now();

    const events = [
      { characterId: '0000', eventType: 'concat',
        data: { operand: 'value', value: 'A' }, timestamp: timestamp - 10000 },
      { characterId: '0000', eventType: 'delayedConcat',
        data: { operand: 'value', value: 'B', delay: 3000 }, timestamp: timestamp - 10000 },
      { characterId: '0000', eventType: 'concat', data: { operand: 'value', value: 'A' }, timestamp: timestamp - 9000 },
      { characterId: '0000', eventType: 'concat', data: { operand: 'value', value: 'A' }, timestamp: timestamp },
    ];

    let result = await worker.process(context, events);

    expect(result.status).to.equals('ok');
    result = result as EngineResultOk;

    expect(result.baseModel).to.deep.equal({ timestamp: timestamp, value: 'AABA', timers: {} });
    expect(result.workingModel.timestamp).to.equal(timestamp);
  });

  it('Should leave unprocessed timers intact', async () => {
    const context = { timestamp: 0, value: '' };
    const timestamp = Date.now();

    const events = [
      { characterId: '0000', eventType: 'delayedConcat',
        data: { operand: 'value', value: 'B', delay: 3000 }, timestamp: timestamp - 1000 },
      { characterId: '0000', eventType: 'concat',
        data: { operand: 'value', value: 'A' }, timestamp: timestamp },
    ];

    let result = await worker.process(context, events);

    expect(result.status).to.equals('ok');
    result = result as EngineResultOk;

    const expectedTimer = {
      name: 'delayedConcat',
      miliseconds: 2000,
      eventType: 'concat',
      data: { operand: 'value', value: 'B' },
    };

    expect(result.baseModel).to.deep.equal(
      { timestamp: timestamp, value: 'A', timers: { delayedConcat: expectedTimer } });
    expect(result.workingModel.timestamp).to.equal(timestamp);
  });

  it('Should produce view model', async () => {
    const context = { timestamp: 0, value: 0 };
    const timestamp = Date.now();

    const events = [
      { characterId: '0000', eventType: '_', timestamp, data: undefined },
    ];

    let result = await worker.process(context, events);

    expect(result.status).to.equals('ok');
    result = result as EngineResultOk;

    const { viewModels } = result;

    expect(viewModels).to.exist;
    expect(viewModels).to.has.property('default');
    expect(viewModels.default).to.deep.equal({ value: 0 });
  });

  it('Should return outbound events', async () => {
    const context = { timestamp: 0, value: 0 };
    const timestamp = Date.now();

    const events = [
      { characterId: '0000', eventType: 'sendMessage', timestamp, data: { receiver: '0001', message: 'test message' } },
      { characterId: '0000', eventType: '_', timestamp, data: undefined },
    ];

    let result = await worker.process(context, events);

    expect(result.status).to.equals('ok');
    result = result as EngineResultOk;

    expect(result).to.has.property('events');

    const event = (result as any).events[0];
    expect(event.characterId).to.equals('0001');
    expect(event.eventType).to.equals('message');
    expect(event.data.message).to.equals('test message');
  });

  it('Should run modifiers', async () => {
    const context = {
      timestamp: 0,
      value: '',
      modifiers: [{
        id: 'test modifier',
        enabled: true,
        operand: 'value', value: 'A',
        effects: [
          { id: 'add A', type: 'normal', enabled: true, handler: 'concat' },
          { id: 'add A', type: 'normal', enabled: true, handler: 'concat' },
        ],
      }],
    };

    const timestamp = Date.now();

    const events = [
      { characterId: '0000', eventType: '_', timestamp, data: undefined },
    ];

    let result = await worker.process(context, events);

    expect(result.status).to.equals('ok');
    result = result as EngineResultOk;

    const { workingModel } = result;

    expect(workingModel.value).to.equals('AA');
  });
});
