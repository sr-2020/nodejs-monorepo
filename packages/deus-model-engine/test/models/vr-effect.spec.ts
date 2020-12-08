//Тесты для событий VR

import { process } from '../test_helpers';
import { getExampleModel } from '../fixtures/models';
import { getEvents } from '../fixtures/events';

describe('VR events: ', () => {
  it('Enter VR', async function () {
    const model = getExampleModel();
    const enterTimestamp = model.timestamp + 100;
    const events = getEvents(model.modelId, [{ eventType: 'enterVR', data: {} }], enterTimestamp);
    const { baseModel } = await process(model, events);

    expect(baseModel.lastVREnterTimestamp).toBeDefined();
    expect(baseModel.lastVREnterTimestamp).toBe(enterTimestamp);
  });

  it('Enter & Exit VR', async function () {
    const model = getExampleModel();
    const enterTimestamp = model.timestamp + 100;
    let events = getEvents(model.modelId, [{ eventType: 'enterVR', data: {} }], enterTimestamp);
    let { baseModel } = await process(model, events);

    expect(baseModel.lastVREnterTimestamp).toBeDefined();
    expect(baseModel.lastVREnterTimestamp).toBe(enterTimestamp);

    const exitTimestamp = model.timestamp + 610 * 1000;

    events = getEvents(model.modelId, [{ eventType: 'exitVR', data: {} }], exitTimestamp);
    ({ baseModel } = await process(baseModel, events));

    expect(baseModel.lastVREnterDuration).toBeDefined();
    expect(Math.round(baseModel.lastVREnterDuration / 1000 / 60)).toBe(10);
    expect(Math.round(baseModel.totalSpentInVR / 1000 / 60)).toBe(10);
  });
});
