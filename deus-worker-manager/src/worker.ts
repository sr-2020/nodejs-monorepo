import { EventEmitter } from 'events';
import * as ChildProcess from 'child_process';

import { Event } from './events_source';

export default class Worker extends EventEmitter {
    private _child: ChildProcess.ChildProcess | null;

    constructor(private workerModule: string, private args?: string[]) {
        super();
    }

    get child() { return this._child; }

    up(): this {
        console.log(">>> Worker::up", this.workerModule);
        let workerModule = require.resolve(this.workerModule);
        this._child = ChildProcess.fork(workerModule, this.args, { silent: false });
        return this;
    }

    down(): this {
        if (this._child) {
            this._child.kill();
            this._child.removeAllListeners();
            this._child = null;
        }
        return this;
    }

    send(message: any): this {
        if (this._child) {
            this._child.send(message);
        }
        return this;
    }

    onMessage(callback: (message: any) => void): this {
        if (this._child) {
            this._child.on('message', callback);
        }

        return this;
    }

    onError(callback: (err: Error) => void): this {
        if (this._child) {
            this._child.on('error', callback);
        }

        return this;
    }

    async process(syncEvent: Event, model: any, events: Event[]) {
        return new Promise((resolve, reject) => {
            if (!this._child) return reject(new Error('No child process'))

            this._child.once('message', (result) => resolve(result));
            this._child.once('error', (err) => reject(err));

            this._child.send({ timestamp: syncEvent.timestamp, context: model, events });

            // TODO: handle timeout
        });
    }
}
