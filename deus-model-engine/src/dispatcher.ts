import * as model from './model'

export type Event = {
    handle: string,
    timestamp: number,
    data: any
}

type CallbacksList = model.Callback | null | (model.Callback | null)[]

export interface DispatcherInterface {
    on(handle: string, callbacks: CallbacksList): void
    off(handle: string, callback: model.Callback): void
    dispatch<S>(event: Event, context: S): S
}

export class Dispatcher implements DispatcherInterface {
    private store: {
        [key: string]: model.Callback[]
    }

    constructor() {
        this.store = {};
    }

    on(handle: string, callbacks: CallbacksList) {
        if (!this.store[handle]) this.store[handle] = [];

        if (Array.isArray(callbacks)) {
            callbacks.forEach((f) => {
                if (f) this.store[handle].push(f)
            });
        } else if (callbacks) {
            this.store[handle].push(callbacks);
        }
    }

    off(handle: string, callback: model.Callback) {
        if (!this.store[handle]) return;
        this.store[handle] = this.store[handle].filter((f) => f != callback);
    }

    dispatch<S>(event: Event, context: S) {
        if (!this.store[event.handle]) return context;
        return this.store[event.handle].reduce((s, f) => f(s, event.data), context);
    }
}
