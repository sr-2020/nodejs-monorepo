import { Context } from './context';
import Logger from './logger';
import { ModelApiFactory } from './model_api';

import { EmptyModel, Event } from 'interface/src/models/alice-model-engine';
import { Callback } from './callbacks';

export type CallbacksList<T extends EmptyModel> = Callback<T> | null | Array<Callback<T> | null>;

export interface DispatcherInterface<T extends EmptyModel> {
  on(name: string, callbacks: CallbacksList<T>): void;
  dispatch(event: Event, context: Context<T>): Context<T>;
}

export class Dispatcher<T extends EmptyModel> implements DispatcherInterface<T> {
  private store: {
    [key: string]: Callback<T>[];
  };

  constructor() {
    this.store = {};
  }

  public on(name: string, callbacks: CallbacksList<T>) {
    if (!this.store[name]) this.store[name] = [];

    if (Array.isArray(callbacks)) {
      callbacks.forEach((f) => {
        if (f) this.store[name].push(f);
      });
    } else if (callbacks) {
      this.store[name].push(callbacks);
    }
  }

  public dispatch(event: Event, context: Context<T>): Context<T> {
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
