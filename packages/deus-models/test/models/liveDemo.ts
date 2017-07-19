import { expect } from 'chai';
import { process } from '../test_helpers';
import { getExampleModel } from '../fixtures/models';
import { getEvents, getRefreshEvent } from '../fixtures/events';

describe("liveDemo", () => {
    describe('model api', () => {
        it("Event 'usePill', effect: +2HP", async function() {
            let eventData = { id: "3a0867ad-b9c9-4d6e-bc3e-c9c250be0ec3" };
            let model = getExampleModel();
            let events = getEvents(model._id, [{ eventType: 'usePill', data: eventData }]);

            let result = await process(model, events);

            expect(result).to.has.nested.property('baseModel.hp', 6)
        });

        it("Event 'usePill', effect: add implant", async function() {
            let eventData = { id: "f1c4c58e-6c30-4084-87ef-e8ca318b23e7" };
            let model = getExampleModel();
            let events = getEvents(model._id, [{ eventType: 'usePill', data: eventData }]);

            let { baseModel } = await process(model, events);

            expect(baseModel.modifiers.find((e: any) => e.id == 'TestImplant01')).to.exist;
        });

        it("Event 'usePill', effect: implant enable", async function() {
            let eventData = { mID: "85a5746cddd447379992d8181a52f4fd" };
            let model = getExampleModel();
            let events = getEvents(model._id, [{ eventType: 'disableImplant', data: eventData }]);

            let { baseModel } = await process(model, events);
            let implant = baseModel.modifiers.find((e: any) => e.mID == "85a5746cddd447379992d8181a52f4fd");

            expect(implant).to.exist;
            expect(implant).to.has.property('enabled', false);
        });
    });

    describe('modifiers effects', () => {
        it("Modifier's effect 'demoEffect' add condition to work model", async function() {
            let model = getExampleModel();

            let { workingModel } = await process(model, [getRefreshEvent(model._id)]);

            expect(workingModel.conditions.find((e: any) => e.id == "demoImplantState")).to.exist;
        });

    });
});
