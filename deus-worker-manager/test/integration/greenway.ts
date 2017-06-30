import { expect } from 'chai';

import Manager from '../../src/manager';
import { DIInterface } from '../../src/di';
import { Document } from '../../src/db/interface';

import { initDi } from '../init'
import { createModel, pushEvent, getModelVariants } from '../model_helpers';
import { delay } from '../helpers';

describe("Green way", function() {
    this.timeout(3000);

    let manager;
    let di: DIInterface;

    before(() => {
        di = initDi();
        manager = new Manager(di);
        return delay(500);
    });


    it('Should process events', async () => {
        let model = await createModel(di, undefined, { value: '', otherValue: 'some useless info' });

        await pushEvent(di, {
            characterId: model._id,
            eventType: 'concat',
            timestamp: Date.now(),
            data: { value: 'A' }
        });

        await pushEvent(di, {
            characterId: model._id,
            eventType: '_RefreshModel',
            timestamp: Date.now()
        })

        await delay(100);

        let [baseModel, workingModel, viewModel] = await getModelVariants(di, model._id, ['models', 'workingModels', 'viewModels']);

        expect(baseModel).to.exist;
        expect(workingModel).to.exist;
        expect(viewModel).to.exist;

        if (!baseModel || !workingModel || !viewModel) throw new Error('imposible!')

        expect(baseModel).to.has.property('value', 'A');
        expect(baseModel).to.has.property('otherValue', 'some useless info');
        expect(workingModel).to.has.property('value', 'A');
        expect(workingModel).to.has.property('timestamp', baseModel.timestamp);
        expect(viewModel).to.has.property('value', 'A');
        expect(viewModel).to.has.property('timestamp', baseModel.timestamp);
        expect(viewModel).not.to.has.property('otherValue');
    })
});
