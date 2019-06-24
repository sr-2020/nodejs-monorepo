import { expect } from 'chai';
import 'mocha';

import { ManagerToken } from '../../src/di_tokens';
import { Manager } from '../../src/manager';

import Container from 'typedi';
import { delay } from '../../src/utils';
import { destroyDatabases, initDi } from '../init';
import {
  createModel, getModelAtTimestamp, getModelVariants,
  getModelVariantsAtTimestamp, getObject, pushEvent, pushRefreshEvent, saveObject,
} from '../model_helpers';

describe('Green way', function() {
  this.timeout(5000);

  let manager: Manager | null;
  const di = Container;

  beforeEach(async () => {
    await initDi();
    manager = di.get(ManagerToken);
    await manager.init();
  });

  afterEach(async () => {
    if (manager) {
      await manager.stop();
      manager = null;
    }
    await destroyDatabases();
  });

  it('Should process events', async () => {
    const model = await createModel(undefined, { value: '', otherValue: 'some useless info' });
    const timestamp = model.timestamp;

    await pushEvent({
      characterId: model._id,
      eventType: 'concat',
      timestamp: timestamp + 5,
      data: { value: 'A' },
    });

    await pushRefreshEvent(model._id, timestamp + 10);

    const [baseModel, workingModel, viewModel] =
      await getModelVariantsAtTimestamp(model._id, timestamp + 10,
        ['models', 'workingModels', 'defaultViewModels']);

    expect(baseModel).to.exist;
    expect(workingModel).to.exist;
    expect(viewModel).to.exist;

    if (!baseModel || !workingModel || !viewModel) throw new Error('imposible!');

    expect(baseModel).to.has.property('value', 'A');
    expect(baseModel).to.has.property('otherValue', 'some useless info');
    expect(workingModel).to.has.property('value', 'A');
    expect(workingModel).to.has.property('timestamp', baseModel.timestamp);
    expect(viewModel).to.has.property('value', 'A');
    expect(viewModel).to.has.property('timestamp', baseModel.timestamp);
    expect(viewModel).not.to.has.property('otherValue');
  });

  it('Should sort events by timestamp', async () => {
    const model = await createModel();
    const timestamp = model.timestamp;

    await pushEvent({
      characterId: model._id,
      eventType: 'concat',
      timestamp: timestamp + 100,
      data: { value: 'A' },
    });

    await pushEvent({
      characterId: model._id,
      eventType: 'concat',
      timestamp: timestamp + 50,
      data: { value: 'B' },
    });

    await pushEvent({
      characterId: model._id,
      eventType: 'concat',
      timestamp: timestamp + 200,
      data: { value: 'C' },
    });

    await pushRefreshEvent(model._id, timestamp + 150);

    const [baseModel, workingModel, viewModel] =
      await getModelVariantsAtTimestamp(model._id, timestamp + 150,
        ['models', 'workingModels', 'defaultViewModels']);

    if (!baseModel || !workingModel || !viewModel) throw new Error('imposible!');

    expect(baseModel).to.has.property('value', 'BA');
    expect(baseModel.timestamp).to.be.equal(timestamp + 150);
  });

  it('Should continue to process events for the same character', async () => {
    const model = await createModel();
    let timestamp = model.timestamp;

    await pushEvent({
      characterId: model._id,
      eventType: 'concat',
      timestamp: timestamp + 10,
      data: { value: 'A' },
    });

    await pushRefreshEvent(model._id, timestamp + 20);

    await delay(400);

    timestamp = Date.now();

    await pushEvent({
      characterId: model._id,
      eventType: 'concat',
      timestamp: timestamp + 10,
      data: { value: 'B' },
    });

    await pushRefreshEvent(model._id, timestamp + 20);

    const baseModel = await getModelAtTimestamp(model._id, timestamp + 20);
    expect(baseModel).to.has.property('value', 'AB');
  });

  it('Should process events queued with short intervals', async () => {
    const model = await createModel();
    const timestamp = model.timestamp + 1;

    await pushRefreshEvent(model._id, timestamp + 0);
    await pushRefreshEvent(model._id, timestamp + 1);
    await pushRefreshEvent(model._id, timestamp + 2);

    const [baseModel, workingModel, viewModel] =
      await getModelVariantsAtTimestamp(model._id, timestamp + 2,
        ['models', 'workingModels', 'defaultViewModels']);

    if (!baseModel || !workingModel || !viewModel) throw new Error('imposible!');

    expect(baseModel.timestamp).to.be.equal(timestamp + 2);
  });

  it('Should be able to aquire external objects', async () => {
    const model = await createModel();
    const timestamp = model.timestamp;

    await saveObject('counters', {
      _id: 'abc',
      value: 0,
    });

    await pushEvent({
      characterId: model._id,
      eventType: 'increaseExternalCounterAbc',
      timestamp: timestamp + 10,
    });

    await pushRefreshEvent(model._id, timestamp + 20);

    await pushEvent({
      characterId: model._id,
      eventType: 'increaseExternalCounterAbc',
      timestamp: timestamp + 30,
    });

    await pushRefreshEvent(model._id, timestamp + 50);

    // Not interested in actual model, just wait for processing.
    await getModelAtTimestamp(model._id, timestamp + 50);

    const abc = await getObject('counters', 'abc');

    expect(abc).to.exist;
    expect(abc).to.deep.include({value: 2});
  });

  it('Do not save undefined viewmodels', async () => {
    const model = await createModel(undefined, { skipFromViewmodel: true });
    const timestamp = model.timestamp;

    await pushRefreshEvent(model._id, timestamp + 1);

    const [baseModel, workingModel] =
      await getModelVariantsAtTimestamp(model._id, timestamp + 1, ['models', 'workingModels']);

    expect(baseModel).to.exist;
    expect(workingModel).to.exist;

    const [viewModel] = await getModelVariants(model._id, ['defaultViewModels']);
    expect(viewModel).not.to.exist;
  });
});
