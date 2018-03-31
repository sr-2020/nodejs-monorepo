// tslint:disable:no-unused-expression

import { cloneDeep } from 'lodash';
import { expect } from 'chai';

import { ManagerToken } from '../../src/di_tokens';
import { Manager } from '../../src/manager';
import { Document } from '../../src/db/interface';

import { initDi, defaultConfig } from '../init';
import { createModel, createModelObj, saveModel, pushEvent, getModel } from '../model_helpers';
import { delay } from '../helpers';

describe('Crash scenarios', function() {
    this.timeout(5000);

    let manager: Manager;
    let di;

    before(async () => {
        let config = cloneDeep(defaultConfig);
        config.logger.default = { console: { silent: true } };
        di = initDi(config);
        manager = di.get(ManagerToken);
        await manager.init();
    });

    after(() => {
        return manager.stop();
    });

    it('Should not crash if model crashes', async () => {
        let model = await createModel(di);
        let timestamp = Date.now();

        await pushEvent(di, {
            characterId: model._id,
            eventType: 'crash',
            timestamp,
        });

        await pushEvent(di, {
            characterId: model._id,
            eventType: '_RefreshModel',
            timestamp: timestamp + 2
        });

        await delay(100);

        await pushEvent(di, {
            characterId: model._id,
            eventType: '_RefreshModel',
            timestamp: timestamp + 3
        });

        await delay(100);

        await pushEvent(di, {
            characterId: model._id,
            eventType: '_RefreshModel',
            timestamp: timestamp + 4
        });

        await delay(100);

        await pushEvent(di, {
            characterId: model._id,
            eventType: '_RefreshModel',
            timestamp: timestamp + 4
        });

        await delay(100);

        // now let's try normal operation

        model = await createModel(di);
        timestamp = Date.now();

        await pushEvent(di, {
            characterId: model._id,
            eventType: 'concat',
            timestamp,
            data: { value: 'A' }
        });

        await pushEvent(di, {
            characterId: model._id,
            eventType: '_RefreshModel',
            timestamp: timestamp + 50
        });

        await delay(400);

        let baseModel = await getModel(di, model._id);

        expect(baseModel).to.has.property('value', 'A');
    });

    it('Shoud not crash if model has no timestamp', async () => {
        let model = createModelObj();
        delete model.timestamp;
        await saveModel(di, model);

        let baseModel = await getModel(di, model._id);
        expect(baseModel).not.to.has.property('timestamp');

        await pushEvent(di, {
            characterId: model._id,
            eventType: '_RefreshModel',
            timestamp: Date.now()
        });

        await delay(400);

        baseModel = await getModel(di, model._id);

        expect(baseModel).to.has.property('timestamp');
    });

    it('Should not crash if worker was somehow killed', async () => {
        let model = await createModel(di);
        let timestamp = Date.now() + 10;

        await pushEvent(di, {
            characterId: model._id,
            eventType: 'kill',
            timestamp
        });

        await pushEvent(di, {
            characterId: model._id,
            eventType: '_RefreshModel',
            timestamp: timestamp + 2
        });

        await delay(100);

        await pushEvent(di, {
            characterId: model._id,
            eventType: '_RefreshModel',
            timestamp: timestamp + 3
        });

        await delay(100);

        await pushEvent(di, {
            characterId: model._id,
            eventType: '_RefreshModel',
            timestamp: timestamp + 4
        });

        await delay(100);

        await pushEvent(di, {
            characterId: model._id,
            eventType: '_RefreshModel',
            timestamp: timestamp + 4
        });

        await delay(100);

        // now let's try normal operation

        model = await createModel(di);
        timestamp = Date.now();

        await pushEvent(di, {
            characterId: model._id,
            eventType: 'concat',
            timestamp,
            data: { value: 'A' }
        });

        await pushEvent(di, {
            characterId: model._id,
            eventType: '_RefreshModel',
            timestamp: timestamp + 50
        });

        await delay(400);

        let baseModel = await getModel(di, model._id);

        expect(baseModel).to.has.property('value', 'A');
    });

    it('should handle _RetryRefresh event', async () => {
        let model = await createModel(di);
        let timestamp = Date.now();

        let crash = await pushEvent(di, {
            characterId: model._id,
            eventType: 'crash',
            timestamp: timestamp + 1
        });

        await pushEvent(di, {
            characterId: model._id,
            eventType: '_RefreshModel',
            timestamp: timestamp + 2
        });

        await delay(400);

        await pushEvent(di, {
            characterId: model._id,
            eventType: '_RefreshModel',
            timestamp: timestamp + 3
        });

        await delay(400);

        await pushEvent(di, {
            characterId: model._id,
            eventType: '_RefreshModel',
            timestamp: timestamp + 4
        });

        await delay(400);

        expect((manager as any).errors[model._id]).to.exist;
        expect((manager as any).errors[model._id]).to.equals(3);

        await pushEvent(di, { _id: crash.id, _rev: crash.rev, _deleted: true });

        await pushEvent(di, {
            characterId: model._id,
            eventType: '_RetryRefresh',
            timestamp: Date.now()
        });

        await delay(400);

        expect((manager as any).errors[model._id]).not.to.exist;
    });
});
