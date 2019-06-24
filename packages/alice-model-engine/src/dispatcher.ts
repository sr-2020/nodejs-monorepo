import { Context } from './context';
import Logger from './logger';
import * as model from './model';
import { ModelApiFactory } from './model_api';

import { Event } from 'alice-model-engine-api';

export type CallbacksList = model.Callback | null | Array<model.Callback | null>;

export interface DispatcherInterface {
  on(name: string, callbacks: CallbacksList): void;
  dispatch(event: Event, context: Context): Context;
}

export class Dispatcher implements DispatcherInterface {
  private store: {
    [key: string]: model.Callback[];
  };

  constructor() {
    this.store = {};
  }

  public on(name: string, callbacks: CallbacksList) {
    if (!this.store[name]) this.store[name] = [];

    if (Array.isArray(callbacks)) {
      callbacks.forEach((f) => {
        if (f) this.store[name].push(f);
      });
    } else if (callbacks) {
      this.store[name].push(callbacks);
    }
  }

  public dispatch(event: Event, context: Context): Context {
    // TODO: Should it be filtered out earlier?
    if (event.eventType.startsWith('_')) return context;

    if (!this.store[event.eventType]) {
      Logger.error(
        'model',
        `Unknown event type ${event.eventType}. ` + `Make sure there is corresponding eventType --> effects mapping in events DB/file`,
      );
      return context;
    }

    const api = ModelApiFactory(context, event);
    const handlers = this.store[event.eventType];

    handlers.forEach((f) => f(api, event.data, event));

    return context;
  }
}
