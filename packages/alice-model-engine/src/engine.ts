import { reduce } from 'lodash';
import { inspect } from 'util';

import { EmptyModel, EngineResult, Event, Modifier } from 'alice-model-engine-api';

import * as config from './config';
import { Context } from './context';
import * as dispatcher from './dispatcher';
import Logger from './logger';
import { ModelApiFactory, PreprocessApiFactory, ViewModelApiFactory } from './model_api';
import { ModelCallbacks, Callback, ViewModelCallback } from './callbacks';

export class Engine<T extends EmptyModel> {
  private dispatcher: dispatcher.DispatcherInterface<T> = new dispatcher.Dispatcher<T>();

  constructor(private _model: ModelCallbacks<T>, private _config: config.ConfigInterface) {
    Logger.debug('engine', 'Loaded config', { config: inspect(_config, false, null) });
    _config.events.forEach((e) => {
      const callbacks = e.effects.map((c) => this.resolveCallback(c));
      this.dispatcher.on(e.eventType, callbacks);
    });
  }

  public preProcess(context: T, events: Event[]): Context<T> {
    const baseCtx = new Context(context, events, this._config.dictionaries);
    const characterId = baseCtx.ctx.characterId;
    Logger.info('engine', 'Preprocessing model', { characterId, events });
    Logger.logStep('engine', 'info', 'Preprocess', { characterId })(() => this.runPreprocess(baseCtx, events));
    return baseCtx;
  }

  public process(baseCtx: Context<T>): EngineResult {
    const characterId = baseCtx.ctx.characterId;

    let workingCtx = baseCtx.clone();

    //
    // main loop
    //
    for (const event of baseCtx.iterateEvents()) {
      baseCtx.decreaseTimers(event.timestamp - baseCtx.timestamp);

      try {
        Logger.logStep('engine', 'info', 'Running event', { event, characterId })(() => this.runEvent(baseCtx, event));
      } catch (e) {
        Logger.error('engine', `Exception ${e.toString()} caught when processing event`, { event, characterId });
        return { status: 'error', error: e };
      }

      try {
        workingCtx = Logger.logStep('engine', 'info', 'Running modifiers', { characterId })(() => this.runModifiers(baseCtx));
      } catch (e) {
        Logger.error('engine', `Exception ${e.toString()} caught when applying modifiers`, { characterId });
        return { status: 'error', error: e };
      }

      baseCtx.timers = workingCtx.timers;
      baseCtx.events = workingCtx.events;
    }

    const baseCtxValue = baseCtx.valueOf();
    const workingCtxValue = workingCtx.valueOf();
    let viewModels;

    try {
      viewModels = Logger.logStep('engine', 'info', 'Running view models', { characterId })(() => this.runViewModels(workingCtx, baseCtx));
    } catch (e) {
      Logger.error('engine', `Exception caught when running view models: ${e.toString()}`, { characterId });
      return { status: 'error', error: e };
    }

    return {
      status: 'ok',
      baseModel: baseCtxValue,
      workingModel: workingCtxValue,
      viewModels,
      aquired: baseCtx.aquired,
      outboundEvents: baseCtx.outboundEvents,
    };
  }

  private resolveCallback(callback: config.Callback): Callback<T> | null {
    const result = this._model.callbacks[callback];
    if (result == null) {
      Logger.error('model', `Unable to find handler ${callback}. Make sure it's defined and exported.`, {});
    }
    return result;
  }

  private runEvent(context: Context<T>, event: Event): number {
    this.dispatcher.dispatch(event, context);
    return (context.timestamp = event.timestamp);
  }

  private getEnabledModifiers(workingCtx: Context<T>): Modifier[] {
    return workingCtx.modifiers
      .filter((m) => m.enabled)
      .sort((a, b) => {
        if (a.class != '_internal' && b.class == '_internal') return -1;
        if (a.class == '_internal' && b.class != '_internal') return 1;
        return 0;
      });
  }

  private runModifiers(baseCtx: Context<T>): Context<T> {
    const workingCtx = baseCtx.clone();
    const characterId = workingCtx.ctx.characterId;
    const api = ModelApiFactory(workingCtx);

    // First process all functional events, then all normal ones.
    for (const effectType of ['functional', 'normal']) {
      for (const modifier of this.getEnabledModifiers(workingCtx)) {
        const effects = modifier.effects.filter((e) => e.enabled && e.type == effectType);
        for (const effect of effects) {
          const f = this.resolveCallback(effect.handler);
          if (!f) {
            continue;
          }
          Logger.logStep('engine', 'info', `Running ${effect.id} of modifier ${modifier.mID}`, { characterId })(() => {
            Logger.debug('engine', 'Full effect and modifier data', { effect, modifier, characterId });
            (f as any)(api, modifier);
          });
        }
      }
    }

    return workingCtx;
  }

  private runViewModels(workingCtx: Context<T>, baseCtx: Context<T>) {
    const data = workingCtx.valueOf();
    const api = ViewModelApiFactory(workingCtx, baseCtx);

    return reduce(
      this._model.viewModelCallbacks,
      (vm: any, f: ViewModelCallback<T>, base: string) => {
        vm[base] = f(api, data);
        return vm;
      },
      {},
    );
  }

  private runPreprocess(baseCtx: Context<T>, events: Event[]) {
    if (!this._model.preprocessCallbacks.length) return;

    const ctx = baseCtx.clone();
    const api = PreprocessApiFactory(ctx);

    for (const f of this._model.preprocessCallbacks) {
      f(api, events);
    }

    baseCtx.events = ctx.events;
  }
}
