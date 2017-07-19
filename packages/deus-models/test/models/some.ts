import { expect } from 'chai';
import { process } from '../test_helpers';
import { getExampleModel } from '../fixtures/models';

async function getViewModel(model: any) {
    return (await process(model, [])).viewModels.default;
}

describe("some", () => {
    describe('view', () => {
        it("_view doesn't produce null or undefined fields", async function() {
            const model = getExampleModel();
            const viewModel = await getViewModel(model);
            expect(viewModel).deep.equal(JSON.parse(JSON.stringify(viewModel)));
        });
    });
});
