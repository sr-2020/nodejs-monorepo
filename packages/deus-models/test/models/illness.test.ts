import { expect } from 'chai';
import { process, printModel } from '../test_helpers';
import { getExampleModel } from '../fixtures/models';
import { getEvents, getRefreshEvent } from '../fixtures/events';

describe('Illnesses: ', () => { 
    it("Start Illness and check illness life path", async function() {
        let model = getExampleModel();
        let events = getEvents(model._id, [{ eventType: 'start-illness', data: { id: "arthritis" } }], model.timestamp + 100);
        let { baseModel, workingModel } = await process(model, events);

        printModel(workingModel.conditions);

        let illness = baseModel.modifiers.find( (m:any) => m.id == "arthritis");
        expect(illness).is.exist;

        let cond = workingModel.conditions.find( (c:any) => c.id == "arthritis-0");
        expect(cond).is.exist;

        console.log("================= Stage 0 duration ============================")
        events = [ getRefreshEvent(model._id, baseModel.timestamp + 7210*1000) ];
        ({ baseModel, workingModel } = await process(baseModel, events));

        cond = workingModel.conditions.find( (c:any) => c.id == "arthritis-1");
        expect(cond).is.exist;

        console.log("================= Stage 1 duration ============================")
        events = [ getRefreshEvent(model._id, baseModel.timestamp + 5410*1000) ];
        ({ baseModel, workingModel } = await process(baseModel, events));

        cond = workingModel.conditions.find( (c:any) => c.id == "arthritis-2");
        expect(cond).is.exist;

        console.log("================= Stage 2 duration ============================")
        events = [ getRefreshEvent(model._id, baseModel.timestamp + 3610*1000) ];
        ({ baseModel, workingModel } = await process(baseModel, events));

        cond = workingModel.conditions.find( (c:any) => c.id == "arthritis-3");
        expect(cond).is.exist;

        console.log("================= Stage 3 duration ============================")
        events = [ getRefreshEvent(model._id, baseModel.timestamp + 2710*1000) ];
        ({ baseModel, workingModel } = await process(baseModel, events));

        cond = workingModel.conditions.find( (c:any) => c.id == "arthritis-4");
        expect(cond).is.exist;

        console.log("================= Stage 4 duration ============================")
        events = [ getRefreshEvent(model._id, baseModel.timestamp + 1810*1000) ];
        ({ baseModel, workingModel } = await process(baseModel, events));

        cond = workingModel.conditions.find( (c:any) => c.id == "arthritis-5");
        expect(cond).is.exist;

        console.log("================= Stage 5 duration ============================")
        events = [ getRefreshEvent(model._id, baseModel.timestamp + 910*1000) ];
        ({ baseModel, workingModel } = await process(baseModel, events));

        cond = workingModel.conditions.find( (c:any) => c.id == "arthritis-6");
        expect(cond).is.exist;

        console.log("================= Stage 6 duration ============================")
        events = [ getRefreshEvent(model._id, baseModel.timestamp + 610*1000) ];
        ({ baseModel, workingModel } = await process(baseModel, events));

        cond = workingModel.conditions.find( (c:any) => c.id == "arthritis-7");
        expect(cond).is.exist;
    });

    it("Start Illness and check delay event", async function() {
        let model = getExampleModel();
        let events = getEvents(model._id, [{ eventType: 'start-illness', data: { id: "arthritis" } }], model.timestamp + 100);
        let { baseModel, workingModel } = await process(model, events);

        printModel(workingModel.conditions);

        let illness = baseModel.modifiers.find( (m:any) => m.id == "arthritis");
        expect(illness).is.exist;

        let cond = workingModel.conditions.find( (c:any) => c.id == "arthritis-0");
        expect(cond).is.exist;

        console.log("================= Stage 0 duration ============================")
        events = [ getRefreshEvent(model._id, baseModel.timestamp + 7210*1000) ];
        ({ baseModel, workingModel } = await process(baseModel, events));

        cond = workingModel.conditions.find( (c:any) => c.id == "arthritis-1");
        expect(cond).is.exist;

        console.log("================= Stage 1 duration ============================")
        events = [ getRefreshEvent(model._id, baseModel.timestamp + 5410*1000) ];
        ({ baseModel, workingModel } = await process(baseModel, events));

        cond = workingModel.conditions.find( (c:any) => c.id == "arthritis-2");
        expect(cond).is.exist;

        console.log("================= Stage 2 duration ============================")
        events = [ getRefreshEvent(model._id, baseModel.timestamp + 3610*1000) ];
        ({ baseModel, workingModel } = await process(baseModel, events));

        cond = workingModel.conditions.find( (c:any) => c.id == "arthritis-3");
        expect(cond).is.exist;

        console.log("================= Stage 3 duration ============================")
        events = [ getRefreshEvent(model._id, baseModel.timestamp + 2710*1000) ];
        ({ baseModel, workingModel } = await process(baseModel, events));

        cond = workingModel.conditions.find( (c:any) => c.id == "arthritis-4");
        expect(cond).is.exist;

        console.log("================= Stage 4 duration ============================")
        events = [ getRefreshEvent(model._id, baseModel.timestamp + 1810*1000) ];
        ({ baseModel, workingModel } = await process(baseModel, events));

        cond = workingModel.conditions.find( (c:any) => c.id == "arthritis-5");
        expect(cond).is.exist;

        console.log("================= Stage 5 duration + delay ============================")
        events = getEvents(model._id, [{ eventType: 'delay-illness', data: { system: "musculoskeletal", delay: 900*1000 } }], baseModel.timestamp + 100);
        ({ baseModel, workingModel } = await process(baseModel, events));

        cond = workingModel.conditions.find( (c:any) => c.id == "arthritis-5");
        expect(cond).is.exist;

        console.log("================= Stage 5  delay ============================")
        events = [ getRefreshEvent(model._id, baseModel.timestamp + 3600*1000) ];
        ({ baseModel, workingModel } = await process(baseModel, events));

        cond = workingModel.conditions.find( (c:any) => c.id == "arthritis-7");
        expect(cond).is.exist;

        expect(workingModel.isAlive).is.false;
    });

});