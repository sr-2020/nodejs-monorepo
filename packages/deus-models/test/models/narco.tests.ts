//Тесты наркотиков

import { expect } from 'chai';
import { process, printModel} from '../test_helpers';
import { getExampleModel } from '../fixtures/models';
import { getEvents, getRefreshEvent } from '../fixtures/events';

describe('Narco effects: ', () => {
    it("Change mind cube", async function() {
        
        let model = getExampleModel();
        let events = getEvents(model._id, [ {eventType: 'take-narco', data: "altnarco"} ], model.timestamp);
        let {baseModel, workingModel } = await process(model, events);

        expect(baseModel.mind.F[2]).is.equal(47);
        expect(workingModel.mind.E[1]).is.equal(100);
        expect(baseModel.mind.E[1]).is.equal(57);
    });

    it("Change mind cube back", async function() {
        
        let model = getExampleModel();
        
        let events = getEvents(model._id, [ {eventType: 'take-narco', data: "altnarco"} ], model.timestamp );
        events.push(getRefreshEvent(model._id, model.timestamp +   18000 * 1101 ));
        let {baseModel, workingModel } = await process(model, events);

        expect(baseModel.mind.F[2]).is.equal(47); //permanent change is here
        expect(workingModel.mind.E[1]).is.equal(57); //temporary change rolled back
    });

     it("Mind cube pushback", async function() {
        
        let model = getExampleModel();
        let events = getEvents(model._id, [ {eventType: 'take-narco', data: "altnarco"} ], model.timestamp );
        events.push(getRefreshEvent(model._id, model.timestamp +   18000 * 1001 ));
        let {baseModel, workingModel } = await process(model, events);

        expect(baseModel.mind.F[2]).is.equal(47); //permanent change is here
        expect(workingModel.mind.E[1]).is.equal(51); //temporary change rolled back
    });
});