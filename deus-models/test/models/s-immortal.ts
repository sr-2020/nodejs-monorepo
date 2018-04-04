import { expect } from 'chai';
import { process, printModel } from '../test_helpers';
import { getExampleModel } from '../fixtures/models';
import { getEvents, getRefreshEvent } from '../fixtures/events';

describe('Serenity immortality: ', () => {
    it("Install first stage implant", async function() {
        let model = getExampleModel();
        let events = getEvents(model._id, [{ eventType: 'add-implant', data: { id: "s_immortal01" } }], model.timestamp + 100);
        let { baseModel, workingModel } = await process(model, events);

        let cond = workingModel.conditions.find( (c:any) => c.id == "serenity_immortality_ready")

        expect(baseModel.timers).to.has.property("_s_immortal01_timer")
        expect(cond).is.not.exist;

        console.log("================Pass 60 minutes ===============")

        events = [getRefreshEvent(model._id, baseModel.timestamp + 700*1000)];
        ({ baseModel, workingModel } = await process(baseModel, events));

        cond = workingModel.conditions.find( (c:any) => c.id == "serenity_immortality_ready")
        expect(cond).is.exist;
    });

    it("Run modernization", async function() {
        //Подготовить к модернизации
        let model = getExampleModel();
        let events = getEvents(model._id, [ { eventType: 'add-implant', data: { id: "jj_meditation" } },
                                            { eventType: 'add-implant', data: { id: "s_immortal01" } }], model.timestamp + 100);
        let { baseModel, workingModel } = await process(model, events);

        events = [getRefreshEvent(model._id, baseModel.timestamp + 700*1000)];
        ({ baseModel, workingModel } = await process(baseModel, events));

        console.log("============ Damage and illness ===============")

        //Поранить и заразить персонажа
        events = getEvents(model._id, [{ eventType: 'start-illness', data: { id: "arthritis" } },
                                       { eventType: 'subtractHp', data: { hpLost: 1 } } ], baseModel.timestamp + 100);
        ({ baseModel, workingModel } = await process(baseModel, events));

        let ill = baseModel.modifiers.find((m:any) => m.class=="illness");

        expect(ill).is.exist;
        expect(workingModel.hp).is.equal(3);

        console.log("============ Start modernization ===============")

        //Принять "таблетку" модернизации
        events = getEvents(model._id, [{ eventType: 'serenity_immortality_go', data: { } }], baseModel.timestamp + 100);
        ({ baseModel, workingModel } = await process(baseModel, events));

        expect(baseModel.profileType).is.equal("ex-human-robot");
        expect(workingModel.hp).is.equal(4);

        ill = baseModel.modifiers.find((m:any) => m.class=="illness");
        expect(ill).is.not.exist;

        let imp = baseModel.modifiers.find((m:any) => m.class=="bio-implant" ||  m.class=="cyber-implant");
        expect(ill).is.not.exist;

        expect(baseModel.systems).is.not.exist;
        expect(baseModel.generation).is.not.exist;

        expect(baseModel.mind.C[7]).is.eqls(100);
        expect(baseModel.mind.D[8]).is.eqls(100);
    });

    it("Install first stage implant and try install another", async function() {
        let model = getExampleModel();
        let events = getEvents(model._id, [{ eventType: 'add-implant', data: { id: "s_immortal01" } },
                                           { eventType: 'add-implant', data: { id: "lab_maninthemiddle" } },
                                           { eventType: 'add-implant', data: { id: "lab_maninthemiddle2" } } ], model.timestamp + 100);
        let { baseModel, workingModel } = await process(model, events);

        let imp = baseModel.modifiers.find((m:any) => m.id=="s_immortal01");
        let imp2 = baseModel.modifiers.find((m:any) => m.id=="lab_maninthemiddle");
        let imp3 = baseModel.modifiers.find((m:any) => m.id=="lab_maninthemiddle2");

        expect(imp).is.exist;
        expect(imp2).is.exist;
        expect(imp3).is.not.exist;
    });

});