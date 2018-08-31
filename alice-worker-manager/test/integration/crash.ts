import { expect } from 'chai';
import { cloneDeep } from 'lodash';

import { ManagerToken } from '../../src/di_tokens';
import { Manager } from '../../src/manager';

import { Container } from 'typedi';
import { defaultConfig, destroyDatabases, initDiAndDatabases } from '../init';
import { createModel, createModelObj, getModel, getModelAtTimestamp,
  pushEvent, pushRefreshEvent, saveModel } from '../model_helpers';

describe('Crash scenarios', function() {
  this.timeout(15000);

  let manager: Manager | null;
  const di = Container;

  beforeEach(async () => {
    const config = cloneDeep(defaultConfig);
    config.logger.default = { console: { silent: true } };
    await initDiAndDatabases(config);
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

  it('Should not crash if model crashes', async () => {
    const crashModel = await createModel();
    let timestamp = crashModel.timestamp + 1;

    await pushEvent({
      characterId: crashModel._id,
      eventType: 'crash',
      timestamp,
    });

    await pushRefreshEvent(crashModel._id, timestamp + 2);

    await pushRefreshEvent(crashModel._id, timestamp + 3);

    await pushRefreshEvent(crashModel._id, timestamp + 4);

    await pushRefreshEvent(crashModel._id, timestamp + 4);

    // now let's try normal operation

    const anotherModel = await createModel();
    timestamp = anotherModel.timestamp + 1;

    await pushEvent({
      characterId: anotherModel._id,
      eventType: 'concat',
      timestamp,
      data: { value: 'A' },
    });

    await pushRefreshEvent(anotherModel._id, timestamp + 50);

    const baseModel = await getModelAtTimestamp(anotherModel._id, timestamp + 50);

    expect(baseModel).to.has.property('value', 'A');
  });

  it('Shoud not crash if model has no timestamp', async () => {
    const model = createModelObj();
    const timestamp = model.timestamp + 1;
    delete model.timestamp;
    await saveModel(model);

    let baseModel = await getModel(model._id);
    expect(baseModel).not.to.has.property('timestamp');

    await pushRefreshEvent(model._id, timestamp);

    baseModel = await getModelAtTimestamp(model._id, timestamp);

    expect(baseModel).to.has.property('timestamp');
  });

  it('Should not crash if worker was somehow killed', async () => {
    const crashModel = await createModel();
    let timestamp = crashModel.timestamp + 1;

    await pushEvent({
      characterId: crashModel._id,
      eventType: 'kill',
      timestamp,
    });

    await pushRefreshEvent(crashModel._id, timestamp + 2);

    await pushRefreshEvent(crashModel._id, timestamp + 3);

    await pushRefreshEvent(crashModel._id, timestamp + 4);

    await pushRefreshEvent(crashModel._id, timestamp + 4);

    // now let's try normal operation

    const anotherModel = await createModel();
    timestamp = anotherModel.timestamp + 1;

    await pushEvent({
      characterId: anotherModel._id,
      eventType: 'concat',
      timestamp,
      data: { value: 'A' },
    });

    await pushRefreshEvent(anotherModel._id, timestamp + 50);

    const baseModel = await getModelAtTimestamp(anotherModel._id, timestamp + 50);

    expect(baseModel).to.has.property('value', 'A');
  });
});
