import { expect } from 'chai';
import { process } from '../test_helpers';
import { getExampleModel } from '../fixtures/models';
import { getEvents, getRefreshEvent } from '../fixtures/events';

interface Global {
    TEST_EXTERNAL_OBJECTS: any
}

declare var global: Global;

global.TEST_EXTERNAL_OBJECTS = {
    pills: {
        '111-111': {
            _id: '111-111',
            pillId: 'firstAid1'
        }
    }
};

describe('Pills', () => {
    it('Cures HP with firstAid pill', async () => {
        let model = getExampleModel();

        let events = getEvents(model._id, [{ eventType: 'subtractHp', data: { hpLost: 2 } }], Date.now(), true);
        let { baseModel, workingModel } = await process(model, events);
        expect(workingModel.hp).to.equals(2);

        events = getEvents(model._id, [{ eventType: 'usePill', data: { id: '111-111' } }], Date.now(), true);

        ({ baseModel, workingModel } = await process(baseModel, events));
        expect(workingModel.hp).to.equals(3);
        expect(workingModel.usedPills).to.has.property('firstAid1');

        expect(global.TEST_EXTERNAL_OBJECTS.pills['111-111']).to.has.property('usedBy', model._id);
    });
});
