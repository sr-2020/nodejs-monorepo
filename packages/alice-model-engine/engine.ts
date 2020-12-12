import { cloneDeep, reduce } from 'lodash';
import { inspect } from 'util';

import {
  AquiredObjects,
  EmptyModel,
  EngineResult,
  Event,
  Modifier,
  PendingAquire,
  UserVisibleError,
} from '@alice/alice-common/models/alice-model-engine';

import * as config from './config';
import { Context } from './context';
import * as dispatcher from './dispatcher';
import Logger from './logger';
import { EffectModelApiFactory, PreprocessApiFactory, ViewModelApiFactory } from './model_api';
import { EffectCallback, ModelCallbacks, ViewModelCallback } from '@alice/alice-common/callbacks';

export class Engine<T extends EmptyModel> {
  public static readonly bindingKey = 'ModelEngine';

  private dispatcher: dispatcher.DispatcherInterface<T>;

  constructor(private _modelCallbacks: ModelCallbacks<T>, private _config: config.ConfigInterface = { dictionaries: {} }) {
    Logger.debug('engine', 'Loaded config', { config: inspect(_config, false, null) });
    this.dispatcher = new dispatcher.Dispatcher<T>(_modelCallbacks.eventCallbacks);
  }

  public preProcess(model: T, events: Event[]): PendingAquire {
    const context = new Context(model, events, this._config.dictionaries);
    const modelId = context.baseModel.modelId;
    Logger.info('engine', 'Preprocessing model', { modelId, events });
    Logger.logStep('engine', 'info', 'Preprocess', { modelId })(() => this.runPreprocess(context, events));
    return context.pendingAquire;
  }

  public process(model: T, aquired: AquiredObjects, events: Event[]): EngineResult {
    const context = new Context(model, events, this._config.dictionaries);
    context.aquired = aquired;
    const modelId = context.baseModel.modelId;

    //
    // main loop
    //
    for (const event of context.iterateEvents()) {
      try {
        Logger.logStep('engine', 'info', 'Running modifiers', { modelId })(() => this.runModifiers(context));
      } catch (e) {
        if (!(e instanceof UserVisibleError))
          Logger.error('engine', `Exception ${e.toString()} caught when applying modifiers`, { modelId, model: context.baseModel });
        return { status: 'error', error: e };
      }

      try {
        Logger.logStep('engine', 'info', 'Running event', { event, modelId })(() => this.runEvent(context, event));
      } catch (e) {
        if (!(e instanceof UserVisibleError))
          Logger.error('engine', `Exception ${e.toString()} caught when processing event`, { event, modelId });
        return { status: 'error', error: e };
      }

      try {
        Logger.logStep('engine', 'info', 'Running modifiers', { modelId })(() => this.runModifiers(context));
      } catch (e) {
        if (!(e instanceof UserVisibleError))
          Logger.error('engine', `Exception ${e.toString()} caught when applying modifiers`, { modelId, model: context.baseModel });
        return { status: 'error', error: e };
      }
    }

    let viewModels;

    try {
      viewModels = Logger.logStep('engine', 'info', 'Running view models', { modelId })(() => this.runViewModels(context));
    } catch (e) {
      if (!(e instanceof UserVisibleError))
        Logger.error('engine', `Exception caught when running view models: ${e.toString()}`, { modelId });
      return { status: 'error', error: e };
    }

    return {
      status: 'ok',
      baseModel: context.baseModel,
      workingModel: context.workModel,
      viewModels,
      aquired: context.aquired,
      outboundEvents: context.outboundEvents,
      notifications: context.notifications,
      pubSubNotifications: context.pubSubNotifications,
      tableResponse: context.tableResponse,
    };
  }

  private resolveCallback(callback: config.Callback): EffectCallback<T> | null {
    const result = this._modelCallbacks.effectCallbacks[callback];
    if (result == null) {
      Logger.error('model', `Unable to find handler ${callback}. Make sure it's defined and exported.`, {});
    }
    return result;
  }

  private runEvent(context: Context<T>, event: Event) {
    context.advanceTimeBy(event.timestamp - context.timestamp);
    this.dispatcher.dispatch(event, context);
  }

  private getEnabledModifiers(context: Context<T>): Modifier[] {
    return context.workModel.modifiers
      .filter((m) => m.enabled)
      .sort((a, b) => {
        if (a.class != '_internal' && b.class == '_internal') return -1;
        if (a.class == '_internal' && b.class != '_internal') return 1;
        return 0;
      });
  }

  private runModifiers(context: Context<T>) {
    context.workModel = cloneDeep(context.baseModel);
    const modelId = context.baseModel.modelId;
    const api = EffectModelApiFactory(context);

    // First process all functional effects, then all normal ones.
    for (const effectType of ['functional', 'normal']) {
      for (const modifier of this.getEnabledModifiers(context)) {
        const effects = modifier.effects.filter((e) => e.enabled && e.type == effectType);
        for (const effect of effects) {
          const f = this.resolveCallback(effect.handler);
          if (!f) {
            continue;
          }
          Logger.logStep('engine', 'info', `Running ${effect.handler} of modifier ${modifier.mID}`, { modelId })(() => {
            Logger.debug('engine', 'Full effect and modifier data', { effect, modifier, modelId });
            f(api, modifier);
          });
        }
      }
    }
  }

  private runViewModels(context: Context<T>) {
    const data = context.workModel;
    const api = ViewModelApiFactory(context);

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

    const api = PreprocessApiFactory(baseCtx);

    for (const f of this._modelCallbacks.preprocessCallbacks) {
      f(api, events);
    }
  }
}
