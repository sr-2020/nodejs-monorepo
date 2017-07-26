//Тесты для моделей управления имплантами

import { expect } from 'chai';
import { process } from '../test_helpers';
import { getExampleModel } from '../fixtures/models';
import { getEvents, getRefreshEvent } from '../fixtures/events';

describe('Implants: ', () => {
    let result:any = null;

    it("Add implant", async function() {
        let eventData = { id: "s_stability" };
        let model = getExampleModel();
        let events = getEvents(model._id, [{ eventType: 'add-implant', data: eventData }]);

        let { baseModel } = await process(model, events);

        let implant = baseModel.modifiers.find((e: any) => e.id == "s_stability");

        expect(implant).to.exist;
        expect(implant).to.has.property('enabled', true);

        let changeRecord = baseModel.changes.find( (e:any) => e.text == "Установлен имплант: Киберпротез ноги «Стабильность»" )
        expect(changeRecord).to.exist;
        
    });

     it("Add duble implant", async function() {
        let eventData = { id: "s_stability" };
        let model = getExampleModel();
        let events = getEvents(model._id, [{ eventType: 'add-implant', data: eventData }], 1500825797, true);

        let {baseModel, workingModel } = await process(model, events);

        let implant = baseModel.modifiers.find((e: any) => e.id == "s_stability");

        expect(implant).to.exist;
        expect(implant).to.has.property('enabled', true);

        let changeRecord = baseModel.changes.find( (e:any) => e.text == "Установлен имплант: Киберпротез ноги «Стабильность»" )
        expect(changeRecord).to.exist;

        events = getEvents(model._id, [{ eventType: 'add-implant', data: eventData }], 1500825800, true);
        ({baseModel, workingModel } = await process(baseModel, events));

        let implants = baseModel.modifiers.filter((e: any) => e.id == "s_stability");

        expect(implants.length).is.equal(1);
    });

     it("Remove implant", async function() {
        let eventData = { id: "s_stability" };
        let model = getExampleModel();
        let events = getEvents(model._id, [{ eventType: 'add-implant', data: eventData }], 1500825797, true);

        let { baseModel } = await process(model, events);
        let implant = baseModel.modifiers.find((e: any) => e.id == "s_stability");

        
        //console.log(JSON.stringify(baseModel, null, 4));

        events = getEvents(model._id, [{ eventType: 'remove-implant', data:  { mID: implant.mID } }], 1500825900, true);
        baseModel = (await process(baseModel, events)).baseModel;

        implant = baseModel.modifiers.find((e: any) => e.id == "s_stability");
        //console.log(JSON.stringify(baseModel, null, 4));

        expect(implant).to.not.exist;

        let changeRecord = baseModel.changes.find( (e:any) => e.text == "Удален имплант: Киберпротез ноги «Стабильность»" )
        expect(changeRecord).to.exist;
        
    });


    it("Show condition effect", async function() {
        let eventData = { id: "s_stability" };
        let model = getExampleModel();
        let events = getEvents(model._id, [{ eventType: 'add-implant', data: eventData }], 1500825797, true);

        let { baseModel, workingModel } = await process(model, events);


        //console.log(JSON.stringify(workingModel, null, 4));

        //Genome[6] = 0
        let condition = workingModel.conditions.find((e: any) => e.id == "s_stability-0");
        expect(condition).to.exist;

        //Genome[6] = 1
        baseModel.genome[6] = 1;
        events =  [getRefreshEvent(model._id,1500825900)];
        ({ baseModel, workingModel } = await process(baseModel, events));  
        
        condition = workingModel.conditions.find((e: any) => e.id == "s_stability-1");
        expect(condition).to.exist;

        //Genome[6] = 4
        baseModel.genome[6] = 4;
        events =  [getRefreshEvent(model._id,1500825920)];
        ({ baseModel, workingModel } = await process(baseModel, events));  
        
        condition = workingModel.conditions.find((e: any) => e.id == "s_stability-2");
        expect(condition).to.exist;

        //Genome[6] = 2 (no conditions)
        baseModel.genome[6] = 2;
        events =  [getRefreshEvent(model._id,1500825940)];
        ({ baseModel, workingModel } = await process(baseModel, events));  

        condition = workingModel.conditions.find((e: any) => e.id.startsWith("s_stability"));
        expect(condition).to.not.exist;
    });

    it("Instant install effects", async function() {
        //С7 == 46  => С7+20

        let eventData = { id: "s_stability" };
        let model = getExampleModel();
        let events = getEvents(model._id, [{ eventType: 'add-implant', data: eventData }], 1500825797, true);

        let { baseModel, workingModel } = await process(model, events);
        
        let cubeVal = baseModel.mind.C[6];
        expect(cubeVal).is.equal(66);


        //С7 == 63  => С7+10,D2-10
        //D2 = 42
        model = getExampleModel();
        model.mind.C[6] = 63;
        events = getEvents(model._id, [{ eventType: 'add-implant', data: eventData }], 1500825797, true);
        ({ baseModel, workingModel } = await process(model, events));
        
        expect(baseModel.mind.A[0]).is.equal(63);
        expect( baseModel.mind.B[1]).is.equal(47);
        expect( baseModel.mind.C[2]).is.equal(20);
    });

    it("Enable & Disable implant", async function() {
        let eventData = { id: "s_stability" };
        let model = getExampleModel();
        let events = getEvents(model._id, [{ eventType: 'add-implant', data: eventData }], model.timestamp + 100, true);

        let { baseModel } = await process(model, events);

        let implant = baseModel.modifiers.find((e: any) => e.id == "s_stability");

        expect(implant).to.exist;
        expect(implant).to.has.property('enabled', true);

        events = getEvents(baseModel._id, [{ eventType: 'disable-implant', data: { mID : implant.mID } }], baseModel.timestamp + 100, true);
        ({ baseModel } = await process(baseModel, events));  

        //console.log(JSON.stringify(baseModel, null, 4));

        implant = baseModel.modifiers.find((e: any) => e.id == "s_stability");

        expect(implant).to.exist;
        expect(implant.enabled).is.false;

        events = getEvents(baseModel._id, [{ eventType: 'enable-implant', data: { mID : implant.mID } }], baseModel.timestamp + 100, true);
        ({ baseModel } = await process(baseModel, events));  
        
        implant = baseModel.modifiers.find((e: any) => e.id == "s_stability");

        expect(implant).to.exist;
        expect(implant.enabled).is.equal(true);

    });

});