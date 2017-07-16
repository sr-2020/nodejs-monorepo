import { expect } from 'chai';
import { process } from '../test_helpers';
import { getExampleModel } from '../fixtures/models';

function getViewModel(model: any) {
    return process(model, []).viewModels.viewModels;
}

describe("some", () => {
    describe('view', () => {
        it("_view doesn't produce null or undefined fields", function() {
            const model = getExampleModel();
            const viewModel = getViewModel(model);
            expect(viewModel).deep.equal(JSON.parse(JSON.stringify(viewModel)));
        });

    });
});
