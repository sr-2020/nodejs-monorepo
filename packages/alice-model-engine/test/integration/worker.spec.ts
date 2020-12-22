import { Effect, EmptyModel, EngineResultOk, Modifier } from '@alice/alice-common/models/alice-model-engine';

import { Config, EventHandler } from '../../config';
import { Worker } from '../../worker';
import { TestFolderLoader } from '@alice/alice-model-engine/utils';

describe('Worker', () => {
  let worker: Worker;
  const defaultModel: EmptyModel = { modelId: '0', timestamp: 0, modifiers: [], timers: [] };

  beforeEach(() => {
    const eventHandlers: EventHandler[] = [
      {
        eventType: 'noop',
        effects: ['noop'],
      },

      {
        eventType: 'add',
        effects: ['add'],
      },

      {
        eventType: 'mul',
        effects: ['mul'],
      },

      {
        eventType: 'concat',
        effects: ['concat'],
      },

      {
        eventType: 'delayedConcat',
        effects: ['delayedConcat'],
      },

      {
        eventType: 'sendMessage',
        effects: ['sendMessage'],
      },
    ];

    const config = Config.parse({
      events: eventHandlers,
    });

    worker = Worker.load(new TestFolderLoader(`${__dirname}/../test-models/trivial`)).configure(config);
  });

  it('Should process some models', async () => {
    const context = { ...defaultModel, value: 0 };

    const timestamp = Date.now();

    const events = [
      { modelId: '0000', eventType: 'add', data: { operand: 'value', value: '2' }, timestamp: timestamp - 2000 },
      { modelId: '0000', eventType: 'add', data: { operand: 'value', value: '3' }, timestamp: timestamp - 1000 },
      { modelId: '0000', eventType: 'mul', data: { operand: 'value', value: '2' }, timestamp },
    ];

    let result = await worker.process(context, events);

    expect(result.status).toBe('ok');
    result = result as EngineResultOk;

    expect(result.baseModel).toEqual({ ...defaultModel, timestamp: timestamp, value: (2 + 3) * 2, timers: [] });
    expect(result.workingModel.timestamp).toBe(timestamp);
  });

  it('Should process some timers', async () => {
    const context = { ...defaultModel, value: '' };
    const timestamp = Date.now();

    const events = [
      { modelId: '0000', eventType: 'concat', data: { operand: 'value', value: 'A' }, timestamp: timestamp - 10000 },
      {
        modelId: '0000',
        eventType: 'delayedConcat',
        data: { operand: 'value', value: 'B', delay: 3000 },
        timestamp: timestamp - 10000,
      },
      { modelId: '0000', eventType: 'concat', data: { operand: 'value', value: 'A' }, timestamp: timestamp - 9000 },
      { modelId: '0000', eventType: 'concat', data: { operand: 'value', value: 'A' }, timestamp: timestamp },
    ];

    let result = await worker.process(context, events);

    expect(result.status).toBe('ok');
    result = result as EngineResultOk;

    expect(result.baseModel).toEqual({ ...defaultModel, timestamp: timestamp, value: 'AABA', timers: [] });
    expect(result.workingModel.timestamp).toBe(timestamp);
  });

  it('Should leave unprocessed timers intact', async () => {
    const context = { ...defaultModel, value: '' };
    const timestamp = Date.now();

    const events = [
      { modelId: '0000', eventType: 'delayedConcat', data: { operand: 'value', value: 'B', delay: 3000 }, timestamp: timestamp - 1000 },
      { modelId: '0000', eventType: 'concat', data: { operand: 'value', value: 'A' }, timestamp: timestamp },
    ];

    let result = await worker.process(context, events);

    expect(result.status).toBe('ok');
    result = result as EngineResultOk;

    const expectedTimer = {
      name: 'delayedConcat',
      description: '',
      miliseconds: 2000,
      eventType: 'concat',
      data: { operand: 'value', value: 'B' },
    };

    expect(result.baseModel).toEqual({
      ...defaultModel,
      timestamp: timestamp,
      value: 'A',
      timers: [expectedTimer],
    });
    expect(result.workingModel.timestamp).toBe(timestamp);
  });

  it('Should produce view model', async () => {
    const context = { ...defaultModel, value: 0 };
    const timestamp = Date.now();

    const events = [{ modelId: '0000', eventType: '_', timestamp, data: undefined }];

    let result = await worker.process(context, events);

    expect(result.status).toBe('ok');
    result = result as EngineResultOk;

    const { viewModels } = result;

    expect(viewModels).toBeDefined();
    expect(viewModels).toHaveProperty('default');
    expect(viewModels.default).toEqual({ value: 0 });
  });

  it('Should return outbound events', async () => {
    const context = { ...defaultModel, value: 0 };
    const timestamp = Date.now();

    const events = [
      { modelId: '0000', eventType: 'sendMessage', timestamp, data: { receiver: '0001', message: 'test message' } },
      { modelId: '0000', eventType: '_', timestamp, data: undefined },
    ];

    let result = await worker.process(context, events);

    expect(result.status).toBe('ok');
    result = result as EngineResultOk;

    expect(result.outboundEvents).toHaveLength(1);
    expect(result.outboundEvents[0]).toMatchObject({
      modelType: 'Recipient',
      modelId: '0001',
      eventType: 'message',
      data: {
        message: 'test message',
      },
    });
  });

  it('Should run modifiers', async () => {
    const effects: Effect[] = [
      { type: 'normal', enabled: true, handler: 'concat' },
      { type: 'normal', enabled: true, handler: 'concat' },
    ];

    const context = {
      ...defaultModel,
      value: '',
      modifiers: [
        {
          mID: 'test modifier',
          priority: Modifier.kDefaultPriority,
          enabled: true,
          operand: 'value',
          class: 'normal',
          value: 'A',
          effects,
        },
      ],
    };

    const timestamp = Date.now();

    const events = [{ modelId: '0000', eventType: '_', timestamp, data: undefined }];

    let result = await worker.process(context, events);

    expect(result.status).toBe('ok');
    result = result as EngineResultOk;

    const { workingModel } = result;

    expect(workingModel.value).toBe('AA');
  });
});
