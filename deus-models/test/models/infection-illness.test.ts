import {getTotalChance, getPotentialSystemsIds, whatSystemShouldBeInfected} from  '../../helpers/infection-illness';
import { expect } from 'chai';
import { getExampleModel } from '../fixtures/models';
import { getEvents, getRefreshEvent } from '../fixtures/events';
import { process, printModel } from '../test_helpers';

describe('Infecton: ', () => {
    it("Calculate potentially bad systems", async () => {
        let model = getExampleModel();
        let count = getPotentialSystemsIds(model).length;

        expect(count).is.equal(2);
    });
    
    it("Calculate total chance for W", async () => {
        let model = getExampleModel();
        let chance = getTotalChance(model);

        expect(chance).is.closeTo(0.0396, 0.00001);
    });

    it("What systems should be infected", async () => {
         let model = getExampleModel();
         model.generation = "X/Y";
         model.genome[0] = 1;
         model.genome[1] = 1;
         model.genome[2] = 1;
         model.genome[3] = 1;
         model.genome[4] = 1;
         model.genome[5] = 1;
         let system = whatSystemShouldBeInfected(model);
         expect(system).is.equal(4);
    });

    it("Roll for infection", async () => {
        let model = getExampleModel();
        
         model.generation = "X/Y";
         model.genome[0] = 1;
         model.genome[1] = 1;
         model.genome[2] = 1;
         model.genome[3] = 1;
         model.genome[4] = 1;
         model.genome[5] = 1;

         let events = getEvents(model._id, [{ eventType: 'roll-illness', data: {} }], model.timestamp);

         let {baseModel, workingModel} = await process(model, events);

         events =[getRefreshEvent(model._id, model.timestamp + 24 * 60 * 60 * 1000)];

         ({baseModel, workingModel} = await process(baseModel, events));

         expect(baseModel.isAlive).is.false;
    });

    it("Roll for infection for exhuman program", async () => {
        let model = getExampleModel();
        
         model.generation = "X/Y";
         model.genome = [];
         model.profileType = "exhuman-program";

         let events = getEvents(model._id, [{ eventType: 'roll-illness', data: {} }], model.timestamp);

         let {baseModel, workingModel} = await process(model, events);

         events =[getRefreshEvent(model._id, model.timestamp + 24 * 60 * 60 * 1000)];

         ({baseModel, workingModel} = await process(baseModel, events));

         expect(baseModel.isAlive).is.true;
    });
});