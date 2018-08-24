import { assign, clone, reduce } from 'lodash';
import * as _ from 'lodash';
import { inspect } from 'util';

import { EngineContext, EngineMessage,
  EngineMessageConfigure, EngineMessageEvents, EngineResult, Event, Modifier } from 'alice-model-engine-api';

import * as config from './config';
import { Context } from './context';
import * as dispatcher from './dispatcher';
import Logger from './logger';
import * as model from './model';
import { ModelApiFactory, PreprocessApiFactory, ViewModelApiFactory } from './model_api';
import { requireDir } from './utils';

declare var TEST_EXTERNAL_OBJECTS: any;

export class Worker {

  public static load(dir: string): Worker {
    const m = loadModels(dir);
    Logger.debug('engine', 'Loaded model', { model: inspect(m, false, null) });
    return new Worker(m);
  }
  private _config: config.ConfigInterface;
  private dispatcher: dispatcher.DispatcherInterface;

  constructor(private _model: model.Model) { }

  public configure(newConfig: config.ConfigInterface): Worker {
    Logger.debug('engine', 'Loaded config', { config: inspect(newConfig, false, null) });
    this._config = newConfig;
    this.dispatcher = new dispatcher.Dispatcher();

    newConfig.events.forEach((e) => {
      const callbacks = e.effects.map((c) => this.resolveCallback(c));
      this.dispatcher.on(e.eventType, callbacks);
    });

    return this;
  }

  public async process(context: EngineContext, events: Event[]): Promise<EngineResult> {
    const baseCtx = new Context(context, events, this._config.dictionaries);
    const characterId = baseCtx.ctx.characterId;

    Logger.info('engine', 'Processing model', { characterId, events });

    try {
      Logger.logStep('engine', 'info', 'Preprocess', { characterId })
        (() => this.runPreprocess(baseCtx, events));
    } catch (e) {
      Logger.error('engine', `Exception ${e.toString()} caught when running preproces`,
        { event, characterId });
      return { status: 'error', error: e };
    }

    if (baseCtx.pendingAquire.length) {
      try {
        await Logger.logAsyncStep('engine', 'info', 'Waiting for aquired objects',
          { pendingAquire: baseCtx.pendingAquire, characterId })
          (() => this.waitAquire(baseCtx));
        Logger.debug('engine', 'Aquired objects',
          { aquired: baseCtx.aquired, characterId });
      } catch (e) {
        Logger.error('engine', `Exception ${e.toString()} caught when aquiring external objects`,
          { characterId });
        return { status: 'error', error: e };
      }
    }

    let workingCtx = baseCtx.clone();

    //
    // main loop
    //
    for (const event of baseCtx.iterateEvents()) {
      baseCtx.decreaseTimers(event.timestamp - baseCtx.timestamp);

      try {
        Logger.logStep('engine', 'info', 'Running event', { event, characterId })
          (() => this.runEvent(baseCtx, event));
      } catch (e) {
        Logger.error('engine', `Exception ${e.toString()} caught when processing event`, { event, characterId });
        return { status: 'error', error: e };
      }

      try {
        workingCtx = Logger.logStep('engine', 'info', 'Running modifiers', { characterId })
          (() => this.runModifiers(baseCtx));
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
      viewModels = Logger.logStep('engine', 'info', 'Running view models', { characterId })
        (() => this.runViewModels(workingCtx, baseCtx));
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
      events: baseCtx.outboundEvents,
    };
  }

  public listen() {
    if (process.send) {
      process.on('disconnect', () => {
        console.log('Disconnected');
        process.exit();
      });

      process.on('message', (message: EngineMessage) => {
        switch (message.type) {
          case 'configure':
            return this.onConfigure(message);

          case 'events':
            return this.onEvents(message);
        }
      });

      process.send({ type: 'ready' });

      Logger.info('engine', 'Worker started');
    } else {
      throw new Error('process.send is undefined');
    }
  }

  private async onEvents(message: EngineMessageEvents) {
    const { context, events } = message;

    const result = await this.process(context, events);

    if (process && process.send) {
      process.send({ type: 'result', ...result });
    }
  }

  private onConfigure(message: EngineMessageConfigure) {
    const cfg = config.Config.parse(message.data);
    this.configure(cfg);
  }

  private resolveCallback(callback: config.Callback): model.Callback | null {
    const result = this._model.callbacks[callback];
    if (result == null) {
      Logger.error('model', `Unable to find handler ${callback}. Make sure it's defined and exported.`, {});
    }
    return result;
  }

  private runEvent(context: Context, event: Event): number {
    this.dispatcher.dispatch(event, context);
    return context.timestamp = event.timestamp;
  }

  private getEnabledModifiers(workingCtx: Context): Modifier[] {
    return workingCtx.modifiers
      .filter((m) => m.enabled)
      .sort((a, b) => {
        if (a.class != '_internal' && b.class == '_internal') return -1;
        if (a.class == '_internal' && b.class != '_internal') return 1;
        return 0;
      });
  }

  private runModifiers(baseCtx: Context): Context {
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

  private runViewModels(workingCtx: Context, baseCtx: Context) {
    const data = workingCtx.valueOf();
    const api = ViewModelApiFactory(workingCtx, baseCtx);

    return reduce(this._model.viewModelCallbacks, (vm: any, f: model.ViewModelCallback, base: string) => {
      vm[base] = f(api, data);
      return vm;
    }, {});
  }

  private runPreprocess(baseCtx: Context, events: Event[]) {
    if (!this._model.preprocessCallbacks.length) return;

    const ctx = baseCtx.clone();
    const api = PreprocessApiFactory(ctx);

    for (const f of this._model.preprocessCallbacks) {
      f(api, events);
    }

    baseCtx.events = ctx.events;
  }

  private async waitAquire(baseCtx: Context) {
    Logger.debug('engine', 'Waitin to aquire',
      { pendingAquire: baseCtx.pendingAquire, characterId: baseCtx.ctx.characterId });

    return new Promise((resolve, reject) => {
      if (process && process.send) {
        process.once('message', (msg: EngineMessage) => {
          if (msg.type == 'aquired') {
            baseCtx.aquired = msg.data;
            resolve();
          } else {
            reject();
          }
        });

        process.send({
          type: 'aquire',
          keys: baseCtx.pendingAquire,
        });
      } else if (TEST_EXTERNAL_OBJECTS) {
        const result = baseCtx.pendingAquire.reduce<any>((aquired, [db, id]) => {
          const obj = _.get(TEST_EXTERNAL_OBJECTS, [db, id]);
          if (obj) _.set(aquired, [db, id], obj);
          return aquired;
        }, {});

        baseCtx.aquired = result;

        resolve();
      } else {
        reject(new Error('Called in wrong context'));
      }
    });

  }
}

function loadModels(dir: string): model.Model {
  return requireDir(dir, (m: model.Model, src: any) => {
    m = clone(m);
    src = clone(src);

    if (!m.viewModelCallbacks) m.viewModelCallbacks = {};
    if (!m.preprocessCallbacks) m.preprocessCallbacks = [];

    if (src._view) {
      m.viewModelCallbacks.default = src._view;
      delete src._view;
    }

    if (src._preprocess) {
      m.preprocessCallbacks.push(src._preprocess);
      delete src._preprocess;
    }

    for (const fname in src) {
      if (fname.startsWith('view_')) {
        m.viewModelCallbacks[fname.substr('view_'.length)] = src[fname];
        delete src[fname];
      }
    }

    m.callbacks = assign({}, m.callbacks, src);

    return m;
  });
}
