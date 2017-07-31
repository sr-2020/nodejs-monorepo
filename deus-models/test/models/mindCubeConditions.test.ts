//Тесты для показа состояний в зависимости от знаений кубиков сознания

import { expect } from 'chai';
import { process, printModel } from '../test_helpers';
import { getExampleModel } from '../fixtures/models';
import { getEvents, getRefreshEvent } from '../fixtures/events';

describe('Mind Cubes conditions tests: ', () => {
    let result:any = null;

    it.only("Show condition #1", async function() {
        let model = getExampleModel();

        model.mind.A[0] = 19;       //mcube-condition-A0-2
        model.mind.F[0] = 20;       //mcube-condition-F0-3

        let events = [ getRefreshEvent(model._id, model.timestamp + 100) ];
        let { baseModel, workingModel } = await process(model, events);

        let cond1 = workingModel.conditions.find((c: any) => c.id == "mcube-condition-A0-2");
        let cond2 = workingModel.conditions.find((c: any) => c.id == "mcube-condition-F0-3");
        
        expect(cond1).to.exist;
        expect(cond1).to.exist;

        cond1 = baseModel.conditions.find((c: any) => c.id == "mcube-condition-A0-2");
        cond2 = baseModel.conditions.find((c: any) => c.id == "mcube-condition-F0-3");
        
        expect(cond1).to.not.exist;
        expect(cond1).to.not.exist;

        printModel(workingModel);
    });


});