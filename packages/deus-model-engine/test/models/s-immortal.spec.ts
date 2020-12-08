/* eslint-disable no-unused-expressions */
import { process } from '../test_helpers';
import { getExampleModel } from '../fixtures/models';
import { getEvents, getRefreshEvent } from '../fixtures/events';

describe('Serenity immortality: ', () => {
  it('Install first stage implant', async function () {
    const model = getExampleModel();
    let events = getEvents(model.modelId, [{ eventType: 'add-implant', data: { id: 's_immortal01' } }], model.timestamp + 100);
    let { baseModel, workingModel } = await process(model, events);

    let cond = workingModel.conditions.find((c: any) => c.id == 'serenity-immortality-ready');
    expect(cond).toBeFalsy();

    expect(baseModel.timers.length).toBe(1);
    expect(baseModel.timers[0].name).toBe('_s_immortal01_timer');

    console.log('================Pass 60 minutes ===============');

    events = [getRefreshEvent(model.modelId, baseModel.timestamp + 700 * 1000)];
    ({ baseModel, workingModel } = await process(baseModel, events));

    cond = workingModel.conditions.find((c: any) => c.id == 'serenity-immortality-ready');
    expect(cond).toBeDefined();
  });

  it('Run modernization', async function () {
    //Подготовить к модернизации
    const model = getExampleModel();
    let events = getEvents(
      model.modelId,
      [
        { eventType: 'add-implant', data: { id: 'jj_meditation' } },
        { eventType: 'add-implant', data: { id: 's_immortal01' } },
      ],
      model.timestamp + 100,
    );
    let { baseModel, workingModel } = await process(model, events);

    events = [getRefreshEvent(model.modelId, baseModel.timestamp + 700 * 1000)];
    ({ baseModel, workingModel } = await process(baseModel, events));

    console.log('============ Damage and illness ===============');

    //Поранить и заразить персонажа
    events = getEvents(
      model.modelId,
      [
        { eventType: 'start-illness', data: { id: 'arthritis' } },
        { eventType: 'get-damage', data: { hpLost: 1 } },
      ],
      baseModel.timestamp + 100,
    );
    ({ baseModel, workingModel } = await process(baseModel, events));

    let ill = baseModel.modifiers.find((m: any) => m.class == 'illness');

    expect(ill).toBeDefined();
    expect(workingModel.hp).toBe(3);

    console.log('============ Start modernization ===============');

    //Принять "таблетку" модернизации
    events = getEvents(model.modelId, [{ eventType: 'serenity-immortality-go', data: {} }], baseModel.timestamp + 100);
    ({ baseModel, workingModel } = await process(baseModel, events));

    expect(baseModel.profileType).toBe('ex-human-robot');
    expect(workingModel.hp).toBe(4);

    ill = baseModel.modifiers.find((m: any) => m.class == 'illness');
    expect(ill).toBeFalsy();

    expect(ill).toBeFalsy();

    expect(baseModel.systems).toBeFalsy();
    expect(baseModel.generation).toBeFalsy();

    expect(baseModel.mind.C[7]).toEqual(100);
    expect(baseModel.mind.D[8]).toEqual(100);
  });

  it('Install first stage implant and try install another', async function () {
    const model = getExampleModel();
    const events = getEvents(
      model.modelId,
      [
        { eventType: 'add-implant', data: { id: 's_immortal01' } },
        { eventType: 'add-implant', data: { id: 'lab_maninthemiddle' } },
        { eventType: 'add-implant', data: { id: 'lab_maninthemiddle2' } },
      ],
      model.timestamp + 100,
    );
    const { baseModel } = await process(model, events);

    const imp = baseModel.modifiers.find((m: any) => m.id == 's_immortal01');
    const imp2 = baseModel.modifiers.find((m: any) => m.id == 'lab_maninthemiddle');
    const imp3 = baseModel.modifiers.find((m: any) => m.id == 'lab_maninthemiddle2');

    expect(imp).toBeDefined();
    expect(imp2).toBeDefined();
    expect(imp3).toBeFalsy();
  });
});
