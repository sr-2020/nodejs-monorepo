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

export type EngineResult = {
    baseModel: any,
    workingModel: any,
    viewModel: any
}

export class Worker {
    private config: config.ConfigInterface
    private dispatcher: dispatcher.DispatcherInterface

    constructor(private model: model.Model) { }

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

    process(context: WorkerContext, events: dispatcher.Event[]): EngineResult {
        Logger.info('engine', 'processing', events);

        let baseCtx = new Context(context, events, this.config.dictionaries);
        let workingCtx = baseCtx.clone();

        //
        // main loop
        //
        for (let event of baseCtx.iterateEvents()) {
            Logger.info('engine', 'run event', event);

            baseCtx.decreaseTimers(event.timestamp - baseCtx.timestamp);
            this.runEvent(baseCtx, event);

            workingCtx = this.runModifiers(baseCtx);
            baseCtx.timers = workingCtx.timers;
            baseCtx.events = workingCtx.events;
        }

        let baseCtxValue = baseCtx.valueOf()
        let workingCtxValue = workingCtx.valueOf()

        let viewModel = this.runViewModels(workingCtxValue);

        return { baseModel: baseCtxValue, workingModel: workingCtxValue, viewModel };
    }

    listen() {
        process.on('disconnect', () => {
            console.log('Disconnected');
            process.exit();
        });

        process.on('message', (message: WorkerMessage) => {
            let { context, events } = message;

            let result = this.process(context, events);

            if (process && process.send) {
                process.send({ type: 'result', ...result });
            }
        });

        Logger.info('engine', 'Worker started: %s', process.pid);
    }

    private resolveCallback(callback: config.Callback): model.Callback | null {
        return this.model.callbacks[callback];
    }

    private runEvent(context: Context, event: dispatcher.Event): number {
        this.dispatcher.dispatch(event, context);
        return context.timestamp = event.timestamp;
    }

    private runModifiers(baseCtx: Context): Context {
        let timestamp = baseCtx.timestamp;
        let workingCtx = baseCtx.clone();
        let api = ModelApiFactory(workingCtx);

        let enabledModifiers = workingCtx.modifiers.filter((m) => m.enabled);

        // Functional effects first
        for (let modifier of enabledModifiers) {
            let effects = modifier.effects.filter((e) => e.enabled && e.type == 'functional');
            for (let effect of effects) {
                let f = this.resolveCallback(effect.handler);
                if (!f) continue;
                f(api, modifier);
            }
        }

        // Then Normal effects
        for (let modifier of enabledModifiers) {
            let effects = modifier.effects.filter((e) => e.enabled && e.type == 'normal');
            for (let effect of effects) {
                let f = this.resolveCallback(effect.handler);
                if (!f) continue;
                f(api, modifier);
            }
        }

        return workingCtx;
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
