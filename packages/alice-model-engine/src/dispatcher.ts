import { Context } from './context';
import Logger from './logger';
import { ModelApiFactory } from './model_api';

import { EmptyModel, Event } from 'interface/src/models/alice-model-engine';
import { Callback } from './callbacks';

export type CallbacksList<T extends EmptyModel> = Callback<T> | null | Array<Callback<T> | null>;

export interface DispatcherInterface<T extends EmptyModel> {
  dispatch(event: Event, context: Context<T>): Context<T>;
}

export class Dispatcher<T extends EmptyModel> implements DispatcherInterface<T> {
  constructor(private callbacks: { [key: string]: Callback<T> }) {}

  public dispatch(event: Event, context: Context<T>): Context<T> {
    if (event.eventType.startsWith('_')) return context;

    const handler =
      this.callbacks[event.eventType] ||
      this.callbacks[this.kebabCaseToCamelCase(event.eventType)] ||
      this.callbacks[this.kebabCaseToCamelCase(event.eventType) + 'Event'];

    if (!handler) {
      Logger.error(
        'model',
        `Unknown event type ${event.eventType}. ` +
          `Make sure there corresponding handler function is defined. ` +
          `Handler should have one of the following names: ` +
          `[${event.eventType}, ${this.kebabCaseToCamelCase(event.eventType)}, ${this.kebabCaseToCamelCase(event.eventType) + 'Event'}]`,
      );
      return context;
    }

    const api = ModelApiFactory(context, event);
    handler(api, event.data, event);

    return context;
  }

  private kebabCaseToCamelCase(s: string): string {
    return s
      .split('-')
      .map((word, i) => (i > 0 ? word[0].toUpperCase() + word.slice(1) : word))
      .join('');
  }
}
