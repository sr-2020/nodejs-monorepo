import { expect } from 'chai';
import { process } from '../test_helpers';
import { getExampleModel } from '../fixtures/models';
import { getEvents, getRefreshEvent } from '../fixtures/events';

describe('Medicine: ', () => {
    let result:any = null;

    it("Compute HP", async function() {
        let eventData = { id: "s_orphey" };
        let model = getExampleModel();
        let events = getEvents(model._id, [{ eventType: 'add-implant', data: eventData }], 1500825797, true);

        let { baseModel, workingModel } = await process(model, events);

        let implant = baseModel.modifiers.find((e: any) => e.id == "s_orphey");

        //Check existing
        expect(implant).to.exist;
        expect(implant).to.has.property('enabled', true);

        //Check HP
        expect(workingModel.hp).is.equal(5);

        //Check dead musculoskeletal system
        expect(baseModel.systems[0]).is.equal(0);
    });

    it("Reduce HP event", async function() {
        let eventData = { id: "s_orphey" };
        let model = getExampleModel();
        let events = getEvents(model._id, [{ eventType: 'add-implant', data: eventData }], 1500825797, true);

        let { baseModel, workingModel } = await process(model, events);

        events = getEvents(model._id, [{ eventType: 'subtractHp', data: { hpLost: 2 } }], 1500825800, true);
        ({ baseModel, workingModel } = await process(baseModel, events));

        //Check HP 5-2 = 3
        expect(workingModel.hp).is.equal(3);
    });

    it("Reduce HP event and heal +5", async function() {
        let eventData = { id: "s_orphey" };
        let model = getExampleModel();
        let events = getEvents(model._id, [{ eventType: 'add-implant', data: eventData }], 1500825797, true);

        let { baseModel, workingModel } = await process(model, events);

        events = getEvents(model._id, [{ eventType: 'subtractHp', data: { hpLost: 2 } }], 1500825800, true);
        ({ baseModel, workingModel } = await process(baseModel, events));

        events = getEvents(model._id, [{ eventType: 'addHp', data: { hpAdd: 5 } } ]  , 1500825900, true);
        ({ baseModel, workingModel } = await process(baseModel, events));

        //Check HP
        expect(workingModel.hp).is.equal(5);
    });

    

    it("Reduce HP below 0", async function() {
        let eventData = { id: "s_orphey" };
        let model = getExampleModel();
        let events = getEvents(model._id, [{ eventType: 'add-implant', data: eventData }], 1500825797, true);

        model.hp = 1;

        let { baseModel, workingModel } = await process(model, events);

        events = getEvents(model._id, [{ eventType: 'subtractHp', data: { hpLost: 3 } }], 1500825800, true);
        ({ baseModel, workingModel } = await process(baseModel, events));

        //После опускания хитов <= 0 должно показывать 0
        expect(workingModel.hp).is.equal(0);

        //И должна быть убита одна система (в тестах 1)
        expect(baseModel.systems[1]).is.equal(0);
    });

    it("Reduce HP below 0 and disable implant", async function() {
        let eventData = { id: "s_orphey" };
        let model = getExampleModel();
        let events = getEvents(model._id, [{ eventType: 'add-implant', data: eventData }], 1500825797, true);

        model.hp = 1;

        let { baseModel, workingModel } = await process(model, events);

        let implant = baseModel.modifiers.find((e: any) => e.id == "s_orphey");

        events = getEvents(model._id, [{ eventType: 'subtractHp', data: { hpLost: 3 } },
                                       { eventType: 'disable-implant', data: { mID: implant.mID } }], 1500825800, true);
        ({ baseModel, workingModel } = await process(baseModel, events));

        //Должно показывать HP == 0 (две мертвые системы)
        expect(workingModel.hp).is.equal(0);

        //Две мертве системы
        expect(baseModel.systems[0]).is.equal(0);  //Снят имплант
        expect(baseModel.systems[1]).is.equal(0);

        //Появившиеся в модели состояния для игрока
        let cond1 = workingModel.conditions.find((c: any) => c.id == "system_damage_0");
        let cond2 = workingModel.conditions.find((c: any) => c.id == "system_damage_1");
        
        expect(cond1).to.exist;
        expect(cond2).to.exist;

    });

    it("Reduce HP below 0 and get +4 HP pill", async function() {
        let eventData = { id: "s_orphey" };
        let model = getExampleModel();
        let events = getEvents(model._id, [{ eventType: 'add-implant', data: eventData }], 1500825797, true);

        model.hp = 1;

        let { baseModel, workingModel } = await process(model, events);

        let implant = baseModel.modifiers.find((e: any) => e.id == "s_orphey");

        events = getEvents(model._id, [{ eventType: 'subtractHp', data: { hpLost: 3 } },
                                       { eventType: 'disable-implant', data: { mID: implant.mID } },
                                       { eventType: 'addHp', data: { hpAdd: 5 } } ]  , 1500825800, true);

        ({ baseModel, workingModel } = await process(baseModel, events));

        //Check HP (2 отключенных системы => все равно 0, сколько не лечи)
        expect(workingModel.hp).is.equal(0);
    });

    it("Reduce HP below 0, install another implant and enable existed", async function() {
        let eventData = { id: "s_orphey" };
        let model = getExampleModel();
        model.hp = 1;

        let events = getEvents(model._id, [{ eventType: 'add-implant', data: eventData }], 1500825797, true);
        let { baseModel, workingModel } = await process(model, events);

        let implant = baseModel.modifiers.find((e: any) => e.id == "s_orphey");

        events = getEvents(model._id, [{ eventType: 'subtractHp', data: { hpLost: 3 } },
                                       { eventType: 'disable-implant', data: { mID: implant.mID } } ]  , 1500825800, true);
        ({ baseModel, workingModel } = await process(baseModel, events));
        
        //Check HP 
        expect(workingModel.hp).is.equal(0);

        //Установить имплант на сердечно-сосудистую систему
        events = getEvents(model._id, [{ eventType: 'add-implant', data: { id: "s_steelheart" } }], 1500825900, true);
        ({ baseModel, workingModel } = await process(baseModel, events));

        //Check HP 
        expect(workingModel.hp).is.equal(0);

        let cond1 = workingModel.conditions.find((c: any) => c.id == "system_damage_1");
        expect(cond1).to.not.exist;


        //Включить имплант
        events = getEvents(model._id, [{ eventType: 'enable-implant', data: { mID: implant.mID  } }], 1500826000, true);
        ({ baseModel, workingModel } = await process(baseModel, events));

        //Check HP (base 1, implant +1)
        expect(workingModel.hp).is.equal(2);
    
        let cond2 = workingModel.conditions.find((c: any) => c.id == "system_damage_0");
        expect(cond2).to.not.exist;

        //console.log(JSON.stringify(workingModel, null, 4));
    });

    it.only("Reduce HP and bleeding (hp leak)", async function() {
        let eventData = { id: "s_orphey" };
        let model = getExampleModel();
        let events = getEvents(model._id, [{ eventType: 'add-implant', data: eventData }], model.timestamp+100, true);

        let { baseModel, workingModel } = await process(model, events);
    
    //Нанесли повреждения
        events = getEvents(model._id, [{ eventType: 'subtractHp', data: { hpLost: 2 } }], baseModel.timestamp+100, true);
        ({ baseModel, workingModel } = await process(baseModel, events));

        //Check HP: model(4) + impant(1) - damage (2)
        expect(workingModel.hp).is.equal(3);

    //Прошло 10 минут (должен списаться хит)
        events =  [getRefreshEvent(model._id,baseModel.timestamp+700000)];
        ({ baseModel, workingModel } = await process(baseModel, events));
        
        //Check HP: model(4) + impant(1) - damage (2) - leak(1)
        expect(workingModel.hp).is.equal(2);

        console.log(JSON.stringify(baseModel.timers, null, 4));

    //Прошло 20 минут (должно списаться еще 2 хита)
        events =  [getRefreshEvent(model._id,baseModel.timestamp+ 1200*1000)];
        ({ baseModel, workingModel } = await process(baseModel, events));
        
        //Check HP: model(4) + impant(1) - damage (2) - leak(2)
        expect(workingModel.hp).is.equal(0);

        //И должна быть убита одна система (в тестах 1)
        expect(baseModel.systems[1]).is.equal(0);

    //Прошло еще 10 минут (не должно ничего списываться т.е. одна из систем уничтожена и по идее должен запускаться таймер на умирание)
        events =  [getRefreshEvent(model._id,baseModel.timestamp+ 650*1000)];
        ({ baseModel, workingModel } = await process(baseModel, events));

        //Уничтожена одна система -> хитов нет
        expect(workingModel.hp).is.equal(0);

        console.log(JSON.stringify(baseModel, null, 4));
        
    });


});