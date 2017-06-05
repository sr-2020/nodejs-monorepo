import { expect } from 'chai';
import { Worker } from '../../src/worker';
import { Config, EventHandler } from '../../src/config';

describe('Worker', () => {
    let worker: Worker;

    beforeEach(() => {
        let eventHandlers: EventHandler[] = [
            {
                eventType: "noop",
                effects: [
                    "noop"
                ]
            },

            {
                eventType: "add",
                effects: [
                    "add"
                ]
            },

            {
                eventType: "mul",
                effects: [
                    "mul"
                ]
            },

            {
                eventType: "concat",
                effects: [
                    "concat"
                ]
            },

            {
                eventType: "delayedConcat",
                effects: [
                    "delayedConcat"
                ]
            }
        ];

        const config = Config.parse({
            events: eventHandlers
        });

        worker = Worker.load(`${__dirname}/../test-models/trivial`).configure(config);
    });

    it("Should process some models", () => {
        const context = { timestamp: 0, "value": 0 };

        const timestamp = Date.now();

        const events = [
            { eventType: "add", data: { operand: "value", value: "2" }, timestamp: timestamp - 2000 },
            { eventType: "add", data: { operand: "value", value: "3" }, timestamp: timestamp - 1000 },
            { eventType: "mul", data: { operand: "value", value: "2" }, timestamp }
        ];

        let result = worker.process(timestamp, context, events)

        expect(result.baseModel).to.deep.equal({ timestamp: timestamp, value: (2 + 3) * 2, timers: [] });
    });

    it("Should process some timers", () => {
        const context = { timestamp: 0, "value": '' }

        const timestamp = Date.now();

        const events = [
            { eventType: "concat", data: { operand: "value", value: "A" }, timestamp: timestamp - 10000 },
            { eventType: "delayedConcat", data: { operand: "value", value: "B", delay: 3 }, timestamp: timestamp - 10000 },
            { eventType: "concat", data: { operand: "value", value: "A" }, timestamp: timestamp - 9000 },
            { eventType: "concat", data: { operand: "value", value: "A" }, timestamp: timestamp }
        ];

        let result = worker.process(timestamp, context, events);

        expect(result.baseModel).to.deep.equal({ timestamp: timestamp, value: "AABA", timers: [] });
    })
});
