import glob = require('glob');
import { merge, clone } from 'lodash'
import * as I from 'immutable'

import * as config from './config'
import * as model from './model'
import { Context } from './context'
import * as dispatcher from './dispatcher'
import { ModelApiFactory } from './model_api'

type IndexedModels = {
    [key: string]: model.ModelInterface
}

export type WorkerMessage = {
    context: any,
    events: dispatcher.Event[]
}

export type WorkerContext = {
    timestamp: number,
    [key: string]: any
}

export class Worker {
    private models: IndexedModels
    private config: config.ConfigInterface
    private dispatcher: dispatcher.DispatcherInterface

    constructor(models: IndexedModels) {
        this.models = models;

        this.processSingle = this.processSingle.bind(this)
    }

    static load(dir: (string | model.ModelInterface[])): Worker {
        if (typeof dir === 'string') {
            dir = loadModels(dir) as model.ModelInterface[];
        }

        let models = indexModels(dir) as IndexedModels;

        return new Worker(models);
    }

    configure(config: config.ConfigInterface): Worker {
        this.config = config;
        this.dispatcher = new dispatcher.Dispatcher()

        config.events.forEach((e) => {
            let callbacks = e.callbacks.map((c) => this.resolveCallback(c))
            this.dispatcher.on(e.name, callbacks);
        });

        return this;
    }

    process(context: WorkerContext, events: dispatcher.Event[]): [WorkerContext, WorkerContext] {
        if (!this.dispatcher) return [context, context];

        let baseCtx = new Context(context, events);

        //
        // run instant effects
        //
        for (let event of baseCtx.iterateEvents()) {
            let prevTimestamp = baseCtx.getTimestamp()
            this.processSingle(baseCtx, event);
            baseCtx.decreaseTimers(prevTimestamp);
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

        //
        // copy timers to base
        //
        let baseCtxValue = baseCtx.valueOf()
        let workingCtxValue = workingCtx.valueOf()
        baseCtxValue.timers = clone(workingCtxValue.timers);

        return [baseCtxValue, workingCtxValue];
    }

    listen() {
        process.on('disconnect', () => {
            console.log('Disconnected');
            process.exit();
        });

        process.on('message', (message: WorkerMessage) => {
            let context = message.context;
            let events: dispatcher.Event[] = message.events;

            let result = this.process(context, events);

            if (process && process.send) {
                process.send(result);
            }
        });

        console.log(`Worker started: ${process.pid}`);
    }

    private resolveCallback(callback: config.Callback | string): model.Callback | null {
        if (typeof callback === 'string') {
            let [modelName, methodName] = callback.split('.');
            callback = { model: modelName, callback: methodName };
        }

        let model = this.models[callback.model]
        return model ? model.resolveCallback(callback.callback) : null;
    }

    private processSingle(context: Context, event: dispatcher.Event): number {
        this.dispatcher.dispatch(event, context);
        return context.setTimestamp(event.timestamp);
    }
}

function loadModels(dir: string): model.ModelInterface[] {
    const extensions = Object.keys(require.extensions).join('|');
    const modelFiles = glob.sync(`${dir}/**/*+(${extensions})`);

    return modelFiles.map((f) => {
        let modelSrc = require(f);

        if (typeof modelSrc == 'function') {
            modelSrc = modelSrc();
        }

        return new model.Model(modelSrc.name, modelSrc.description, [f], modelSrc.callbacks)
    });
}

function indexModels(models: model.ModelInterface[]): IndexedModels {
    let seed: IndexedModels = {};

    return models.reduce((sum, model) => {
        let name = model.name;
        if (!(name in sum)) {
            sum[name] = model;
        } else {
            merge(sum[name], model);
        }
        return sum;
    }, seed);
}
