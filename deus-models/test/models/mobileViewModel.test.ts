import { expect } from 'chai';
import { process, printModel } from '../test_helpers';
import { getExampleModel } from '../fixtures/models';
import { getEvents, getRefreshEvent } from '../fixtures/events';


async function getViewModel(model: any) {
    return (await process(model, [])).viewModels.default;
}

describe("mobileViewModel", () => {
    it("_view doesn't produce null or undefined fields", async function() {
        const model = getExampleModel();
        const viewModel = await getViewModel(model);
        console.log(JSON.stringify(viewModel, null, 4));
        expect(viewModel).to.be.deep.equal(JSON.parse(JSON.stringify(viewModel)));
        expect(viewModel).to.have.property("_id");
        expect(viewModel).to.have.property("timestamp");

        //console.log(JSON.stringify(viewModel, null, 4));
    });

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

        let viewModel = await getViewModel(model);
        let body = viewModel.pages.find((e: any) => e.viewId == "page:general").body;
        expect(body.items.filter((e: any) => e.text == "Внимание!").length).is.equal(0);

        console.log("================= Stage 1 duration ============================")
        events = [ getRefreshEvent(model._id, baseModel.timestamp + 5410*1000) ];
        ({ baseModel, workingModel } = await process(baseModel, events));

         viewModel = await getViewModel(model);
         body = viewModel.pages.find((e: any) => e.viewId == "page:general").body;
        expect(body.items.filter((e: any) => e.text == "Внимание!").length).is.equal(0);

        console.log("================= Stage 2 duration ============================")
        events = [ getRefreshEvent(model._id, baseModel.timestamp + 3610*1000) ];
        ({ baseModel, workingModel } = await process(baseModel, events));

         viewModel = await getViewModel(model);
         body = viewModel.pages.find((e: any) => e.viewId == "page:general").body;
        expect(body.items.filter((e: any) => e.text == "Внимание!").length).is.equal(0);

        console.log("================= Stage 3 duration ============================")
        events = [ getRefreshEvent(model._id, baseModel.timestamp + 2710*1000) ];
        ({ baseModel, workingModel } = await process(baseModel, events));

        viewModel = await getViewModel(model);
         body = viewModel.pages.find((e: any) => e.viewId == "page:general").body;
        expect(body.items.filter((e: any) => e.text == "Внимание!").length).is.equal(0);

        console.log("================= Stage 4 duration ============================")
        events = [ getRefreshEvent(model._id, baseModel.timestamp + 1810*1000) ];
        ({ baseModel, workingModel } = await process(baseModel, events));

        viewModel = await getViewModel(model);
         body = viewModel.pages.find((e: any) => e.viewId == "page:general").body;
        expect(body.items.filter((e: any) => e.text == "Внимание!").length).is.equal(0);

        console.log("================= Stage 5 duration ============================")
        events = [ getRefreshEvent(model._id, baseModel.timestamp + 910*1000) ];
        ({ baseModel, workingModel } = await process(baseModel, events));

        viewModel = await getViewModel(model);
         body = viewModel.pages.find((e: any) => e.viewId == "page:general").body;
        expect(body.items.filter((e: any) => e.text == "Внимание!").length).is.equal(0);

        console.log("================= Stage 6 duration ============================")
        events = [ getRefreshEvent(model._id, baseModel.timestamp + 610*1000) ];
        ({ baseModel, workingModel } = await process(baseModel, events));

         body = viewModel.pages.find((e: any) => e.viewId == "page:general").body;
        expect(body.items.filter((e: any) => e.text == "Внимание!").length).is.equal(0);
    });
});
