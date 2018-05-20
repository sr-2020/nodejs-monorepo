import * as model from './model'
import { Context } from './context'
import { ModelApiFactory } from './model_api'
import Logger from './logger';

import { Event } from 'deus-engine-manager-api';

export type CallbacksList = model.Callback | null | (model.Callback | null)[]

export interface DispatcherInterface {
    on(name: string, callbacks: CallbacksList): void
    dispatch(event: Event, context: Context): Context
}

export class Dispatcher implements DispatcherInterface {
    private store: {
        [key: string]: model.Callback[]
    }

    constructor() {
        this.store = {};
    }

    on(name: string, callbacks: CallbacksList) {
        if (!this.store[name]) this.store[name] = [];

        if (Array.isArray(callbacks)) {
            callbacks.forEach((f) => {
                if (f) this.store[name].push(f)
            });
        } else if (callbacks) {
            this.store[name].push(callbacks);
        }
    }

    dispatch(event: Event, context: Context): Context {
        if (!this.store[event.eventType]) {
            Logger.error('model',
                `Unknown event type ${event.eventType}. ` +
                `Make sure there is corresponding eventType --> effects mapping in events DB/file`);
            return context;
        }

        const api = ModelApiFactory(context, event);
        const handlers = this.store[event.eventType];

        handlers.forEach((f) => f(api, event.data, event));

        return context;
    }
}
