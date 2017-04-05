import path = require('path');
import meow = require('meow');
import glob = require('glob');
import { merge } from 'lodash'

import * as config from './config'
import * as model from './model'
import * as dispatcher from './dispatcher'

const cli = meow(`
Usage
$ ${path.basename(__filename)} <path-to-models> -c <path-to-config>
`);

if (!(cli.input.length && cli.flags.c)) {
    cli.showHelp(1);
}

const MODELS_PATH = cli.input[0];
const CONFIG_PATH = cli.flags.c;

const CONFIG = require(CONFIG_PATH);

class Worker {
    private models: model.IndexedModels
    private config: config.ConfigInterface
    private dispatcher: dispatcher.DispatcherInterface

    constructor(models: model.IndexedModels) {
        this.models = models;
    }

    static load(dir: string): Worker {
        let models = indexModels(loadModels(dir));
        return new Worker(models)
    }

    configure(config: config.ConfigInterface): Worker {
        this.config = config;
        this.dispatcher = new dispatcher.Dispatcher()

        config.events.forEach((e) => {
            let callbacks = e.callbacks.map((c) => this.resolveCallback(c))
            this.dispatcher.on(e.handle, callbacks);
        });

        return this;
    }

    process<S>(context: S, events: dispatcher.Event[]): S {
        if (!this.dispatcher) return context;
        events = events.sort((a, b) => a.timestamp - b.timestamp);
        return events.reduce((c, e) => this.dispatcher.dispatch(e, c), context);
    }

    run() {
        process.on('disconnect', () => {
            console.log('Disconnected');
            process.exit();
        });

        process.on('SIGINT', () => {
            // do nothing
        });

        process.on('message', (message: any) => {
            let context = message.context;
            let events: dispatcher.Event[] = message.events;

            let result = this.process(context, events);

            if (process && process.send) {
                process.send(result);
            }
        });

        console.log(`Worker started: ${process.pid}`);
    }

    private resolveCallback(callback: config.Callback): model.Callback | null {
        let model = this.models[callback.model]
        return model ? model.resolveCallback(callback.callback) : null;
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

function indexModels(models: model.ModelInterface[]): model.IndexedModels {
    return models.reduce((sum: any, model) => {
        let name = model.name;
        if (!sum[name]) {
            sum[name] = model;
        } else {
            merge(sum[name], model);
        }
        return sum;
    }, {});
}

let worker = Worker
    .load(MODELS_PATH)
    .configure(config.Config.parse(CONFIG))
    .run()
