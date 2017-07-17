import { EventEmitter } from 'events';
import * as ChildProcess from 'child_process';
import * as Rx from 'rxjs/Rx';
import { fromStream } from './utils';

import { Event, EngineMessage, EngineReply, EngineResult } from 'deus-engine-manager-api';

import { LoggerInterface, LogLevel } from './logger';
// import { Event } from './events_source';
import { Catalogs } from './catalogs_storage';

export class Worker extends EventEmitter {
    private child: ChildProcess.ChildProcess | null;

    private rx: {
        message: Rx.Observable<EngineReply>,
        error: Rx.Observable<any>,
        exit: Rx.Observable<any>,
        data: Rx.Observable<string>
    } | null;

    lastOutput: string[] = [];
    startedAt: number;

    constructor(private logger: LoggerInterface, private workerModule: string, private args?: string[]) {
        super();
    }

    async up(): Promise<this> {
        this.logger.info('manager', 'Worker::up', this.workerModule);
        this.startedAt = Date.now();

        this.child = await new Promise<ChildProcess.ChildProcess>((resolve, reject) => {
            let workerModule = require.resolve(this.workerModule);
            let child = ChildProcess.fork(workerModule, this.args, { silent: true });

            let error = Rx.Observable.fromEvent(child, 'error');
            let exit = Rx.Observable.fromEvent(child, 'exit');
            let stop = error.merge(exit);
            let message = Rx.Observable.fromEvent<EngineReply>(child, 'message').takeUntil(stop);
            let out = fromStream<string>(child.stdout);
            let err = fromStream<string>(child.stderr);
            let data = out.merge(err).takeUntil(stop);

            this.rx = {
                message, exit, error, data
            };

            // subscribe for logs early
            this.rx.message.filter((msg) => msg.type == 'log').subscribe(this.handleLogMessage);
            this.rx.data.subscribe(this.handleOutput);

            let ready = this.rx.message.filter((msg) => msg.type == 'ready').first();

            this.rx.exit.takeUntil(ready).subscribe(() => reject(new Error("Could't start child process")));
            this.rx.error.takeUntil(ready).subscribe(() => reject(new Error("Could't start child process")));

            ready.subscribe((msg) => resolve(child));
        });

        if (!this.rx) throw new Error('Imposible! Observable is not populated.');

        this.rx.message.subscribe(this.emitMessage);
        this.rx.error.subscribe(this.emitError);
        this.rx.exit.subscribe(this.emitExit);

        return this;
    }

    down(): this {
        if (this.child) {
            this.child.removeAllListeners();
            this.child.kill();
            this.child = null;
            this.rx = null;
        }
        return this;
    }

    configure(catalogs: Catalogs): this {
        return this.send({ type: 'configure', data: catalogs.data });
    }

    send(message: EngineMessage): this {
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

    onExit(callback: () => void): this {
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
    emitExit = () => this.emit('exit');

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

            this.send({ type: 'events', context: model, events });

            // TODO: handle timeout
        });
    }
}
