import { EventEmitter } from 'events';
import * as ChildProcess from 'child_process';
import * as Rx from 'rxjs/Rx';
import { fromStream } from './utils';

import { Event, EngineMessage, EngineReply, EngineReplyAquire, EngineResult, EngineResultOk, EngineResultError } from 'deus-engine-manager-api';

import { LoggerInterface } from './logger';
import { Catalogs } from './catalogs_storage';
import { BoundObjectStorage } from './object_storage';

export class Worker extends EventEmitter {
    private child: ChildProcess.ChildProcess | null;

    private rx: {
        message: Rx.Observable<EngineReply>,
        error: Rx.Observable<any>,
        exit: Rx.Observable<any>,
        stop: Rx.Observable<any>,
        data: Rx.Observable<string>
    };

    lastOutput: string[] = [];
    startedAt: number;

    constructor(
        private logger: LoggerInterface,
        private workerModule: string,
        private args?: string[]
    ) {
        super();
    }

    async up(): Promise<this> {
        this.logger.info('manager', 'Worker::up', this.workerModule);
        this.startedAt = Date.now();

        this.child = await new Promise<ChildProcess.ChildProcess>((resolve, reject) => {
            let workerModule = require.resolve(this.workerModule);
            let child = ChildProcess.fork(workerModule, this.args, { silent: true });
            child.setMaxListeners(20);

            let error = Rx.Observable.fromEvent(child, 'error');
            let exit = Rx.Observable.fromEvent(child, 'exit');
            let stop = error.merge(exit);
            let message = Rx.Observable.fromEvent<EngineReply>(child, 'message').takeUntil(stop);
            let out = fromStream<string>(child.stdout);
            let err = fromStream<string>(child.stderr);
            let data = out.merge(err).takeUntil(stop);

            this.rx = {
                message, exit, error, stop, data
            };

            let ready = this.rx.message.filter((msg) => msg.type == 'ready').take(1);

            // subscribe for logs early
            this.rx.message.filter((msg) => msg.type == 'log').takeUntil(ready).subscribe(this.handleLogMessage());
            this.rx.data.subscribe(this.handleOutput);

            this.rx.exit.takeUntil(ready).subscribe(() => reject(new Error("Couldn't start child process")));
            this.rx.error.takeUntil(ready).subscribe(() => reject(new Error("Couldn't start child process")));

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
            this.rx = null as any;
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

    handleLogMessage = (syncEvent?: Event) => (message: any) => {
        if (message.type == 'log') {
            if (syncEvent) {
                message.params = message.params || [];
                message.params.push({
                    characterId: syncEvent.characterId,
                    eventTimestamp: syncEvent.timestamp
                });
            }
            this.logger.log(message.source, message.level, message.msg, ...message.params);
        }
    }

    handleOutput = (chunk: string) => {
        this.lastOutput.push(chunk);
    }

    emitMessage = (message: any) => this.emit('message', message);
    emitError = (err: Error) => this.emit('error', err);
    emitExit = () => this.emit('exit');

    async process(objectStorage: BoundObjectStorage, syncEvent: Event, model: any, events: Event[]): Promise<EngineResult> {
        this.lastOutput = [];

        return new Promise<EngineResult>((resolve, reject) => {
            if (!this.child) return reject(new Error('No child process'));

            let result = this.rx.message.filter((m) => m.type == 'result') as Rx.Observable<EngineResult>;
            result.take(1).subscribe(resolve);

            let aquire = this.rx.message.filter((m) => m.type == 'aquire') as Rx.Observable<EngineReplyAquire>;
            aquire.takeUntil(Rx.Observable.merge(result, this.rx.stop)).subscribe(async (msg: EngineReplyAquire) => {
                let data = await objectStorage.aquire(msg.keys);
                this.send({ type: 'aquired', data });
            });

            this.rx.message.filter((msg) => msg.type == 'log').takeUntil(result).subscribe(this.handleLogMessage(syncEvent));

            this.rx.stop.takeUntil(result).take(1).subscribe(() => reject('Worker error'));

            this.send({ type: 'events', context: model, events });

            // TODO: handle timeout
        });
    }
}
