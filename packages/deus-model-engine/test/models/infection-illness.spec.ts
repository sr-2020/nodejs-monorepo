/* eslint-disable no-unused-expressions */
import { getPotentialSystemsIds, getTotalChance, whatSystemShouldBeInfected } from '../../helpers/infection-illness';
import { getExampleModel } from '../fixtures/models';
import { getEvents, getRefreshEvent } from '../fixtures/events';
import { process } from '../test_helpers';

describe('Infecton: ', () => {
  it('Calculate potentially bad systems', async () => {
    const model = getExampleModel();
    const count = getPotentialSystemsIds(model).length;

    expect(count).toBe(2);
  });

  it('Calculate total chance for W', async () => {
    const model = getExampleModel();
    const chance = getTotalChance(model);

    expect(chance).toBeCloseTo(0.0396, 8);
  });

  it('What systems should be infected', async () => {
    const model = getExampleModel();
    model.generation = 'X/Y';
    model.genome[0] = 1;
    model.genome[1] = 1;
    model.genome[2] = 1;
    model.genome[3] = 1;
    model.genome[4] = 1;
    model.genome[5] = 1;
    const system = whatSystemShouldBeInfected(model);
    expect(system).toBe(4);
  });

  it('Roll for infection', async () => {
    const model = getExampleModel();

    model.generation = 'X/Y';
    model.genome[0] = 1;
    model.genome[1] = 1;
    model.genome[2] = 1;
    model.genome[3] = 1;
    model.genome[4] = 1;
    model.genome[5] = 1;

    let events = getEvents(model.modelId, [{ eventType: 'roll-illness', data: {} }], model.timestamp);

    let { baseModel } = await process(model, events);

    events = [getRefreshEvent(model.modelId, model.timestamp + 24 * 60 * 60 * 1000)];

    ({ baseModel } = await process(baseModel, events));

    expect(baseModel.isAlive).toBe(false);
  });

  it('Roll for infection for exhuman program', async () => {
    const model = getExampleModel();

    model.generation = 'X/Y';
    model.genome = [];
    model.profileType = 'exhuman-program';

    let events = getEvents(model.modelId, [{ eventType: 'roll-illness', data: {} }], model.timestamp);

    let { baseModel } = await process(model, events);

    events = [getRefreshEvent(model.modelId, model.timestamp + 24 * 60 * 60 * 1000)];

    ({ baseModel } = await process(baseModel, events));

    expect(baseModel.isAlive).toBe(true);
  });
});
