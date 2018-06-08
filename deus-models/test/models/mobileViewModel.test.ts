import { expect } from 'chai';
import { process, printModel } from '../test_helpers';
import { getExampleMagellanModel } from '../fixtures/models';
import { getEvents, getRefreshEvent } from '../fixtures/events';


async function getViewModel(model: any) {
    return (await process(model, [])).viewModels.default;
}

describe("mobileViewModel", () => {
    it("_view doesn't produce null or undefined fields", async function() {
        const model = getExampleMagellanModel();
        const viewModel = await getViewModel(model);
        console.log(JSON.stringify(viewModel, null, 4));
        expect(viewModel).to.be.deep.equal(JSON.parse(JSON.stringify(viewModel)));
        expect(viewModel).to.have.property("_id");
        expect(viewModel).to.have.property("timestamp");
    });

});
