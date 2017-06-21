import * as model from './model'
import { Context } from './context'
import { ModelApiFactory } from './model_api'

export type Event = {
    eventType: string,
    timestamp: number,
    data: any
}

type CallbacksList = model.Callback | null | (model.Callback | null)[]

export interface DispatcherInterface {
    on(name: string, callbacks: CallbacksList): void
    off(name: string, callback: model.Callback): void
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

    off(handle: string, callback: model.Callback) {
        if (!this.store[handle]) return;
        this.store[handle] = this.store[handle].filter((f) => f != callback);
    }

    dispatch(event: Event, context: Context): Context {
        if (!this.store[event.eventType]) return context;

        const api = ModelApiFactory(context);
        const handlers = this.store[event.eventType];

        handlers.forEach((f) => f(api, event.data));

        return context;
    }
}
