import { expect } from 'chai';

import { ManagerToken } from '../../src/di_tokens';
import { Manager } from '../../src/manager';

import Container from 'typedi';
import { destroyDatabases, initDiAndDatabases } from '../init';
import {
  createModel, getModelVariantsAtTimestamp, pushEvent, pushRefreshEvent,
} from '../model_helpers';

async function createAndStartManager(): Promise<Manager> {
  const manager = Container.get(ManagerToken);
  await manager.init();
  return manager;
}

describe('Prepopulated events', function() {
  this.timeout(5000);

  let manager: Manager;
  const di = Container;

  beforeEach(async () => {
    await initDiAndDatabases();
  });

  afterEach(async () => {
    await manager.stop();
    await destroyDatabases();
  });

  it('Processes events existed before start', async () => {
    const model = await createModel(di, undefined, { value: '', otherValue: 'some useless info' });
    const timestamp = model.timestamp;

    await pushEvent(di, {
      characterId: model._id,
      eventType: 'concat',
      timestamp: timestamp + 5,
      data: { value: 'A' },
    });

    await pushRefreshEvent(di, model._id, timestamp + 10);

    manager = await createAndStartManager();

    const [baseModel, workingModel, viewModel] =
      await getModelVariantsAtTimestamp(di, model._id, timestamp + 10,
        ['models', 'workingModels', 'defaultViewModels']);

    expect(baseModel).to.exist;
    expect(workingModel).to.exist;
    expect(viewModel).to.exist;
    expect(baseModel).to.has.property('value', 'A');
    expect(baseModel).to.has.property('otherValue', 'some useless info');
    expect(workingModel).to.has.property('value', 'A');
    expect(workingModel).to.has.property('timestamp', baseModel.timestamp);
    expect(viewModel).to.has.property('value', 'A');
    expect(viewModel).to.has.property('timestamp', baseModel.timestamp);
    expect(viewModel).not.to.has.property('otherValue');
  });

  it('Will ignore events earlier than model timestamp', async () => {
    const model = await createModel(di, undefined, { value: '', otherValue: 'some useless info' });
    const timestamp = model.timestamp;

    // Following 2 events are in model "past"
    await pushEvent(di, {
      characterId: model._id,
      eventType: 'concat',
      timestamp: timestamp - 5,
      data: { value: 'A' },
    });

    await pushRefreshEvent(di, model._id, timestamp - 3);
    await pushRefreshEvent(di, model._id, timestamp + 10);

    manager = await createAndStartManager();

    const [baseModel, workingModel, viewModel] =
      await getModelVariantsAtTimestamp(di, model._id, timestamp + 10,
        ['models', 'workingModels', 'defaultViewModels']);

    expect(baseModel).to.exist;
    expect(workingModel).to.exist;
    expect(viewModel).to.exist;
    expect(baseModel).to.has.property('value', '');
    expect(baseModel).to.has.property('otherValue', 'some useless info');
    expect(workingModel).to.has.property('value', '');
    expect(workingModel).to.has.property('timestamp', baseModel.timestamp);
    expect(viewModel).to.has.property('value', '');
    expect(viewModel).to.has.property('timestamp', baseModel.timestamp);
    expect(viewModel).not.to.has.property('otherValue');
  });
});
