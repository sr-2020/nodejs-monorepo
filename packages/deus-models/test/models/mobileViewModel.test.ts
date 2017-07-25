import { expect } from 'chai';
import { process } from '../test_helpers';
import { getExampleModel } from '../fixtures/models';

async function getViewModel(model: any) {
    return (await process(model, [])).viewModels.default;
}

describe("mobileViewModel", () => {
    it("_view doesn't produce null or undefined fields", async function() {
        const model = getExampleModel();
        const viewModel = await getViewModel(model);
        expect(viewModel).to.be.deep.equal(JSON.parse(JSON.stringify(viewModel)));
        expect(viewModel).to.have.property("_id");
        expect(viewModel).to.have.property("timestamp");

        console.log(JSON.stringify(viewModel, null, 4));
    });
});
