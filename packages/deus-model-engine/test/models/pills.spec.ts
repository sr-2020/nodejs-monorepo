import { find, merge } from 'lodash';
import { process } from '../test_helpers';
import { getExampleModel } from '../fixtures/models';
import { getEvents } from '../fixtures/events';

interface Global {
  TEST_EXTERNAL_OBJECTS: any;
}

// eslint-disable-next-line no-var
declare var global: Global;

global.TEST_EXTERNAL_OBJECTS = merge(global.TEST_EXTERNAL_OBJECTS, {
  pills: {
    '111-111': {
      _id: '111-111',
      pillId: 'firstAid1',
    },

    '111-112': {
      _id: '111-112',
      pillId: 'cometa',
    },

    '111-113': {
      _id: '111-113',
      pillId: 'cometa',
    },
  },
});

describe('Pills', () => {
  it('Cures HP with firstAid pill', async () => {
    const model = getExampleModel();

    let events = getEvents(model.modelId, [{ eventType: 'get-damage', data: { hpLost: 2 } }], Date.now(), true);
    let { baseModel, workingModel } = await process(model, events);
    expect(workingModel.hp).toBe(2);

    events = getEvents(model.modelId, [{ eventType: 'usePill', data: { id: '111-111' } }], Date.now(), true);

    ({ baseModel, workingModel } = await process(baseModel, events));
    expect(workingModel.hp).toBe(3);
    expect(workingModel.usedPills).toHaveProperty('firstAid1');

    expect(global.TEST_EXTERNAL_OBJECTS.pills['111-111']).toHaveProperty('usedBy', model.modelId);
  });

  it('Applies narco', async () => {
    const model = getExampleModel();

    const events = getEvents(model.modelId, [{ eventType: 'usePill', data: { id: '111-112' } }], Date.now(), true);
    const { baseModel } = await process(model, events);

    const effect = find(baseModel.modifiers, (m: any) => m.id == 'narcoEffectsCondition');
    expect(effect).toBeDefined();
  });

  it('Should apply pills with qr-codes', async () => {
    const model = getExampleModel();

    const events = getEvents(model.modelId, [{ eventType: 'scanQR', data: { type: 1, payload: '111-113' } }], Date.now(), true);
    const { baseModel } = await process(model, events);

    const effect = find(baseModel.modifiers, (m: any) => m.id == 'narcoEffectsCondition');
    expect(effect).toBeDefined();
  });
});
