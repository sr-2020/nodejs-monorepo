//Тесты для моделей управления имплантами

import { process } from '../test_helpers';
import { getExampleModel } from '../fixtures/models';
import { getEvents, getRefreshEvent } from '../fixtures/events';

describe('Implants: ', () => {
  it('Add implant', async function () {
    const eventData = { id: 's_stability' };
    const model = getExampleModel();
    const events = getEvents(model.modelId, [{ eventType: 'add-implant', data: eventData }]);

    const { baseModel } = await process(model, events);

    const implant = baseModel.modifiers.find((e: any) => e.id == 's_stability');

    expect(implant).toBeDefined();
    expect(implant).toHaveProperty('enabled', true);

    const changeRecord = baseModel.changes.find((e: any) => e.text == 'Установлен имплант: Киберпротез ноги «Стабильность»');
    expect(changeRecord).toBeDefined();
  });

  it('Add implant to exhuman-program', async function () {
    const model = getExampleModel();

    model.profileType = 'exhuman-program';

    const events = getEvents(model.modelId, [{ eventType: 'add-implant', data: { id: 's_and_basic' } }]);

    const { baseModel } = await process(model, events);

    const implant = baseModel.modifiers.find((e: any) => e.id == 's_and_basic');

    expect(implant).toBeFalsy();
  });

  it('Add implant to robot', async function () {
    const model = getExampleModel();

    model.profileType = 'robot';

    const events = getEvents(model.modelId, [{ eventType: 'add-implant', data: { id: 's_and_basic' } }]);

    const { baseModel } = await process(model, events);

    const implant = baseModel.modifiers.find((e: any) => e.id == 's_and_basic');

    expect(implant).toBeDefined();
    expect(implant).toHaveProperty('enabled', true);
    //printModel(baseModel);

    const changeRecord = baseModel.changes.find((e: any) => e.text.startsWith('Установлено системное ПО'));
    expect(changeRecord).toBeDefined();
  });

  it('Add double implant', async function () {
    const eventData = { id: 's_stability' };
    const model = getExampleModel();
    let events = getEvents(model.modelId, [{ eventType: 'add-implant', data: eventData }], model.timestamp + 100, true);

    let { baseModel } = await process(model, events);

    const implant = baseModel.modifiers.find((e: any) => e.id == 's_stability');

    expect(implant).toBeDefined();
    expect(implant).toHaveProperty('enabled', true);

    const changeRecord = baseModel.changes.find((e: any) => e.text == 'Установлен имплант: Киберпротез ноги «Стабильность»');
    expect(changeRecord).toBeDefined();

    events = getEvents(model.modelId, [{ eventType: 'add-implant', data: eventData }], baseModel.timestamp + 100, true);
    ({ baseModel } = await process(baseModel, events));

    const implants = baseModel.modifiers.filter((e: any) => e.id == 's_stability');

    expect(implants.length).toBe(1);
  });

  it('Add two implants for one system', async function () {
    const model = getExampleModel();
    const events = getEvents(
      model.modelId,
      [
        { eventType: 'add-implant', data: { id: 's_stability' } },
        { eventType: 'add-implant', data: { id: 's_orphey' } },
      ],
      model.timestamp + 100,
    );

    const { baseModel } = await process(model, events);

    const implant = baseModel.modifiers.find((e: any) => e.id == 's_stability');
    const implant2 = baseModel.modifiers.find((e: any) => e.id == 's_orphey');

    expect(implant).toBeDefined();
    expect(implant).toHaveProperty('enabled', true);
    expect(implant2).toBeDefined();
    expect(implant2).toHaveProperty('enabled', true);

    let changeRecord = baseModel.changes.find((e: any) => e.text == 'Установлен имплант: Киберпротез ноги «Стабильность»');
    expect(changeRecord).toBeDefined();

    changeRecord = baseModel.changes.find((e: any) => e.text == 'Установлен имплант: Киберпротез руки «Орфей»');
    expect(changeRecord).toBeDefined();
  });

  it('Add implant and stop illness', async function () {
    const model = getExampleModel();
    let events = getEvents(model.modelId, [{ eventType: 'start-illness', data: { id: 'arthritis' } }], model.timestamp + 100);
    let { baseModel, workingModel } = await process(model, events);

    let illness = baseModel.modifiers.find((m: any) => m.id == 'arthritis');
    expect(illness).toBeDefined();

    const cond = workingModel.conditions.find((c: any) => c.id == 'arthritis-0');
    expect(cond).toBeDefined();

    events = getEvents(model.modelId, [{ eventType: 'add-implant', data: { id: 's_stability' } }], baseModel.timestamp + 100);
    ({ baseModel, workingModel } = await process(baseModel, events));

    const implant = baseModel.modifiers.find((e: any) => e.id == 's_stability');
    illness = baseModel.modifiers.find((m: any) => m.id == 'arthritis');

    expect(implant).toBeDefined();
    expect(implant).toHaveProperty('enabled', true);

    expect(illness).toBeFalsy();
  });

  it('Add implant and stop illness 2', async function () {
    const model = getExampleModel();
    let events = getEvents(model.modelId, [{ eventType: 'start-illness', data: { id: 'acromegaly' } }], model.timestamp + 100);
    let { baseModel, workingModel } = await process(model, events);

    let illness = baseModel.modifiers.find((m: any) => m.id == 'acromegaly');
    expect(illness).toBeDefined();

    const cond = workingModel.conditions.find((c: any) => c.id == 'acromegaly-0');
    expect(cond).toBeDefined();

    events = getEvents(model.modelId, [{ eventType: 'add-implant', data: { id: 'jj_i_am_girl' } }], baseModel.timestamp + 100);
    ({ baseModel, workingModel } = await process(baseModel, events));

    const implant = baseModel.modifiers.find((e: any) => e.id == 'jj_i_am_girl');
    illness = baseModel.modifiers.find((m: any) => m.id == 'acromegaly');

    expect(implant).toBeDefined();
    expect(implant).toHaveProperty('enabled', true);

    expect(illness).toBeFalsy();
  });

  it('Remove implant', async function () {
    const eventData = { id: 's_stability' };
    const model = getExampleModel();
    let events = getEvents(model.modelId, [{ eventType: 'add-implant', data: eventData }], 1500825797, true);

    let { baseModel } = await process(model, events);
    let implant = baseModel.modifiers.find((e: any) => e.id == 's_stability');

    //console.log(JSON.stringify(baseModel, null, 4));

    events = getEvents(model.modelId, [{ eventType: 'remove-implant', data: { mID: implant.mID } }], 1500825900, true);
    baseModel = (await process(baseModel, events)).baseModel;

    implant = baseModel.modifiers.find((e: any) => e.id == 's_stability');
    //console.log(JSON.stringify(baseModel, null, 4));

    expect(implant).toBeFalsy();

    const changeRecord = baseModel.changes.find((e: any) => e.text == 'Удален имплант: Киберпротез ноги «Стабильность»');
    expect(changeRecord).toBeDefined();
  });

  it('Show condition effect', async function () {
    const eventData = { id: 's_stability' };
    const model = getExampleModel();
    let events = getEvents(model.modelId, [{ eventType: 'add-implant', data: eventData }], 1500825797, true);

    let { baseModel, workingModel } = await process(model, events);

    //console.log(JSON.stringify(workingModel, null, 4));

    //Genome[6] = 0
    let condition = workingModel.conditions.find((e: any) => e.id == 's_stability-0');
    expect(condition).toBeDefined();

    //Genome[6] = 1
    baseModel.genome[6] = 1;
    events = [getRefreshEvent(model.modelId, 1500825900)];
    ({ baseModel, workingModel } = await process(baseModel, events));

    condition = workingModel.conditions.find((e: any) => e.id == 's_stability-1');
    expect(condition).toBeDefined();

    //Genome[6] = 4
    baseModel.genome[6] = 4;
    events = [getRefreshEvent(model.modelId, 1500825920)];
    ({ baseModel, workingModel } = await process(baseModel, events));

    condition = workingModel.conditions.find((e: any) => e.id == 's_stability-2');
    expect(condition).toBeDefined();

    //Genome[6] = 2 (no conditions)
    baseModel.genome[6] = 2;
    events = [getRefreshEvent(model.modelId, 1500825940)];
    ({ baseModel, workingModel } = await process(baseModel, events));

    condition = workingModel.conditions.find((e: any) => e.id.startsWith('s_stability'));
    expect(condition).toBeFalsy();
  });

  it('Instant install effects', async function () {
    //С7 == 41  => С7+20 = 61

    const eventData = { id: 's_stability' };
    let model = getExampleModel();
    let events = getEvents(model.modelId, [{ eventType: 'add-implant', data: eventData }], 1500825797, true);

    let { baseModel } = await process(model, events);

    const cubeVal = baseModel.mind.C[7];
    expect(cubeVal).toBe(61);

    //С7 == 63  => A1+10,B2-10,C3=20
    model = getExampleModel();
    model.mind.C[7] = 63;
    events = getEvents(model.modelId, [{ eventType: 'add-implant', data: eventData }], 1500825797, true);
    ({ baseModel } = await process(model, events));

    expect(baseModel.mind.A[1]).toBe(57);
    expect(baseModel.mind.B[2]).toBe(30);
    expect(baseModel.mind.C[3]).toBe(20);
  });

  it('Enable & Disable implant', async function () {
    const eventData = { id: 's_stability' };
    const model = getExampleModel();
    let events = getEvents(model.modelId, [{ eventType: 'add-implant', data: eventData }], model.timestamp + 100, true);

    let { baseModel } = await process(model, events);

    let implant = baseModel.modifiers.find((e: any) => e.id == 's_stability');

    expect(implant).toBeDefined();
    expect(implant).toHaveProperty('enabled', true);

    events = getEvents(baseModel._id, [{ eventType: 'disable-implant', data: { mID: implant.mID } }], baseModel.timestamp + 100, true);
    ({ baseModel } = await process(baseModel, events));

    //console.log(JSON.stringify(baseModel, null, 4));

    implant = baseModel.modifiers.find((e: any) => e.id == 's_stability');

    expect(implant).toBeDefined();
    expect(implant.enabled).toBe(false);

    events = getEvents(baseModel._id, [{ eventType: 'enable-implant', data: { mID: implant.mID } }], baseModel.timestamp + 100, true);
    ({ baseModel } = await process(baseModel, events));

    implant = baseModel.modifiers.find((e: any) => e.id == 's_stability');

    expect(implant).toBeDefined();
    expect(implant.enabled).toBe(true);
  });

  it('Disable implant with duration', async function () {
    const duration = 300; //5 minutes
    const model = getExampleModel();
    let events = getEvents(model.modelId, [{ eventType: 'add-implant', data: { id: 's_stability' } }], model.timestamp + 100, true);

    let { baseModel } = await process(model, events);

    let implant = baseModel.modifiers.find((e: any) => e.id == 's_stability');

    expect(implant).toBeDefined();
    expect(implant).toHaveProperty('enabled', true);

    //Отключаем имплант на время
    events = getEvents(
      baseModel._id,
      [{ eventType: 'disable-implant', data: { mID: implant.mID, duration } }],
      baseModel.timestamp + 100,
      true,
    );

    ({ baseModel } = await process(baseModel, events));

    implant = baseModel.modifiers.find((e: any) => e.id == 's_stability');

    expect(implant).toBeDefined();
    expect(implant.enabled).toBe(false);

    //Проверяем состояние импланта до истечения времени
    events = [getRefreshEvent(baseModel._id, baseModel.timestamp + Math.round((duration * 1000) / 2))];
    ({ baseModel } = await process(baseModel, events));

    implant = baseModel.modifiers.find((e: any) => e.id == 's_stability');

    expect(implant).toBeDefined();
    expect(implant.enabled).toBe(false);

    //Проверяем состояние импланта после истечения времени
    events = [getRefreshEvent(baseModel._id, baseModel.timestamp + duration * 1000 + 100)];

    ({ baseModel } = await process(baseModel, events));

    implant = baseModel.modifiers.find((e: any) => e.id == 's_stability');

    expect(implant).toBeDefined();
    expect(implant.enabled).toBe(true);
  });

  it('Change-properties effect', async function () {
    const model = getExampleModel();
    model.genome[9] = 2;

    let events = getEvents(model.modelId, [{ eventType: 'add-implant', data: { id: 'lab_maninthemiddle' } }], model.timestamp + 100, true);

    let { baseModel, workingModel } = await process(model, events);

    let implant = baseModel.modifiers.find((e: any) => e.id == 'lab_maninthemiddle');

    expect(implant).toBeDefined();
    expect(implant).toHaveProperty('enabled', true);

    expect(workingModel.maxProxy).toBe(102);

    events = getEvents(model.modelId, [{ eventType: 'add-implant', data: { id: 'jj_i_am_girl' } }], baseModel.timestamp + 100, true);
    ({ baseModel, workingModel } = await process(baseModel, events));

    implant = baseModel.modifiers.find((e: any) => e.id == 'jj_i_am_girl');

    expect(implant).toBeDefined();
    expect(implant).toHaveProperty('enabled', true);

    expect(workingModel.sex).toBe('female');

    const condition = workingModel.conditions.find((c: any) => c.id == 'jj_i_am_girl-2');

    expect(condition).toBeDefined();
  });
});
