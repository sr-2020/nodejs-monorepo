import { expect } from 'chai';
import { Worker } from '../../src/worker';
import { Config } from '../../src/config';

describe('Worker', () => {
    let worker: Worker;

    beforeEach(() => {
        const config = Config.parse({
            events: [
                {
                    handle: "noop",
                    callbacks: [
                        { model: "ExampleModel", callback: "noop" }
                    ]
                },

                {
                    handle: "add",
                    callbacks: [
                        { model: "ExampleModel", callback: "add" }
                    ]
                },

                {
                    handle: "mul",
                    callbacks: [
                        { model: "ExampleModel", callback: "mul" }
                    ]
                },

                {
                    handle: "concat",
                    callbacks: [
                        { model: "ExampleModel", callback: "concat" }
                    ]
                },

                {
                    handle: "delayedConcat",
                    callbacks: [
                        { model: "ExampleModel", callback: "delayedConcat" }
                    ]
                }
            ]
        });

        worker = Worker.load(`${__dirname}/../test-models/trivial`).configure(config);
    });

    it("Should process some models", () => {
        const context = { timestamp: 0, "value": 0 };

        const timestamp = Date.now();

        const events = [
            { handle: "add", data: { operand: "value", value: "2" }, timestamp: timestamp - 2000 },
            { handle: "add", data: { operand: "value", value: "3" }, timestamp: timestamp - 1000 },
            { handle: "mul", data: { operand: "value", value: "2" }, timestamp }
        ];

        expect(worker.process(context, events)).to.deep.equal({ timestamp: timestamp, value: (2 + 3) * 2 });
    });

    it("Should process some timers", () => {
        const context = { timestamp: 0, "value": '' }

        const timestamp = Date.now();

        const events = [
            { handle: "concat", data: { operand: "value", value: "A" }, timestamp: timestamp - 10000 },
            { handle: "delayedConcat", data: { operand: "value", value: "B", delay: 3 }, timestamp: timestamp - 10000 },
            { handle: "concat", data: { operand: "value", value: "A" }, timestamp: timestamp - 9000 },
            { handle: "concat", data: { operand: "value", value: "A" }, timestamp: timestamp }
        ];

        let result = worker.process(context, events);

        expect(result).to.deep.equal({ timestamp: timestamp, value: "AABA", timers: [] });
    })
});
