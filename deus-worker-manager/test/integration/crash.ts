import { cloneDeep } from 'lodash';
import { expect } from 'chai';

import Manager from '../../src/manager';
import { DIInterface } from '../../src/di';
import { Document } from '../../src/db/interface';

import { initDi, defaultConfig } from '../init'
import { createModel, pushEvent, getModel } from '../model_helpers';
import { delay } from '../helpers';

describe('Crash scenarios', function() {
    this.timeout(5000);

    let manager: Manager;
    let di: DIInterface;

    before(() => {
        let config = cloneDeep(defaultConfig);
        config.logger.default = { console: { silent: true } };
        di = initDi(config);
        manager = new Manager(di);
        return delay(500);
    });

    after(() => {
        return manager.stop();
    });

    it('Should not crash if model crashes', async () => {
        let model = await createModel(di);
        let timestamp = Date.now() + 10;

        await pushEvent(di, {
            characterId: model._id,
            eventType: 'crash',
            timestamp: timestamp
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
            timestamp: timestamp,
            data: { value: 'A' }
        });

        await pushEvent(di, {
            characterId: model._id,
            eventType: '_RefreshModel',
            timestamp: timestamp + 50
        })

        await delay(100);

        let baseModel = await getModel(di, model._id);

        expect(baseModel).to.has.property('value', 'A');

    });
});
