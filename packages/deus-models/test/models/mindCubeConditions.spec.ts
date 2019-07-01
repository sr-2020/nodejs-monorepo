//Тесты для показа состояний в зависимости от знаений кубиков сознания

import { expect } from 'chai';
import { process } from '../test_helpers';
import { getExampleModel } from '../fixtures/models';
import { getRefreshEvent } from '../fixtures/events';

describe('Mind Cubes conditions tests: ', () => {
  it('Show condition #1', async function() {
    let model = getExampleModel();

    model.mind.A[0] = 19; //mcube-condition-A0-2
    model.mind.F[0] = 20; //mcube-condition-F0-3

    let events = [getRefreshEvent(model.modelId, model.timestamp + 100)];
    let { baseModel, workingModel } = await process(model, events);

    let cond1 = workingModel.conditions.find((c: any) => c.id == 'mcube-condition-A0-2');

    expect(cond1).to.exist;
    expect(cond1).to.exist;

    cond1 = baseModel.conditions.find((c: any) => c.id == 'mcube-condition-A0-2');

    expect(cond1).to.not.exist;
    expect(cond1).to.not.exist;
  });
});
