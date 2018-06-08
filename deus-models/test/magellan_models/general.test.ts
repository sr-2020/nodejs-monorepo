//Тесты для событий общего назначения (для хакеров и т.д.)

import { expect } from 'chai';
import { process, printModel } from '../test_helpers';
import { getExampleMagellanModel } from '../fixtures/models';
import { getEvents, getRefreshEvent } from '../fixtures/events';
import consts = require('../../helpers/constants');
import { systemsIndices } from '../../helpers/magellan';

describe('Helpers', () => {
    it('systemIndices', () => {
        const indices = systemsIndices();
        expect(indices).to.deep.equal([0, 1, 2, 3, 4, 5, 6]);
    })
});

describe.only('General Magellan events: ', () => {

    it("No-op refresh model", async function() {

        const model = getExampleMagellanModel();
        const events = [getRefreshEvent(model._id, model.timestamp + 610*1000 )];
        let {baseModel, workingModel } = await process(model, events);

        expect(baseModel.timestamp).to.equal( 610*1000 );
        expect(workingModel.timestamp).to.equal( 610*1000 );

        model.timestamp = 610*1000;

        expect(baseModel).to.deep.equal(model);
    });

    it("Modify systems instant", async function() {

        let model = getExampleMagellanModel();
        model.systems = [0, -1, 2, -3, 18, -2, 0]
        const events = getEvents(model._id,
            [ {eventType: 'modify-systems-instant', data: [1, 2, 3, 4, 5, 6, 0] } ], 100);

        let {baseModel, workingModel } = await process(model, events);

        expect(baseModel.systems).to.deep.equal([1, 1, 5, 1, 23, 4, 0]);
        expect(baseModel.systems).to.deep.equal([1, 1, 5, 1, 23, 4, 0]);
    });


    it("Use pill", async function() {
        let model = getExampleMagellanModel();
        model.systems = [0, 0, 0, 0, 0, 0, 0]

        let events = getEvents(model._id,
            [ {eventType: 'use-magellan-pill', data: [1, 2, -2, -3, 0, 0, 0] } ], 100);

        model = (await process(model, events)).baseModel;
        expect(model.systems).to.deep.equal([1, 1, -1, -1, 0, 0, 0]);

        events = [getRefreshEvent(model._id, model.timestamp + consts.MAGELLAN_TICK_MILLISECONDS)];
        model = (await process(model, events)).baseModel;
        expect(model.systems).to.deep.equal([1, 2, -2, -2, 0, 0, 0]);

        events = [getRefreshEvent(model._id, model.timestamp + consts.MAGELLAN_TICK_MILLISECONDS)];
        model = (await process(model, events)).baseModel;
        expect(model.systems).to.deep.equal([1, 2, -2, -3, 0, 0, 0]);

        events = [getRefreshEvent(model._id, model.timestamp + consts.MAGELLAN_TICK_MILLISECONDS)];
        model = (await process(model, events)).baseModel;
        expect(model.systems).to.deep.equal([1, 2, -2, -3, 0, 0, 0]);
    });

    it("Use pill via QR", async function() {
        let model = getExampleMagellanModel();
        model.systems = [0, 0, 0, 0, 0, 0, 0]

        const data = {
            type: 4,
            kind: 0,
            validUntil: 0,
            payload: '1,2,-2,-3,0,0,0'
        }

        let events = getEvents(model._id,
            [ {eventType: 'scanQr', data} ], 100);

        model = (await process(model, events)).baseModel;
        expect(model.systems).to.deep.equal([1, 1, -1, -1, 0, 0, 0]);

        events = [getRefreshEvent(model._id, model.timestamp + consts.MAGELLAN_TICK_MILLISECONDS)];
        model = (await process(model, events)).baseModel;
        expect(model.systems).to.deep.equal([1, 2, -2, -2, 0, 0, 0]);

        events = [getRefreshEvent(model._id, model.timestamp + consts.MAGELLAN_TICK_MILLISECONDS)];
        model = (await process(model, events)).baseModel;
        expect(model.systems).to.deep.equal([1, 2, -2, -3, 0, 0, 0]);

        events = [getRefreshEvent(model._id, model.timestamp + consts.MAGELLAN_TICK_MILLISECONDS)];
        model = (await process(model, events)).baseModel;
        expect(model.systems).to.deep.equal([1, 2, -2, -3, 0, 0, 0]);
    });


    it("Enter and leave ship", async function() {
        let baseModel = getExampleMagellanModel();
        let workingModel: any;

        let events = getEvents(baseModel._id, [ {eventType: 'enter-ship', data: 17 } ]);
        ({baseModel, workingModel} = (await process(baseModel, events)));

        let cond = workingModel.conditions.find( (c:any) => c.id == "on-the-ship");
        expect(cond).is.exist;
        expect(cond.text).to.contain('17');
        expect(workingModel.location).to.equal('ship_17');

        events = getEvents(baseModel._id, [ {eventType: 'enter-ship', data: 22 } ]);
        ({baseModel, workingModel} = (await process(baseModel, events)));

        cond = workingModel.conditions.find( (c:any) => c.id == "on-the-ship");
        expect(cond).is.exist;
        expect(cond.text).to.contain('22');
        expect(cond.text).not.to.contain('17');
        expect(workingModel.location).to.equal('ship_22');

        events = getEvents(baseModel._id, [ {eventType: 'leave-ship', data: {} } ]);
        ({baseModel, workingModel} = (await process(baseModel, events)));

        expect(workingModel.conditions).not.exist;
        expect(workingModel.location).not.exist;
    });

    it("Enter and leave ship QR", async function() {
        let baseModel = getExampleMagellanModel();
        let workingModel: any;
        let viewModels: any;

        let events = getEvents(baseModel._id,
            [ {eventType: 'scanQr', data: {type: 5, kind: 0, validUntil: 0, payload: '17' } }]);
        ({baseModel, workingModel, viewModels} = (await process(baseModel, events)));

        let cond = workingModel.conditions.find( (c:any) => c.id == "on-the-ship");
        expect(cond).is.exist;
        expect(cond.text).to.contain('17');
        expect(workingModel.location).to.equal('ship_17');

        events = getEvents(baseModel._id,
            [ {eventType: 'scanQr', data: {type: 6, kind: 0, validUntil: 0, payload: '' } }]);
        ({baseModel, workingModel} = (await process(baseModel, events)));

        expect(workingModel.conditions).not.exist;
        expect(workingModel.location).not.exist;
    });


});