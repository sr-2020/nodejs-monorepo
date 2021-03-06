//Тесты для показа состояний в зависимости от знаений кубиков сознания

import { process } from '../test_helpers';
import { getExampleModel } from '../fixtures/models';
import { getRefreshEvent } from '../fixtures/events';

describe('Mind Cubes conditions tests: ', () => {
  it('Show condition #1', async function () {
    const model = getExampleModel();

    model.mind.A[0] = 19; //mcube-condition-A0-2
    model.mind.F[0] = 20; //mcube-condition-F0-3

    const events = [getRefreshEvent(model.modelId, model.timestamp + 100)];
    const { baseModel, workingModel } = await process(model, events);

    let cond1 = workingModel.conditions.find((c: any) => c.id == 'mcube-condition-A0-2');

    expect(cond1).toBeDefined();
    expect(cond1).toBeDefined();

    cond1 = baseModel.conditions.find((c: any) => c.id == 'mcube-condition-A0-2');

    expect(cond1).toBeFalsy();
    expect(cond1).toBeFalsy();
  });
});
