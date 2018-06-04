// tslint:disable:no-unused-expression

import { expect } from 'chai';

import { ManagerToken } from '../../src/di_tokens';
import { Manager } from '../../src/manager';
import { Document } from '../../src/db/interface';

import { initDi } from '../init';
import { createModel, pushEvent, getModel, getModelAtTimestamp,
    getModelVariants, getModelVariantsAtTimestamp, saveObject, getObject } from '../model_helpers';
import { delay } from '../../src/utils';

describe('Green way', function() {
    this.timeout(5000);

    let manager: Manager;
    let di;

    before(async () => {
        di = initDi();
        manager = di.get(ManagerToken);
        await manager.init();
    });

    after(() => {
        return manager.stop();
    });

    it('Should process events', async () => {
        let model = await createModel(di, undefined, { value: '', otherValue: 'some useless info' });
        const timestamp = model.timestamp;

        await pushEvent(di, {
            characterId: model._id,
            eventType: 'concat',
            timestamp: timestamp + 5,
            data: { value: 'A' }
        });

        await pushEvent(di, {
            characterId: model._id,
            eventType: '_RefreshModel',
            timestamp: timestamp + 10
        });

        let [baseModel, workingModel, viewModel] =
            await getModelVariantsAtTimestamp(di, model._id, timestamp + 10, ['models', 'workingModels', 'defaultViewModels']);

        expect(baseModel).to.exist;
        expect(workingModel).to.exist;
        expect(viewModel).to.exist;

        if (!baseModel || !workingModel || !viewModel) throw new Error('imposible!');

        expect(baseModel).to.has.property('value', 'A');
        expect(baseModel).to.has.property('otherValue', 'some useless info');
        expect(workingModel).to.has.property('value', 'A');
        expect(workingModel).to.has.property('timestamp', baseModel.timestamp);
        expect(viewModel).to.has.property('value', 'A');
        expect(viewModel).to.has.property('timestamp', baseModel.timestamp);
        expect(viewModel).not.to.has.property('otherValue');
    });

    it('Should sort events by timestamp', async () => {
        let model = await createModel(di);
        let timestamp = model.timestamp;

        await pushEvent(di, {
            characterId: model._id,
            eventType: 'concat',
            timestamp: timestamp + 100,
            data: { value: 'A' }
        });

        await pushEvent(di, {
            characterId: model._id,
            eventType: 'concat',
            timestamp: timestamp + 50,
            data: { value: 'B' }
        });

        await pushEvent(di, {
            characterId: model._id,
            eventType: 'concat',
            timestamp: timestamp + 200,
            data: { value: 'C' }
        });

        await pushEvent(di, {
            characterId: model._id,
            eventType: '_RefreshModel',
            timestamp: timestamp + 150
        });

        let [baseModel, workingModel, viewModel] =
            await getModelVariantsAtTimestamp(di, model._id, timestamp + 150, ['models', 'workingModels', 'defaultViewModels']);

        if (!baseModel || !workingModel || !viewModel) throw new Error('imposible!');

        expect(baseModel).to.has.property('value', 'BA');
        expect(baseModel.timestamp).to.be.equal(timestamp + 150);
    });

    it('Should continue to process events for the same character', async () => {
        let model = await createModel(di);
        let timestamp = model.timestamp;

        await pushEvent(di, {
            characterId: model._id,
            eventType: 'concat',
            timestamp: timestamp + 10,
            data: { value: 'A' }
        });

        await pushEvent(di, {
            characterId: model._id,
            eventType: '_RefreshModel',
            timestamp: timestamp + 20
        });

        await delay(400);

        timestamp = Date.now();

        await pushEvent(di, {
            characterId: model._id,
            eventType: 'concat',
            timestamp: timestamp + 10,
            data: { value: 'B' }
        });

        await pushEvent(di, {
            characterId: model._id,
            eventType: '_RefreshModel',
            timestamp: timestamp + 20
        });

        let baseModel = await getModelAtTimestamp(di, model._id, timestamp + 20);
        expect(baseModel).to.has.property('value', 'AB');
    });

    it('Should process events queued with short intervals', async () => {
        let model = await createModel(di);
        let timestamp = model.timestamp + 1;

        await pushEvent(di, {
            characterId: model._id,
            eventType: '_RefreshModel',
            timestamp
        });

        await pushEvent(di, {
            characterId: model._id,
            eventType: '_RefreshModel',
            timestamp: timestamp + 1
        });

        await pushEvent(di, {
            characterId: model._id,
            eventType: '_RefreshModel',
            timestamp: timestamp + 2
        });

        let [baseModel, workingModel, viewModel] =
            await getModelVariantsAtTimestamp(di, model._id, timestamp + 2, ['models', 'workingModels', 'defaultViewModels']);

        if (!baseModel || !workingModel || !viewModel) throw new Error('imposible!');

        expect(baseModel.timestamp).to.be.equal(timestamp + 2);
    });

    it('Should be able to aquire external objects', async () => {
        let model = await createModel(di);
        let timestamp = model.timestamp;

        await saveObject(di, 'counters', {
            _id: 'abc',
            value: 0
        });

        await pushEvent(di, {
            characterId: model._id,
            eventType: 'externalCounter',
            timestamp: timestamp + 10
        });

        await pushEvent(di, {
            characterId: model._id,
            eventType: '_RefreshModel',
            timestamp: timestamp + 20
        });

        await pushEvent(di, {
            characterId: model._id,
            eventType: 'externalCounter',
            timestamp: timestamp + 30
        });

        await pushEvent(di, {
            characterId: model._id,
            eventType: '_RefreshModel',
            timestamp: timestamp + 50
        });

        // Not interested in actual model, just wait for processing.
        await getModelAtTimestamp(di, model._id, timestamp + 50);
        
        let abc = await getObject(di, 'counters', 'abc');

        expect(abc).to.exist;
        expect(abc.value).to.equals(2);
    });

    it('Do not save undefined viewmodels', async () => {
        let model = await createModel(di, undefined, { skipFromViewmodel: true });
        const timestamp = model.timestamp;

        await pushEvent(di, {
            characterId: model._id,
            eventType: '_RefreshModel',
            timestamp: timestamp + 1
        });

        let [baseModel, workingModel] =
            await getModelVariantsAtTimestamp(di, model._id, timestamp + 1, ['models', 'workingModels']);

        expect(baseModel).to.exist;
        expect(workingModel).to.exist;
        
        let [viewModel] = await getModelVariants(di, model._id, ['defaultViewModels']);
        expect(viewModel).not.to.exist;
    });
});
