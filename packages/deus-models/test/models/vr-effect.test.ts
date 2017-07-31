//Тесты для событий VR

import { expect } from 'chai';
import { process, printModel } from '../test_helpers';
import { getExampleModel } from '../fixtures/models';
import { getEvents, getRefreshEvent } from '../fixtures/events';


describe('VR events: ', () => {

    it("Enter VR", async function() {
        let model = getExampleModel();
        let enterTimestamp = model.timestamp + 100;
        let events = getEvents(model._id, [{ eventType: 'enterVr', data: {} }], enterTimestamp);
        let { baseModel, workingModel } = await process(model, events);

        expect(baseModel.lastVREnterTimestamp).to.exist;
        expect(baseModel.lastVREnterTimestamp).is.equal(enterTimestamp);
    });

    it("Enter & Exit VR", async function() {
        let model = getExampleModel();
        let enterTimestamp = model.timestamp + 100;
        let events = getEvents(model._id, [{ eventType: 'enterVr', data: {} }], enterTimestamp);
        let { baseModel, workingModel } = await process(model, events);

        expect(baseModel.lastVREnterTimestamp).to.exist;
        expect(baseModel.lastVREnterTimestamp).is.equal(enterTimestamp);

        let exitTimestamp = model.timestamp + 610 * 1000;

        events = getEvents(model._id, [{ eventType: 'exitVr', data: {} }], exitTimestamp);
        ({ baseModel, workingModel } = await process(baseModel, events));

        expect(baseModel.lastVREnterDuration).to.exist;
        expect(Math.round(baseModel.lastVREnterDuration / 1000 / 60)).is.equal(10);
        expect(Math.round(baseModel.totalSpentInVR / 1000 / 60)).is.equal(10);
    });


});
