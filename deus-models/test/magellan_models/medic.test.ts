import { expect } from 'chai';
import { process } from '../test_helpers';
import { getExampleMedicModel } from '../fixtures/models';
import { getEvents, getRefreshEvent } from '../fixtures/events';

describe('Medic Magellan events: ', () => {
    it("No-op refresh model", async function () {
        const model = getExampleMedicModel();
        const events = [getRefreshEvent(model._id, model.timestamp + 610 * 1000)];
        let { baseModel, workingModel } = await process(model, events);

        expect(baseModel.timestamp).to.equal(610 * 1000);
        expect(workingModel.timestamp).to.equal(610 * 1000);

        model.timestamp = 610 * 1000;

        expect(baseModel).to.deep.equal(model);
    });

    it("Add tests via QR", async function () {
        let model = getExampleMedicModel();
        
        const data = {
            type: 20,
            kind: 0,
            validUntil: 0,
            payload: 'abc3t5,12'
        }

        let events = getEvents(model._id,
            [{ eventType: 'scanQr', data }], 100);
        
        model.numTests = 10;
        model = (await process(model, events)).baseModel;
        expect(model.numTests).to.deep.equal(10 + 12);
    });
});