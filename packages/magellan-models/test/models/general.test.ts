import { expect } from 'chai';
import { getEvents, getNoOpEvent } from '../helpers/events';
import { getExampleDeusModel } from '../helpers/example-models';
import { process } from '../helpers/util';

describe('General events: ', () => {

    it('Add temporary condition', async () => {
        const eventData = {
            text: 'Test1',
            details: 'Test 1 details',
            class: 'mind',
        };

        const eventData2 = {
            text: 'Test2',
            details: 'Test 2 details',
            class: 'mind',
            duration: 600,
        };

        const model = getExampleDeusModel();
        let events = getEvents(model._id, [{ eventType: 'put-condition', data: eventData },
        { eventType: 'put-condition', data: eventData2 }], model.timestamp + 100);
        let { baseModel } = await process(model, events);

        let cond1 = baseModel.conditions.find((c: any) => c.text == 'Test1');
        let cond2 = baseModel.conditions.find((c: any) => c.text == 'Test2');

        expect(cond1).to.exist;
        expect(cond2).to.exist;

        // Проверить через 600 секунд
        events = [getNoOpEvent(model._id, baseModel.timestamp + 610 * 1000)];
        ({ baseModel } = await process(baseModel, events));

        cond1 = baseModel.conditions.find((c: any) => c.text == 'Test1');
        cond2 = baseModel.conditions.find((c: any) => c.text == 'Test2');

        expect(cond1).to.exist;
        expect(cond2).to.not.exist;

        // Проверить через 2 часа секунд
        events = [getNoOpEvent(model._id, baseModel.timestamp + 7200 * 1000)];
        ({ baseModel } = await process(baseModel, events));

        cond1 = baseModel.conditions.find((c: any) => c.text == 'Test1');
        cond2 = baseModel.conditions.find((c: any) => c.text == 'Test2');

        expect(cond1).to.not.exist;
        expect(cond2).to.not.exist;
    });

    it('Send message', async () => {
        const msgData = {
            title: 'Test Message',
            text: 'Test Message details',
        };

        const model = getExampleDeusModel();
        const events = getEvents(model._id, [{ eventType: 'send-message', data: msgData }], model.timestamp + 100);
        const { baseModel } = await process(model, events);

        const msg = baseModel.messages.find((c: any) => c.title == 'Test Message');

        expect(msg).to.exist;

        /// printModel(baseModel);
    });

    it('Change variable', async () => {
        const model = getExampleDeusModel();
        const events = getEvents(model._id,
            [{ eventType: 'change-model-variable', data: { name: 'sweethome', value: 'new_location' } },
        { eventType: 'change-model-variable', data: { name: 'login', value: 'test-login' } }], model.timestamp + 100);
        const { baseModel } = await process(model, events);

        expect(baseModel.sweethome).is.equal('new_location');
        expect(baseModel.login).is.equal('john.smith');
    });
});
