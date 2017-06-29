import { EventEmitter } from 'events';
import * as ChildProcess from 'child_process';

import Logger from './logger';
import { Event } from './events_source';

export type EngineResult = {
    baseModel: any,
    workingModel: any,
    viewModels: { [alias: string]: any }
}

export default class Worker extends EventEmitter {
    private _child: ChildProcess.ChildProcess | null;

    constructor(private logger: Logger, private workerModule: string, private args?: string[]) {
        super();
    }

    get child() { return this._child; }

    up(): this {
        this.logger.info('manager', "Worker::up", this.workerModule);
        let workerModule = require.resolve(this.workerModule);
        this._child = ChildProcess.fork(workerModule, this.args, { silent: false });

        this._child.on('message', this.handleLogMessage);
        this._child.on('message', this.emitMessage);
        this._child.on('error', this.emitError);
        this._child.on('exit', this.emitExit);

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
        this.on('message', callback);
        return this;
    }

    onError(callback: (err: Error) => void): this {
        this.on('error', callback);
        return this;
    }

    onExit(callback: (code: number, signal: string) => void): this {
        this.on('exit', callback);
        return this;
    }

    handleLogMessage = (message: any) => {
        if (message.type == 'log') {
            this.logger.log(message.source, message.level, message.msg, ...message.params);
        }
    }

    emitMessage = (message: any) => this.emit('message', message)
    emitError = (err: Error) => this.emit('error', err)
    emitExit = (code: number, signal: string) => this.emit('exit', code, signal);

    async process(syncEvent: Event, model: any, events: Event[]): Promise<EngineResult> {
        return new Promise<EngineResult>((resolve, reject) => {
            if (!this._child) return reject(new Error('No child process'))

            const onResult = (message: any) => {
                if (message.type == 'result') {
                    if (this._child) {
                        this._child.removeListener('message', onResult);
                        this._child.removeListener('error', onError);
                    }

                    let { baseModel, workingModel, viewModels } = message;

                    resolve({ baseModel, workingModel, viewModels });
                }
            }

            const onError = (err: any) => {
                if (this._child) {
                    this._child.removeListener('message', onResult);
                    this._child.removeListener('error', onError);
                }
                reject(err);
            }

            this._child.on('message', onResult);
            this._child.on('error', onError);

            this._child.send({ context: model, events });

            // TODO: handle timeout
        });
    }
}
