import { expect } from 'chai';
import { Event } from 'deus-engine-manager-api';
import { merge } from 'lodash';
import { OrganismModel, ScanQRData, System, systemsIndices } from '../../helpers/basic-types';
import consts = require('../../helpers/constants');
import { getEvents, getRefreshEvent } from '../helpers/events';
import { getExampleBiologicalOrganismModel } from '../helpers/example-models';
import { process } from '../helpers/util';

interface Global {
  TEST_EXTERNAL_OBJECTS: any;
}

declare var global: Global;
global.TEST_EXTERNAL_OBJECTS = merge(global.TEST_EXTERNAL_OBJECTS, {
  counters: {
    'ss-111': { _id: 'ss-111' },
    'ss-112': { _id: 'ss-112' },
    'ss-113': { _id: 'ss-113' },
  },
});

function makeSystems(values: number[],
                     lastModifieds: number[] = [0, 0, 0, 0, 0, 0, 0],
                     nucleotides?: number[]): System[] {
  return systemsIndices().map((i) => {
    return {
      value: values[i], nucleotide: nucleotides ? nucleotides[i] : 0, lastModified: lastModifieds[i],
    };
  });
}

describe('General Magellan events: ', () => {

  it('No-op refresh model', async () => {
    const model = getExampleBiologicalOrganismModel();
    const events = [getRefreshEvent(model._id, model.timestamp + 610 * 1000)];
    const { baseModel, workingModel } = await process(model, events);

    expect(baseModel.timestamp).to.equal(610 * 1000);
    expect(workingModel.timestamp).to.equal(610 * 1000);

    model.timestamp = 610 * 1000;

    expect(baseModel).to.deep.equal(model);
  });

  it('Modify systems instant', async () => {
    const model = getExampleBiologicalOrganismModel();
    model.systems = makeSystems([0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [1, 0, -1, 0, 2, 0, 0]);
    const events = getEvents(model._id,
      [{ eventType: 'modify-nucleotide-instant', data: [1, 2, 3, 4, 5, 6, 0] }], 100);

    const { baseModel, workingModel } = await process(model, events);

    expect(baseModel.systems).to.deep.equal(
      makeSystems([0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [2, 2, 2, 4, 7, 6, 0]));
    expect(workingModel.systems).to.deep.equal(
      makeSystems([0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0], [2, 2, 2, 4, 7, 6, 0]));
  });

  it('Modify nucleotide instant', async () => {
    const model = getExampleBiologicalOrganismModel();
    model.systems = makeSystems([0, -1, 2, -3, 18, -2, 0]);
    const events = getEvents(model._id,
      [{ eventType: 'modify-systems-instant', data: [1, 2, 3, 4, 5, 6, 0] }], 100);

    const { baseModel, workingModel } = await process(model, events);

    expect(baseModel.systems).to.deep.equal(
      makeSystems([1, 1, 5, 1, 23, 4, 0], [100, 100, 100, 100, 100, 100, 0]));
    expect(workingModel.systems).to.deep.equal(
      makeSystems([1, 1, 5, 1, 23, 4, 0], [100, 100, 100, 100, 100, 100, 0]));
  });

  it('Use pill', async () => {
    let model = getExampleBiologicalOrganismModel();
    model.systems = makeSystems([0, 0, 0, 0, 0, 0, 0]);

    let events = getEvents(model._id,
      [{ eventType: 'biological-systems-influence', data: [1, 2, -2, -3, 0, 0, 0] }], 100);

    model = (await process(model, events)).baseModel;
    expect(model.systems).to.deep.equal(makeSystems([1, 1, -1, -1, 0, 0, 0], [100, 100, 100, 100, 0, 0, 0]));

    const p = consts.MAGELLAN_TICK_MILLISECONDS;

    events = [getRefreshEvent(model._id, model.timestamp + p)];
    model = (await process(model, events)).baseModel;
    expect(model.systems).to.deep.equal(
      makeSystems([1, 2, -2, -2, 0, 0, 0], [100, 100 + p, 100 + p, 100 + p, 0, 0, 0]));

    events = [getRefreshEvent(model._id, model.timestamp + p)];
    model = (await process(model, events)).baseModel;
    expect(model.systems).to.deep.equal(
      makeSystems([1, 2, -2, -3, 0, 0, 0], [100, 100 + p, 100 + p, 100 + 2 * p, 0, 0, 0]));

    events = [getRefreshEvent(model._id, model.timestamp + p)];
    model = (await process(model, events)).baseModel;
    expect(model.systems).to.deep.equal(
      makeSystems([1, 2, -2, -3, 0, 0, 0], [100, 100 + p, 100 + p, 100 + 2 * p, 0, 0, 0]));
  });

  it('Use pill via QR', async () => {
    let model = getExampleBiologicalOrganismModel();
    model.systems = makeSystems([0, 0, 0, 0, 0, 0, 0]);

    const data = {
      type: 4,
      kind: 0,
      validUntil: 0,
      payload: '1,2,-2,-3,0,0,0',
    };

    let events = getEvents(model._id,
      [{ eventType: 'scanQr', data }], 100);

    model = (await process(model, events)).baseModel;
    expect(model.systems).to.deep.equal(makeSystems([1, 1, -1, -1, 0, 0, 0], [100, 100, 100, 100, 0, 0, 0]));

    const p = consts.MAGELLAN_TICK_MILLISECONDS;

    events = [getRefreshEvent(model._id, model.timestamp + p)];
    model = (await process(model, events)).baseModel;
    expect(model.systems).to.deep.equal(
      makeSystems([1, 2, -2, -2, 0, 0, 0], [100, 100 + p, 100 + p, 100 + p, 0, 0, 0]));

    events = [getRefreshEvent(model._id, model.timestamp + p)];
    model = (await process(model, events)).baseModel;
    expect(model.systems).to.deep.equal(
      makeSystems([1, 2, -2, -3, 0, 0, 0], [100, 100 + p, 100 + p, 100 + 2 * p, 0, 0, 0]));

    events = [getRefreshEvent(model._id, model.timestamp + p)];
    model = (await process(model, events)).baseModel;
    expect(model.systems).to.deep.equal(
      makeSystems([1, 2, -2, -3, 0, 0, 0], [100, 100 + p, 100 + p, 100 + 2 * p, 0, 0, 0]));
  });

  it('Use blue mutation pill', async () => {
    let model = getExampleBiologicalOrganismModel();
    model.systems = makeSystems([0, 0, 0, 0, 0, 0, 0]);

    let events = getEvents(model._id,
      [{ eventType: 'biological-systems-influence', data: [0, 2, -2, 0, 1, 0, 0] }], 100);

    model = (await process(model, events)).baseModel;
    expect(model.systems).to.deep.equal(makeSystems([0, 1, -1, 0, 1, 0, 0], [0, 100, 100, 0, 100, 0, 0]));

    const p = consts.MAGELLAN_TICK_MILLISECONDS;

    events = [getRefreshEvent(model._id, model.timestamp + p)];
    model = (await process(model, events)).baseModel;
    expect(model.systems).to.deep.equal(makeSystems([0, 2, -2, 0, 1, 0, 0], [0, 100 + p, 100 + p, 0, 100, 0, 0]));

    events = [getRefreshEvent(model._id, model.timestamp + p)];
    model = (await process(model, events)).baseModel;
    expect(model.systems).to.deep.equal(makeSystems([0, 2, -2, 0, 1, 0, 0], [0, 100 + p, 100 + p, 0, 100, 0, 0],
      [0, 2, -2, 0, 1, 0, 0]));
  });

  it('Use blue mutation pill and introduce compatible change', async () => {
    let model = getExampleBiologicalOrganismModel();
    model.systems = makeSystems([0, 0, 0, 0, 0, 0, 0]);

    const p = consts.MAGELLAN_TICK_MILLISECONDS;
    const events: Event[] = [
      {
        characterId: model._id, eventType: 'biological-systems-influence',
        data: [0, 2, -2, 0, 1, 0, 0], timestamp: 100,
      },
      {
        characterId: model._id, eventType: 'biological-systems-influence',
        data: [0, 1, 0, 0, 0, 0, 0], timestamp: 200,
      },
      {
        characterId: model._id, eventType: 'biological-systems-influence',
        data: [0, -1, 0, 0, 0, 0, 0], timestamp: 300,
      },
      getRefreshEvent(model._id, 100 + 2 * p),
    ];

    model = (await process(model, events)).baseModel;
    expect(model.systems).to.deep.equal(makeSystems([0, 2, -2, 0, 1, 0, 0], [0, 100 + p, 100 + p, 0, 100, 0, 0],
      [0, 2, -2, 0, 1, 0, 0]));
  });

  it('Use blue mutation pill and introduce incompatible change', async () => {
    let model = getExampleBiologicalOrganismModel();
    model.systems = makeSystems([0, 0, 0, 0, 0, 0, 0]);

    const p = consts.MAGELLAN_TICK_MILLISECONDS;
    const events: Event[] = [
      {
        characterId: model._id, eventType: 'biological-systems-influence',
        data: [0, 2, -2, 0, 1, 0, 0], timestamp: 100,
      },
      {
        characterId: model._id, eventType: 'biological-systems-influence',
        data: [1, 0, 0, 0, 0, 0, 0], timestamp: 200,
      },
      {
        characterId: model._id, eventType: 'biological-systems-influence',
        data: [-1, 0, 0, 0, 0, 0, 0], timestamp: 300,
      },
      getRefreshEvent(model._id, 100 + 2 * p),
    ];

    model = (await process(model, events)).baseModel;
    expect(model.systems).to.deep.equal(makeSystems([0, 2, -2, 0, 1, 0, 0], [300, 100 + p, 100 + p, 0, 100, 0, 0]));
  });

  it('Enter and leave ship', async () => {
    let baseModel = getExampleBiologicalOrganismModel();
    let workingModel: any;

    let events = getEvents(baseModel._id, [{ eventType: 'enter-ship', data: 17 }]);
    ({ baseModel, workingModel } = (await process(baseModel, events)));

    let cond = workingModel.conditions.find((c: any) => c.id == 'on-the-ship');
    expect(cond).is.exist;
    expect(cond.text).to.contain('17');
    expect(workingModel.location).to.equal('ship_17');

    events = getEvents(baseModel._id, [{ eventType: 'enter-ship', data: 22 }]);
    ({ baseModel, workingModel } = (await process(baseModel, events)));

    cond = workingModel.conditions.find((c: any) => c.id == 'on-the-ship');
    expect(cond).is.exist;
    expect(cond.text).to.contain('22');
    expect(cond.text).not.to.contain('17');
    expect(workingModel.location).to.equal('ship_22');

    events = getEvents(baseModel._id, [{ eventType: 'leave-ship', data: {} }]);
    ({ baseModel, workingModel } = (await process(baseModel, events)));

    expect(workingModel.conditions).to.be.empty;
    expect(workingModel.location).not.exist;
  });

  it('Enter and leave ship QR', async () => {
    let baseModel = getExampleBiologicalOrganismModel();
    let workingModel: any;

    let events = getEvents(baseModel._id,
      [{ eventType: 'scanQr', data: { type: 5, kind: 0, validUntil: 0, payload: '17' } }]);
    ({ baseModel, workingModel } = (await process(baseModel, events)));

    const cond = workingModel.conditions.find((c: any) => c.id == 'on-the-ship');
    expect(cond).is.exist;
    expect(cond.text).to.contain('17');
    expect(workingModel.location).to.equal('ship_17');

    events = getEvents(baseModel._id,
      [{ eventType: 'scanQr', data: { type: 6, kind: 0, validUntil: 0, payload: '' } }]);
    ({ baseModel, workingModel } = (await process(baseModel, events)));

    expect(workingModel.conditions).to.be.empty;
    expect(workingModel.location).not.exist;
  });

  describe('Space suit actions', () => {
    it('Autoexpiration', async () => {
      let baseModel = getExampleBiologicalOrganismModel();
      baseModel.systems = makeSystems([0, 0, 0, 0, 0, 0, 0]);
      let workingModel: OrganismModel;

      let events = getEvents(baseModel._id,
        [{ eventType: 'scanQr', data: { type: 7, kind: 0, validUntil: 0, payload: 'ss-111,10' } }],
        100);
      ({ baseModel, workingModel } = (await process(baseModel, events)));
      expect(baseModel.spaceSuit).to.deep.include({on: true, oxygenCapacity: 600000, timestampWhenPutOn: 100});
      expect(workingModel.spaceSuit).to.deep.include({on: true, oxygenCapacity: 600000, timestampWhenPutOn: 100});

      events = getEvents(baseModel._id,
        [{ eventType: 'scanQr', data: { type: 9, kind: 0, validUntil: 0, payload: '1,0,0,0,0,0,0,100' } }],
        200);
      ({ baseModel, workingModel } = (await process(baseModel, events)));
      expect(baseModel.systems).to.deep.equal(makeSystems([0, 0, 0, 0, 0, 0, 0]));
      expect(workingModel.systems).to.deep.equal(makeSystems([0, 0, 0, 0, 0, 0, 0]));

      ({ baseModel, workingModel } = (await process(baseModel, getEvents(baseModel._id, [], 600000 + 100))));
      expect(baseModel.spaceSuit).to.deep.include({on: false});
      expect(workingModel.spaceSuit).to.deep.include({on: false});

      expect(baseModel.systems).to.deep.equal(makeSystems([1, 0, 0, 0, 0, 0, 0], [600000 + 100, 0, 0, 0, 0, 0, 0]));
      expect(workingModel.systems).to.deep.equal(makeSystems([1, 0, 0, 0, 0, 0, 0], [600000 + 100, 0, 0, 0, 0, 0, 0]));
    });

    it('Manual takeoff', async () => {
      let baseModel = getExampleBiologicalOrganismModel();
      baseModel.systems = makeSystems([0, 0, 0, 0, 0, 0, 0]);
      let workingModel: OrganismModel;

      const qrs: ScanQRData[] = [{ type: 7, kind: 0, validUntil: 0, payload: 'ss-112,10' }];
      // Add "weak" xenodisease
      qrs.push({type: 9, kind: 0, validUntil: 0, payload: '1,0,0,0,0,0,0,30' });
      // Add "strong" xenodisease
      qrs.push({type: 9, kind: 0, validUntil: 0, payload: '0,1,0,0,0,0,0,130' });
      // Add "medium" xenodiseases
      // We expect 65% (95 - 30) of them to stay
      for (let i = 0; i < 100; ++i)
        qrs.push({type: 9, kind: 0, validUntil: 0, payload: '0,0,1,0,0,0,0,95' });
      // Add manual space suit take off action
        qrs.push({type: 8, kind: 0, validUntil: 0, payload: '30' });

      const events = getEvents(baseModel._id, qrs.map((data) => ({eventType: 'scanQr', data })), 100);
      ({ baseModel, workingModel } = (await process(baseModel, events)));

      expect(baseModel.spaceSuit.on).to.be.false;
      expect(workingModel.spaceSuit.on).to.be.false;

      expect(baseModel.systems[0].value).to.eq(0);
      expect(baseModel.systems[1].value).to.eq(1);
      expect(baseModel.systems[2].value).to.approximately(65, 10);

      expect(workingModel.systems[0].value).to.eq(0);
      expect(workingModel.systems[1].value).to.eq(1);
      expect(workingModel.systems[2].value).to.approximately(65, 10);
    });

    it('Weak xenodisease without suit', async () => {
      let baseModel = getExampleBiologicalOrganismModel();
      baseModel.systems = makeSystems([0, 0, 0, 0, 0, 0, 0]);
      let workingModel: OrganismModel;

      const events = getEvents(baseModel._id,
        [{ eventType: 'scanQr', data: { type: 9, kind: 0, validUntil: 0, payload: '1,0,0,0,0,0,0,1' } }],
        200);
      ({ baseModel, workingModel } = (await process(baseModel, events)));
      expect(baseModel.systems).to.deep.equal(makeSystems([1, 0, 0, 0, 0, 0, 0], [200, 0, 0, 0, 0, 0, 0]));
      expect(workingModel.systems).to.deep.equal(makeSystems([1, 0, 0, 0, 0, 0, 0], [200, 0, 0, 0, 0, 0, 0]));
    });

    it('Can not use same space suit second time', async () => {
      let baseModel = getExampleBiologicalOrganismModel();
      let workingModel: OrganismModel;

      let events = getEvents(baseModel._id,
        [{ eventType: 'scanQr', data: { type: 7, kind: 0, validUntil: 0, payload: 'ss-113,1' } }], 100);
      ({ baseModel, workingModel } = (await process(baseModel, events)));
      expect(baseModel.spaceSuit.on).to.be.true;
      expect(workingModel.spaceSuit.on).to.be.true;

      events = getEvents(baseModel._id,
        [{ eventType: 'scanQr', data: { type: 7, kind: 0, validUntil: 0, payload: 'ss-113,1' } }], 60000 + 100);
        ({ baseModel, workingModel } = (await process(baseModel, events)));
      expect(baseModel.spaceSuit.on).to.be.false;
      expect(workingModel.spaceSuit.on).to.be.false;
    });
  });
});
