//Тесты для событий общего назначения (для хакеров и т.д.)

import { expect } from 'chai';
import { process, printModel } from '../test_helpers';
import { getExampleModel } from '../fixtures/models';
import { getEvents, getRefreshEvent } from '../fixtures/events';

describe('General events: ', () => {

    it("Add temporary condition", async function() {
        let eventData = {
            text: "Test1",
            details: "Test 1 details" ,
            class: "mind"
        };

        let eventData2 = {
            text: "Test2",
            details: "Test 2 details" ,
            class: "mind",
            duration: 600
        };

        let model = getExampleModel();
        let events = getEvents(model._id, [ { eventType: 'put-condition', data: eventData },
                                            { eventType: 'put-condition', data: eventData2 } ], model.timestamp + 100);
        let {baseModel, workingModel } = await process(model, events);

        let cond1 = baseModel.conditions.find((c: any) => c.text == "Test1");
        let cond2 = baseModel.conditions.find((c: any) => c.text == "Test2")

        expect(cond1).to.exist;
        expect(cond2).to.exist;

        //Проверить через 600 секунд
        events = [getRefreshEvent(model._id, baseModel.timestamp + 610*1000 )];
        ({baseModel, workingModel } = await process(baseModel, events));

        cond1 = baseModel.conditions.find((c: any) => c.text == "Test1");
        cond2 = baseModel.conditions.find((c: any) => c.text == "Test2")

        expect(cond1).to.exist;
        expect(cond2).to.not.exist;

        //Проверить через 2 часа секунд
        events = [getRefreshEvent(model._id, baseModel.timestamp + 7200*1000 )];
        ({baseModel, workingModel } = await process(baseModel, events));

        cond1 = baseModel.conditions.find((c: any) => c.text == "Test1");
        cond2 = baseModel.conditions.find((c: any) => c.text == "Test2")

        expect(cond1).to.not.exist;
        expect(cond2).to.not.exist;
    });

    it("Send message", async function() {
        let msgData = {
            title: "Test Message",
            text: "Test Message details"
        };

        let model = getExampleModel();
        let events = getEvents(model._id, [ { eventType: 'send-message', data: msgData } ], model.timestamp + 100);
        let {baseModel, workingModel } = await process(model, events);

        let msg = baseModel.messages.find((c: any) => c.title == "Test Message");

        expect(msg).to.exist;

        ///printModel(baseModel);
    });

    it("Change variable", async function() {
        let model = getExampleModel();
        let events = getEvents(model._id, [ {eventType: 'change-model-variable', data: { name: "sweethome", value: "new_location" }},
                                            {eventType: 'change-model-variable', data: { name: "login", value: "test-login" }} ], model.timestamp + 100);
        let {baseModel, workingModel } = await process(model, events);

        expect(baseModel.sweethome).is.equal("new_location");
        expect(baseModel.login).is.equal("john.smith");
    });
});