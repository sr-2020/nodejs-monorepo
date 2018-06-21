import { merge } from 'lodash';
import { expect } from 'chai';
import { process } from '../test_helpers';
import { getExampleModel } from '../fixtures/models';
import { getEvents, getRefreshEvent } from '../fixtures/events';
import { find } from 'lodash';

interface Global {
    TEST_EXTERNAL_OBJECTS: any
}

declare var global: Global;

global.TEST_EXTERNAL_OBJECTS = merge(global.TEST_EXTERNAL_OBJECTS, {
    pills: {
        '111-111': {
            _id: '111-111',
            pillId: 'firstAid1'
        },

        '111-112': {
            _id: '111-112',
            pillId: 'firstAid1'
        },
    }
});

describe('Pills', () => {
    it('Cures HP with firstAid pill', async () => {
        let model = getExampleModel();

        const events = getEvents(model._id, [{ eventType: 'usePill', data: { id: '111-111' } }], Date.now(), true);

        let { baseModel, workingModel } = await process(model, events);
        expect(workingModel.hp).to.equal(5);
        expect(workingModel.usedPills).to.has.property('firstAid1');

        expect(global.TEST_EXTERNAL_OBJECTS.pills['111-111']).to.has.property('usedBy', model._id);
    });

    it('Should apply pills with qr-codes', async () => {
        let model = getExampleModel();

        const events = getEvents(model._id, [{ eventType: 'scanQr', data: { type: 1, payload: '111-112' } }], Date.now(), true);
        let { baseModel, workingModel } = await process(model, events);

        expect(workingModel.hp).to.equals(5);
        expect(workingModel.usedPills).to.has.property('firstAid1');

        expect(global.TEST_EXTERNAL_OBJECTS.pills['111-112']).to.has.property('usedBy', model._id);
    });
});
