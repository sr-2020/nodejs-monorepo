import { process } from '../test_helpers';
import { getExampleModel } from '../fixtures/models';
import { getEvents, getRefreshEvent } from '../fixtures/events';

describe('Recovery Implants: ', () => {
  it.skip('Reduce HP && auto-recover HP', async function () {
    const model = getExampleModel();
    model.hp = 3;
    model.maxHp = 3;
    let events = getEvents(model.modelId, [{ eventType: 'add-implant', data: { id: 'jj_biolymph' } }], model.timestamp + 100, true);
    let { baseModel, workingModel } = await process(model, events);

    expect(workingModel.hp).toBe(3);

    events = getEvents(model.modelId, [{ eventType: 'get-damage', data: { hpLost: 2 } }], baseModel.timestamp + 100, true);
    ({ baseModel, workingModel } = await process(baseModel, events));

    expect(workingModel.hp).toBe(1);

    //Wait 11 min
    events = [getRefreshEvent(model.modelId, baseModel.timestamp + 660 * 1000)];
    ({ baseModel, workingModel } = await process(baseModel, events));

    expect(workingModel.hp).toBe(2);

    //Wait 11 min
    events = [getRefreshEvent(model.modelId, baseModel.timestamp + 660 * 1000)];
    ({ baseModel, workingModel } = await process(baseModel, events));

    expect(workingModel.hp).toBe(3);

    //Wait 11 min
    events = [getRefreshEvent(model.modelId, baseModel.timestamp + 660 * 1000)];
    ({ baseModel, workingModel } = await process(baseModel, events));

    expect(workingModel.hp).toBe(3);
  });

  it('Reduce HP and implant - restore from zero', async function () {
    const model = getExampleModel();
    let events = getEvents(model.modelId, [{ eventType: 'add-implant', data: { id: 'jj_meditation' } }], model.timestamp + 100, true);

    let { baseModel, workingModel } = await process(model, events);

    console.log('TEST:======================== character damage! ==============================================');
    //Нанесли повреждения
    events = getEvents(model.modelId, [{ eventType: 'get-damage', data: { hpLost: 4 } }], baseModel.timestamp + 100, true);
    ({ baseModel, workingModel } = await process(baseModel, events));

    expect(workingModel.hp).toBe(0);
    expect(baseModel.isAlive).toBe(true);

    console.log('TEST:====================== wait 21 minutes! =================================');
    //Прошло 21 минут (восстановились в 2 хита)
    events = [getRefreshEvent(model.modelId, baseModel.timestamp + 21 * 60 * 1000)];
    ({ baseModel, workingModel } = await process(baseModel, events));

    expect(workingModel.hp).toBe(2);

    console.log('TEST:====================== wait 10 minutes! =================================');
    //Прошло 10 минут (потеряли еще хит)
    events = [getRefreshEvent(model.modelId, baseModel.timestamp + 10 * 60 * 1000)];
    ({ baseModel, workingModel } = await process(baseModel, events));

    expect(workingModel.hp).toBe(1);

    console.log('TEST:====================== wait 35 minutes! =================================');
    events = [getRefreshEvent(model.modelId, baseModel.timestamp + 35 * 60 * 1000)];
    ({ baseModel, workingModel } = await process(baseModel, events));

    expect(workingModel.hp).toBe(1);

    console.log('TEST:====================== wait 35 minutes! =================================');
    events = [getRefreshEvent(model.modelId, baseModel.timestamp + 35 * 60 * 1000)];
    ({ baseModel, workingModel } = await process(baseModel, events));

    console.log('TEST:====================== wait 40 minutes! =================================');
    events = [getRefreshEvent(model.modelId, baseModel.timestamp + 40 * 60 * 1000)];
    ({ baseModel, workingModel } = await process(baseModel, events));

    expect(workingModel.isAlive).toBe(false);
  });
});
