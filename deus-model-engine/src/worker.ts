import { clone, assign, reduce } from 'lodash'
import { inspect } from 'util';

import { Event, EngineContext, EngineMessage, EngineMessageEvents, EngineMessageConfigure, EngineResult } from 'deus-engine-manager-api';

import Logger from './logger';
import { requireDir } from './utils';
import * as config from './config';
import * as model from './model';
import { Context } from './context';
import * as dispatcher from './dispatcher';
import { ModelApiFactory } from './model_api';

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

    process(context: EngineContext, events: Event[]): EngineResult {
        Logger.info('engine', 'processing', events);

        let baseCtx = new Context(context, events, this.config.dictionaries);
        let workingCtx = baseCtx.clone();

        //
        // main loop
        //
        for (let event of baseCtx.iterateEvents()) {
            Logger.info('engine', 'run event', event);

            baseCtx.decreaseTimers(event.timestamp - baseCtx.timestamp);

            try {
                this.runEvent(baseCtx, event);
            } catch (e) {
                Logger.error('engine', 'Exception caught when processing event %j: %s', event, e.toString());
                return { status: 'error', error: e };
            }

            workingCtx = this.runModifiers(baseCtx);
            baseCtx.timers = workingCtx.timers;
            baseCtx.events = workingCtx.events;
        }

        let baseCtxValue = baseCtx.valueOf()
        let workingCtxValue = workingCtx.valueOf()

        let viewModels = this.runViewModels(workingCtx);

        return { status: 'ok', baseModel: baseCtxValue, workingModel: workingCtxValue, viewModels, events: baseCtx.outboundEvents };
    }

    listen() {
        if (process.send) {
            process.on('disconnect', () => {
                console.log('Disconnected');
                process.exit();
            });

            process.on('message', (message: EngineMessage) => {
                if (message.type == 'configure') {
                    this.onConfigure(message);
                } else {
                    this.onEvents(message);
                }
            });

            process.send({ type: 'ready' });

            Logger.info('engine', 'Worker started: %s', process.pid);
        } else {
            throw new Error('process.send is undefined');
        }
    }

    private onEvents(message: EngineMessageEvents) {
        let { context, events } = message;

        let result = this.process(context, events);

        if (process && process.send) {
            process.send({ type: 'result', ...result });
        }
    }

    private onConfigure(message: EngineMessageConfigure) {
        let cfg = config.Config.parse(message.data);
        this.configure(cfg);
    }

    private resolveCallback(callback: config.Callback): model.Callback | null {
        return this.model.callbacks[callback];
    }

    private runEvent(context: Context, event: Event): number {
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

    private runViewModels(workingCtx: Context) {
        let data = workingCtx.valueOf();
        let api = ModelApiFactory(workingCtx);

        return reduce(this.model.viewModelCallbacks, (vm: any, f: model.ViewModelCallback, base: string) => {
            vm[base] = f(api, data);
            return vm;
        }, {});
    }
}

function loadModels(dir: string): model.Model {
    return requireDir(dir, (m: model.Model, src: any) => {
        m = clone(m);
        src = clone(src);

        if (!m.viewModelCallbacks) m.viewModelCallbacks = {};

        if (src._view) {
            m.viewModelCallbacks.viewModels = src._view;
            delete src._view;
        }

        for (let fname in src) {
            if (fname.startsWith('view_')) {
                m.viewModelCallbacks[fname.substr('view_'.length)] = src[fname];
                delete src[fname];
            }
        }

        m.callbacks = assign({}, m.callbacks, src);

        return m;
    });
}
