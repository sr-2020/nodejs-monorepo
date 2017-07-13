import { EventEmitter } from 'events';
import * as ChildProcess from 'child_process';

import { LoggerInterface } from './logger';
import { Event } from './events_source';

export type EngineResultOk = {
    status: 'ok'
    baseModel: any
    workingModel: any
    viewModels: { [alias: string]: any }
}

export type EngineResultError = {
    status: 'error'
    error: any
}

export type EngineResult = EngineResultOk | EngineResultError;

export class Worker extends EventEmitter {
    private child: ChildProcess.ChildProcess | null;
    lastOutput: string[] = [];

    constructor(private logger: LoggerInterface, private workerModule: string, private args?: string[]) {
        super();
    }

    up(): this {
        this.logger.info('manager', 'Worker::up', this.workerModule);
        let workerModule = require.resolve(this.workerModule);
        this.child = ChildProcess.fork(workerModule, this.args, { silent: true });

        this.child.on('message', this.handleLogMessage);
        this.child.on('message', this.emitMessage);
        this.child.on('error', this.emitError);
        this.child.on('exit', this.emitExit);
        this.child.stdout.on('data', this.handleOutput);
        this.child.stderr.on('data', this.handleOutput);

        return this;
    }

    down(): this {
        if (this.child) {
            this.child.kill();
            this.child.removeAllListeners();
            this.child = null;
        }
        return this;
    }

    send(message: any): this {
        if (this.child) {
            this.child.send(message);
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

    handleOutput = (chunk: string) => {
        this.lastOutput.push(chunk);
    }

    emitMessage = (message: any) => this.emit('message', message);
    emitError = (err: Error) => this.emit('error', err);
    emitExit = (code: number, signal: string) => this.emit('exit', code, signal);

    async process(syncEvent: Event, model: any, events: Event[]): Promise<EngineResult> {
        this.lastOutput = [];
        return new Promise<EngineResult>((resolve, reject) => {
            if (!this.child) return reject(new Error('No child process'));

            const onResult = (message: any) => {
                if (message.type == 'result') {
                    if (this.child) {
                        this.child.removeListener('message', onResult);
                        this.child.removeListener('error', onError);
                    }

                    let { status, baseModel, workingModel, viewModels } = message;

                    resolve({ status, baseModel, workingModel, viewModels });
                }
            };

            const onError = (err: any) => {
                if (this.child) {
                    this.child.removeListener('message', onResult);
                    this.child.removeListener('error', onError);
                    this.child.removeListener('exit', onError);
                }
                reject('Worker error');
            };

            this.child.on('message', onResult);
            this.child.on('error', onError);
            this.child.on('exit', onError);

            this.child.send({ context: model, events });

            // TODO: handle timeout
        });
    }
}
