import { expect } from 'chai';
import { Worker } from '../../src/worker';
import { Config, EventHandler } from '../../src/config';

describe('Worker', () => {
    let worker: Worker;

    beforeEach(() => {
        let eventHandlers: EventHandler[] = [
            {
                name: "noop",
                callbacks: [
                    { model: "ExampleModel", callback: "noop" }
                ]
            },

            {
                name: "add",
                callbacks: [
                    { model: "ExampleModel", callback: "add" }
                ]
            },

            {
                name: "mul",
                callbacks: [
                    { model: "ExampleModel", callback: "mul" }
                ]
            },

            {
                name: "concat",
                callbacks: [
                    { model: "ExampleModel", callback: "concat" }
                ]
            },

            {
                name: "delayedConcat",
                callbacks: [
                    { model: "ExampleModel", callback: "delayedConcat" }
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
            { name: "add", data: { operand: "value", value: "2" }, timestamp: timestamp - 2000 },
            { name: "add", data: { operand: "value", value: "3" }, timestamp: timestamp - 1000 },
            { name: "mul", data: { operand: "value", value: "2" }, timestamp }
        ];

        let result = worker.process(context, events)

        expect(result[0]).to.deep.equal({ timestamp: timestamp, value: (2 + 3) * 2, timers: [] });
    });

    it("Should process some timers", () => {
        const context = { timestamp: 0, "value": '' }

        const timestamp = Date.now();

        const events = [
            { name: "concat", data: { operand: "value", value: "A" }, timestamp: timestamp - 10000 },
            { name: "delayedConcat", data: { operand: "value", value: "B", delay: 3 }, timestamp: timestamp - 10000 },
            { name: "concat", data: { operand: "value", value: "A" }, timestamp: timestamp - 9000 },
            { name: "concat", data: { operand: "value", value: "A" }, timestamp: timestamp }
        ];

        let result = worker.process(context, events);

        expect(result[0]).to.deep.equal({ timestamp: timestamp, value: "AABA", timers: [] });
    })
});
