import { reduce } from 'lodash';
import { inspect } from 'util';

import {
  AquiredObjects,
  EmptyModel,
  EngineResult,
  Event,
  Modifier,
  PendingAquire,
  UserVisibleError,
} from 'interface/src/models/alice-model-engine';

import * as config from './config';
import { Context } from './context';
import * as dispatcher from './dispatcher';
import Logger from './logger';
import { ModelApiFactory, PreprocessApiFactory, ViewModelApiFactory } from './model_api';
import { ModelCallbacks, Callback, ViewModelCallback } from '@sr2020/interface/callbacks';

export class Engine<T extends EmptyModel> {
  public static readonly bindingKey = 'ModelEngine';

  private dispatcher: dispatcher.DispatcherInterface<T>;

  constructor(private _modelCallbacks: ModelCallbacks<T>, private _config: config.ConfigInterface = { dictionaries: {} }) {
    Logger.debug('engine', 'Loaded config', { config: inspect(_config, false, null) });
    this.dispatcher = new dispatcher.Dispatcher<T>(_modelCallbacks.callbacks);
  }

  public preProcess(model: T, events: Event[]): PendingAquire {
    const baseCtx = new Context(model, events, this._config.dictionaries);
    const modelId = baseCtx.model.modelId;
    Logger.info('engine', 'Preprocessing model', { modelId, events });
    Logger.logStep('engine', 'info', 'Preprocess', { modelId })(() => this.runPreprocess(baseCtx, events));
    return baseCtx.pendingAquire;
  }

  public process(model: T, aquired: AquiredObjects, events: Event[]): EngineResult {
    const baseCtx = new Context(model, events, this._config.dictionaries);
    baseCtx.aquired = aquired;
    const modelId = baseCtx.model.modelId;

    let workingCtx = baseCtx.clone();

    //
    // main loop
    //
    for (const event of baseCtx.iterateEvents()) {
      baseCtx.decreaseTimers(event.timestamp - baseCtx.timestamp);

      try {
        Logger.logStep('engine', 'info', 'Running event', { event, modelId })(() => this.runEvent(baseCtx, event));
      } catch (e) {
        if (!(e instanceof UserVisibleError))
          Logger.error('engine', `Exception ${e.toString()} caught when processing event`, { event, modelId });
        return { status: 'error', error: e };
      }

      try {
        workingCtx = Logger.logStep('engine', 'info', 'Running modifiers', { modelId })(() => this.runModifiers(baseCtx));
      } catch (e) {
        if (!(e instanceof UserVisibleError))
          Logger.error('engine', `Exception ${e.toString()} caught when applying modifiers`, { modelId, model: baseCtx.model });
        return { status: 'error', error: e };
      }

      baseCtx.timers = workingCtx.timers;
      baseCtx.events = workingCtx.events;
    }

    const baseCtxValue = baseCtx.valueOf();
    const workingCtxValue = workingCtx.valueOf();
    let viewModels;

    try {
      viewModels = Logger.logStep('engine', 'info', 'Running view models', { modelId })(() => this.runViewModels(workingCtx, baseCtx));
    } catch (e) {
      if (!(e instanceof UserVisibleError))
        Logger.error('engine', `Exception caught when running view models: ${e.toString()}`, { modelId });
      return { status: 'error', error: e };
    }

    return {
      status: 'ok',
      baseModel: baseCtxValue,
      workingModel: workingCtxValue,
      viewModels,
      aquired: baseCtx.aquired,
      outboundEvents: baseCtx.outboundEvents,
      notifications: baseCtx.notifications,
    };
  }

  private resolveCallback(callback: config.Callback): Callback<T> | null {
    const result = this._modelCallbacks.callbacks[callback];
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
    const modelId = workingCtx.model.modelId;
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
          Logger.logStep('engine', 'info', `Running ${effect.handler} of modifier ${modifier.mID}`, { modelId })(() => {
            Logger.debug('engine', 'Full effect and modifier data', { effect, modifier, modelId });
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
      this._modelCallbacks.viewModelCallbacks,
      (vm: any, f: ViewModelCallback<T>, base: string) => {
        vm[base] = f(api, data);
        return vm;
      },
      {},
    );
  }

  private runPreprocess(baseCtx: Context<T>, events: Event[]) {
    if (!this._modelCallbacks.preprocessCallbacks.length) return;

    const ctx = baseCtx.clone();
    const api = PreprocessApiFactory(ctx);

    for (const f of this._modelCallbacks.preprocessCallbacks) {
      f(api, events);
    }

    baseCtx.events = ctx.events;
  }
}
