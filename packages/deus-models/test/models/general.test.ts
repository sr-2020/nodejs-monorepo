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

    it("Change mind cube", async function() {
        let eventData = {
            operations: "A2+20, B4-5, F1=27"
        }
        let model = getExampleModel();
        let events = getEvents(model._id, [ {eventType: 'change-mind-cube', data: eventData} ], model.timestamp + 100);
        let {baseModel, workingModel } = await process(model, events);

        expect(baseModel.mind.A[2]).is.equal(76);
        expect(baseModel.mind.B[4]).is.equal(50);
        expect(baseModel.mind.F[1]).is.equal(27);
    });

    it("Change android owner", async function() {
        let model = getExampleModel();
        
        model.profileType = "robot";
        model.owner = "ivan.ivanovich";

        let events = getEvents(model._id, [ {eventType: 'change-android-owner', data: { owner: "vasya.pupkin" }} ], model.timestamp + 100);
        let {baseModel, workingModel } = await process(model, events);

        expect(baseModel.owner).is.equal("vasya.pupkin");
        
        //printModel(baseModel);
    });

     it("Change memory", async function() {
        let model = getExampleModel();

        let data1 = {
            title: "Новое воспоминание 1",
            text: "Текст нового воспоминания 1"
        };

        let data2 = {
            title: "Новое воспоминание 2",
            text:  "Текст нового воспоминания 2"
        };

        let modelData = {
            remove: [ "6acf27a6-fd6e-4477-b526-e1fbe25c416b", "82eb411a-51cb-478d-9f90-5f6f52660a0d" ],
            add: [
                data1,
                data2
            ]
        }


        let events = getEvents(model._id, [ {eventType: 'change-memory', data: modelData} ], model.timestamp + 100);
        let {baseModel, workingModel } = await process(model, events);

        printModel(baseModel);

        let msg1 = baseModel.memory.find((c: any) => c.title == "Название воспоминания №1");
        let msg2 = baseModel.memory.find((c: any) => c.title == "Новое воспоминание 1");
        let msg3 = baseModel.memory.find((c: any) => c.title == "Новое воспоминание 2");

        expect(msg1).is.not.exist;
        expect(msg2).is.exist;
        expect(msg3).is.exist;

    });

    it("Change insurance", async function() {
        let model = getExampleModel();

        let events = getEvents(model._id, [ {eventType: 'change-insurance', data: {  Insurance: "JJ", Level: 2 } } ], model.timestamp + 100);
        let {baseModel, workingModel } = await process(model, events);

        expect(baseModel.insurance).is.equal("JJ");
        expect(baseModel.insuranceLevel).is.equal(2);
        expect(baseModel.insuranceDiplayName).is.equal("Johnson & Johnson, L: 2");
        
        //printModel(baseModel);
    });


});