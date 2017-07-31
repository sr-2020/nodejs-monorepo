import { expect } from 'chai';
import { process } from '../test_helpers';
import { getExampleModel } from '../fixtures/models';
import { getEvents, getRefreshEvent } from '../fixtures/events';

describe('Recovery Implants: ', () => {
    it("Reduce HP && auto-recover HP", async function() {
        let model = getExampleModel();
        model.hp = 3;
        model.maxHp = 3;
        let events = getEvents(model._id, [{ eventType: 'add-implant', data: { id: "jj_biolymph" } }], model.timestamp + 100, true);
        let { baseModel, workingModel } = await process(model, events);

        expect(workingModel.hp).is.equal(3);

        events = getEvents(model._id, [{ eventType: 'subtractHp', data: { hpLost: 2 } }], baseModel.timestamp + 100, true);
        ({ baseModel, workingModel } = await process(baseModel, events));

        expect(workingModel.hp).is.equal(1);

        //Wait 11 min
        events = [getRefreshEvent(model._id, baseModel.timestamp + 660 * 1000)];
        ({ baseModel, workingModel } = await process(baseModel, events));

        expect(workingModel.hp).is.equal(2);

        //Wait 11 min
        events = [getRefreshEvent(model._id, baseModel.timestamp + 660 * 1000)];
        ({ baseModel, workingModel } = await process(baseModel, events));

        expect(workingModel.hp).is.equal(3);

        //Wait 11 min
        events = [getRefreshEvent(model._id, baseModel.timestamp + 660 * 1000)];
        ({ baseModel, workingModel } = await process(baseModel, events));

        expect(workingModel.hp).is.equal(3);
    });

});
