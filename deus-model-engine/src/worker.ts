import { clone, assign } from 'lodash'
import { inspect } from 'util';

import Logger from './logger';
import { requireDir } from './utils';
import * as config from './config';
import * as model from './model';
import { Context } from './context';
import * as dispatcher from './dispatcher';
import { ModelApiFactory } from './model_api';

export type WorkerMessage = {
    timestamp: number,
    context: any,
    events: dispatcher.Event[]
}

export type WorkerContext = {
    timestamp: number,
    [key: string]: any
}

export class Worker {
    private config: config.ConfigInterface
    private dispatcher: dispatcher.DispatcherInterface

    constructor(private model: model.Model) {
        this.processSingle = this.processSingle.bind(this)
    }

    static load(dir: string): Worker {
        let model = loadModels(dir);
        Logger.debug('engine', 'model loaded: %s', inspect(model));
        return new Worker(model);
    }

    configure(config: config.ConfigInterface): Worker {
        Logger.debug('engine', 'config loaded: %j', config);
        this.config = config;
        this.dispatcher = new dispatcher.Dispatcher()

        config.events.forEach((e) => {
            let callbacks = e.effects.map((c) => this.resolveCallback(c))
            this.dispatcher.on(e.eventType, callbacks);
        });

        return this;
    }

    process(timestamp: number, context: WorkerContext, events: dispatcher.Event[]): [WorkerContext, WorkerContext] {
        Logger.debug('engine', 'processing', events);
        if (!this.dispatcher) return [context, context];

        let baseCtx = new Context(context, events);

        //
        // run instant effects
        //
        for (let event of baseCtx.iterateEvents()) {
            let prevTimestamp = baseCtx.getTimestamp()
            baseCtx.decreaseTimers(prevTimestamp);
            this.processSingle(baseCtx, event);
        }

        //
        // apply modifiers
        //
        let workingCtx = baseCtx.clone();
        let api = ModelApiFactory(workingCtx);

        // Functional effects first
        for (let effect of workingCtx.iterateEnabledFunctionalEffects()) {
            let f = this.resolveCallback(effect.handler);
            if (!f) continue;
            f.call(api);
        }

        // Then Normal effects
        for (let effect of workingCtx.iterateEnabledNormalEffects()) {
            let f = this.resolveCallback(effect.handler);
            if (!f) continue;
            f.call(api);
        }

        let prevTimestamp = baseCtx.getTimestamp();
        baseCtx.setTimestamp(timestamp);
        baseCtx.decreaseTimers(prevTimestamp);
        workingCtx.setTimestamp(timestamp);
        workingCtx.decreaseTimers(prevTimestamp);

        //
        // copy timers to base
        //
        let baseCtxValue = baseCtx.valueOf()
        let workingCtxValue = workingCtx.valueOf()
        baseCtxValue.timers = clone(workingCtxValue.timers);

        let viewModel = this.runViewModels(workingCtxValue);

        return [baseCtxValue, workingCtxValue, viewModel];
    }

    listen() {
        process.on('disconnect', () => {
            console.log('Disconnected');
            process.exit();
        });

        process.on('message', (message: WorkerMessage) => {
            let { timestamp, context, events } = message;

            let result = this.process(timestamp, context, events);

            if (process && process.send) {
                process.send({ type: 'result', data: result });
            }
        });

        Logger.info('engine', 'Worker started: %s', process.pid);
    }

    private resolveCallback(callback: config.Callback): model.Callback | null {
        return this.model.callbacks[callback];
    }

    private processSingle(context: Context, event: dispatcher.Event): number {
        this.dispatcher.dispatch(event, context);
        return context.setTimestamp(event.timestamp);
    }

    private runViewModels(data: any) {
        return this.model.viewModelCallbacks.reduce((vm, fn) => {
            return fn(data, vm);
        }, {});
    }
}

function loadModels(dir: string): model.Model {
    return requireDir(dir, (m: any, src: any) => {
        m = clone(m);
        src = clone(src);
        if (!m.viewModelCallbacks) m.viewModelCallbacks = [];
        if (src._view) {
            m.viewModelCallbacks.push(src._view);
            delete src._view;
        }
        m.callbacks = assign({}, m.callbacks, src);
        return m;
    });
}
