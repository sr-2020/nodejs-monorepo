/* eslint-disable no-unused-expressions */
import { merge } from 'lodash';
import { expect } from 'chai';

import { process, findModifier, findChangeRecord } from '../test_helpers';
import { getExampleModel } from '../fixtures/models';
import { getEvents, getRefreshEvent } from '../fixtures/events';

const { pills } = require('../../catalogs/narco.json');

const STEP1 = pills.find((p: any) => p.id == 'jj-immortal-one');
const STEP2 = pills.find((p: any) => p.id == 'jj-immortal-two');

interface Global {
  TEST_EXTERNAL_OBJECTS: any;
}

// eslint-disable-next-line no-var
declare var global: Global;

global.TEST_EXTERNAL_OBJECTS = merge(global.TEST_EXTERNAL_OBJECTS, {
  pills: {
    'jj-immortality': {
      _id: 'jj-immortality',
      pillId: 'jj-immortal-one',
    },
  },
});

describe('JJ Immortality', () => {
  it('Use step one pill', async function () {
    const model = getExampleModel();
    model.changes = [];
    let events = getEvents(model.modelId, [{ eventType: 'jj-immortal-one-start', data: { pill: STEP1 } }]);

    let { baseModel, workingModel } = await process(model, events);

    const jjOne = findModifier('jj-immortal-one', baseModel);
    expect(jjOne).to.exist;
    expect(jjOne.currentStage).to.equals(0);
    expect(baseModel.timers.length).equals(1);
    expect(baseModel.timers[0].name).equals('jj-immortal-one-' + jjOne.mID);
    expect(findChangeRecord(STEP1.stages[0].text, workingModel)).to.exist;
    expect(findChangeRecord(STEP1.stages[1].text, workingModel)).not.to.exist;

    events = [getRefreshEvent(model.modelId, Date.now() + STEP1.stages[0].duration * 1000 + 10)];
    ({ baseModel, workingModel } = await process(baseModel, events));

    expect(findModifier('jj-immortal-one', baseModel)).to.has.property('currentStage', 1);
    expect(findChangeRecord(STEP1.stages[0].text, workingModel)).to.exist;
    expect(findChangeRecord(STEP1.stages[1].text, workingModel)).to.exist;
    expect(findChangeRecord(STEP1.stages[2].text, workingModel)).not.to.exist;

    events = [getRefreshEvent(model.modelId, Date.now() + STEP1.stages[0].duration * 1000 + STEP1.stages[1].duration * 1000 + 10)];
    ({ baseModel, workingModel } = await process(baseModel, events));

    expect(findModifier('jj-immortal-one', baseModel)).to.has.property('currentStage', 2);
    expect(findChangeRecord(STEP1.stages[0].text, workingModel)).to.exist;
    expect(findChangeRecord(STEP1.stages[1].text, workingModel)).to.exist;
    expect(findChangeRecord(STEP1.stages[2].text, workingModel)).to.exist;

    events = [
      getRefreshEvent(
        model.modelId,
        Date.now() + STEP1.stages[0].duration * 1000 + STEP1.stages[1].duration * 1000 + STEP1.stages[2].duration * 1000 + 10,
      ),
    ];
    ({ baseModel, workingModel } = await process(baseModel, events));

    expect(findModifier('jj-immortal-one', baseModel)).not.to.exist;
    expect(findChangeRecord(STEP1.stages[0].text, workingModel)).to.exist;
    expect(findChangeRecord(STEP1.stages[1].text, workingModel)).to.exist;
    expect(findChangeRecord(STEP1.stages[2].text, workingModel)).to.exist;
    expect(findChangeRecord(STEP1.stages[3].text, workingModel)).to.exist;
  });

  it('Use step 2 pill', async function () {
    const model = getExampleModel();
    model.changes = [];
    const timestamp = Date.now() + STEP1.stages[0].duration * 1000 + STEP1.stages[1].duration * 1000 + 10;
    let events = getEvents(
      model.modelId,
      [{ eventType: 'jj-immortal-one-start', data: { pill: STEP1 } }, getRefreshEvent(model.modelId, timestamp)],
      Date.now(),
      false,
    );

    let { baseModel, workingModel } = await process(model, events);

    events = getEvents(model.modelId, [{ eventType: 'jj-immortal-two-start', data: { pill: STEP2 } }], timestamp + 100);
    ({ baseModel, workingModel } = await process(baseModel, events));

    const jjOne = findModifier('jj-immortal-one', baseModel);
    expect(jjOne).to.exist;

    expect(baseModel.timers.length).equals(1);
    expect(baseModel.timers[0].name).equals('jj-immortal-two-awake');

    expect(findChangeRecord(STEP2.stages[0], workingModel)).to.exist;
    expect(findChangeRecord(STEP2.stages[1], workingModel)).not.to.exist;

    events = [getRefreshEvent(model.modelId, timestamp + 5 * 60 * 1000 + 200)];
    ({ baseModel, workingModel } = await process(baseModel, events));

    expect(findModifier('jj-immortal-one', baseModel)).not.to.exist;
    expect(findChangeRecord(STEP2.stages[1], workingModel)).to.exist;
  });

  it('Usable with pill', async function () {
    const model = getExampleModel();
    model.changes = [];
    const events = getEvents(model.modelId, [{ eventType: 'usePill', data: { id: 'jj-immortality' } }], Date.now(), true);

    const { baseModel } = await process(model, events);

    const jjOne = findModifier('jj-immortal-one', baseModel);
    expect(jjOne).to.exist;
    expect(jjOne.currentStage).to.equals(0);
  });
});
