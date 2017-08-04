import { clone, assign, reduce } from 'lodash'
import * as _ from 'lodash';
import { inspect } from 'util';

import { Event, EngineContext, EngineMessage, EngineMessageEvents, EngineMessageConfigure, EngineResult } from 'deus-engine-manager-api';

import Logger from './logger';
import { requireDir } from './utils';
import * as config from './config';
import * as model from './model';
import { Context } from './context';
import * as dispatcher from './dispatcher';
import { ModelApiFactory, ViewModelApiFactory, PreprocessApiFactory } from './model_api';

declare var TEST_EXTERNAL_OBJECTS: any;

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
        Logger.debug('engine', 'config loaded: %s', inspect(config));
        this.config = config;
        this.dispatcher = new dispatcher.Dispatcher()

        config.events.forEach((e) => {
            let callbacks = e.effects.map((c) => this.resolveCallback(c))
            this.dispatcher.on(e.eventType, callbacks);
        });

        return this;
    }

    async process(context: EngineContext, events: Event[]): Promise<EngineResult> {
        Logger.info('engine', 'processing model %s', context.characterId, events);

        let baseCtx = new Context(context, events, this.config.dictionaries);

        try {
            Logger.logStep('engine', 'info', 'preprocess')(() => this.runPreprocess(baseCtx, events));
        } catch (e) {
            Logger.error('engine', 'Exception caught when running preproces: %s', event, e.toString());
            return { status: 'error', error: e };
        }

        if (baseCtx.pendingAquire.length) {
            try {
                await Logger.logAsyncStep('engine', 'info', 'wait for aquired objects: %j', baseCtx.pendingAquire)(() => this.waitAquire(baseCtx));
                Logger.debug('engine', 'aquired: %j', baseCtx.aquired);
            } catch (e) {
                Logger.error('engine', 'Exception caught when aquiring external objects: %s', e.toString());
                return { status: 'error', error: e };
            }
        }

        let workingCtx = baseCtx.clone();

        //
        // main loop
        //
        for (let event of baseCtx.iterateEvents()) {
            baseCtx.decreaseTimers(event.timestamp - baseCtx.timestamp);

            try {
                Logger.logStep('engine', 'info', 'run event %s', event.eventType)(() => {
                    Logger.debug('engine', 'event: %s', event.eventType, event);
                    this.runEvent(baseCtx, event);
                });
            } catch (e) {
                Logger.error('engine', 'Exception caught when processing event %s: %s', event.eventType, e.toString(), event);
                return { status: 'error', error: e };
            }

            try {
                workingCtx = Logger.logStep('engine', 'info', 'run modifiers')(() => this.runModifiers(baseCtx));
            } catch (e) {
                Logger.error('engine', 'Exception caught when applying modifiers: %s', e.toString());
                return { status: 'error', error: e };
            }

            baseCtx.timers = workingCtx.timers;
            baseCtx.events = workingCtx.events;
        }

        let baseCtxValue = baseCtx.valueOf()
        let workingCtxValue = workingCtx.valueOf()
        let viewModels;

        try {
            viewModels = Logger.logStep('engine', 'info', 'run view models')(() => this.runViewModels(workingCtx, baseCtx));
        } catch (e) {
            Logger.error('engine', 'Exception caught when running view models: %s', e.toString());
            return { status: 'error', error: e };
        }

        return {
            status: 'ok',
            baseModel: baseCtxValue,
            workingModel: workingCtxValue,
            viewModels,
            aquired: baseCtx.aquired,
            events: baseCtx.outboundEvents
        };
    }

    listen() {
        if (process.send) {
            process.on('disconnect', () => {
                console.log('Disconnected');
                process.exit();
            });

            process.on('message', (message: EngineMessage) => {
                switch (message.type) {
                    case 'configure':
                        return this.onConfigure(message);

                    case 'events':
                        return this.onEvents(message);
                }
            });

            process.send({ type: 'ready' });

            Logger.info('engine', 'Worker started: %s', process.pid);
        } else {
            throw new Error('process.send is undefined');
        }
    }

    private async onEvents(message: EngineMessageEvents) {
        let { context, events } = message;

        let result = await this.process(context, events);

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

        let enabledModifiers = workingCtx.modifiers
            .filter((m) => m.enabled)
            .sort((a, b) => {
                if (a.class != '_internal' && b.class == '_internal') return -1;
                if (a.class == '_internal' && b.class != '_internal') return 1;
                return 0;
            });

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
                Logger.logStep('engine', 'info', 'run effect %s on modifier %s', effect.id, modifier.id)(() => {
                    (f as any)(api, modifier);
                });
            }
        }

        return workingCtx;
    }

    private runViewModels(workingCtx: Context, baseCtx: Context) {
        let data = workingCtx.valueOf();
        let api = ViewModelApiFactory(workingCtx, baseCtx);

        return reduce(this.model.viewModelCallbacks, (vm: any, f: model.ViewModelCallback, base: string) => {
            vm[base] = f(api, data);
            return vm;
        }, {});
    }

    private runPreprocess(baseCtx: Context, events: Event[]) {
        if (!this.model.preprocessCallbacks.length) return;

        const ctx = baseCtx.clone();
        const api = PreprocessApiFactory(ctx);

        for (let f of this.model.preprocessCallbacks) {
            f(api, events);
        }

        baseCtx.events = ctx.events;
    }

    private async waitAquire(baseCtx: Context) {
        Logger.debug('engine', 'waitAquire %j', baseCtx.pendingAquire);

        return new Promise((resolve, reject) => {
            if (process && process.send) {
                process.once('message', (msg: EngineMessage) => {
                    if (msg.type == 'aquired') {
                        baseCtx.aquired = msg.data;
                        resolve();
                    } else {
                        reject();
                    }
                })

                process.send({
                    type: 'aquire',
                    keys: baseCtx.pendingAquire
                })
            } else if (TEST_EXTERNAL_OBJECTS) {
                let result = baseCtx.pendingAquire.reduce<any>((aquired, [db, id]) => {
                    let obj = _.get(TEST_EXTERNAL_OBJECTS, [db, id]);
                    if (obj) _.set(aquired, [db, id], obj);
                    return aquired;
                }, {});

                baseCtx.aquired = result;

                resolve();
            } else {
                reject(new Error('Called in wrong context'));
            }
        });

    }
}

function loadModels(dir: string): model.Model {
    return requireDir(dir, (m: model.Model, src: any) => {
        m = clone(m);
        src = clone(src);

        if (!m.viewModelCallbacks) m.viewModelCallbacks = {};
        if (!m.preprocessCallbacks) m.preprocessCallbacks = [];

        if (src._view) {
            m.viewModelCallbacks.default = src._view;
            delete src._view;
        }

        if (src._preprocess) {
            m.preprocessCallbacks.push(src._preprocess);
            delete src._preprocess;
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
