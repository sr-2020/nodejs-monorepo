import { expect } from 'chai';
import { merge } from 'lodash';
import { getEvents, getRefreshEvent } from '../fixtures/events';
import { getExampleMagellanModel, getExampleMedicModel } from '../fixtures/models';
import { process } from '../test_helpers';

interface Global {
    TEST_EXTERNAL_OBJECTS: any;
}

declare var global: Global;

global.TEST_EXTERNAL_OBJECTS = merge(global.TEST_EXTERNAL_OBJECTS, {
    'obj-counters': {
        '111-111': { _id: '111-111', foo: 'bar' },
        '111-112': { _id: '111-112', bar: 'foo' },
    },
});

describe('Medic Magellan events: ', () => {
    it('No-op refresh model', async () => {
        const model = getExampleMedicModel();
        const events = [getRefreshEvent(model._id, model.timestamp + 610 * 1000)];
        const { baseModel, workingModel } = await process(model, events);

        expect(baseModel.timestamp).to.equal(610 * 1000);
        expect(workingModel.timestamp).to.equal(610 * 1000);

        model.timestamp = 610 * 1000;

        expect(baseModel).to.deep.equal(model);
    });

    it('Add tests via QR', async () => {
        let model = getExampleMedicModel();

        const data = {
            type: 20,
            kind: 0,
            validUntil: 0,
            payload: '111-111,12',
        };

        const events = getEvents(model._id,
            [{ eventType: 'scanQr', data }], 100);

        model.numTests = 10;
        model = (await process(model, events)).baseModel;
        expect(model.numTests).to.equal(10 + 12);
    });

    it("Can't add tests with same QR twice", async () => {
        let model = getExampleMedicModel();

        const data = {
            type: 20,
            kind: 0,
            validUntil: 0,
            payload: '111-112,12',
        };

        let events = getEvents(model._id, [{ eventType: 'scanQr', data }], 100);

        model.numTests = 10;
        model = (await process(model, events)).baseModel;
        expect(model.numTests).to.equal(10 + 12);

        expect(global.TEST_EXTERNAL_OBJECTS['obj-counters']['111-112']).to.has.property('usedBy', model._id);

        events = getEvents(model._id, [{ eventType: 'scanQr', data }], 200);
        model = (await process(model, events)).baseModel;
        expect(model.numTests).to.equal(10 + 12);
    });

    it('Run test', async () => {
        let model = getExampleMedicModel();
        const data = {
            test: 'nucleotide',
            model: getExampleMagellanModel(),
        };
        const events = getEvents(model._id,
            [{ eventType: 'medic-run-lab-test', data }], 100);

        model.numTests = 10;
        const patientHistoryLengthBefore = model.patientHistory.length;
        model = (await process(model, events)).baseModel;
        expect(model.numTests).to.equal(10 - 1);
        expect(model.patientHistory).to.be.of.length(patientHistoryLengthBefore + 1);
    });

    it('Run test with numTests = 0', async () => {
        let model = getExampleMedicModel();
        const data = {
            test: 'nucleotide',
            model: getExampleMagellanModel(),
        };
        const events = getEvents(model._id,
            [{ eventType: 'medic-run-lab-test', data }], 100);

        model.numTests = 0;
        const patientHistoryLengthBefore = model.patientHistory.length;
        model = (await process(model, events)).baseModel;
        expect(model.numTests).to.equal(0);
        expect(model.patientHistory).to.be.of.length(patientHistoryLengthBefore + 1);
        expect(model.patientHistory[model.patientHistory.length - 1]).to.include({ type: 'Ошибка' });
    });
});
