import * as _ from 'lodash';
import { inspect } from 'util';

import { EngineContext, EngineMessage, EngineMessageConfigure, EngineMessageEvents, EngineResult, Event } from 'alice-model-engine-api';

import * as config from './config';
import { Context } from './context';
import Logger from './logger';
import { loadModels } from './utils';
import { Engine } from './engine';
import { ModelCallbacks } from './callbacks';

declare var TEST_EXTERNAL_OBJECTS: any;

export class Worker {
  private _engine: Engine;

  public static load(dir: string): Worker {
    const m = loadModels(dir);
    Logger.debug('engine', 'Loaded model', { model: inspect(m, false, null) });
    return new Worker(m);
  }

  constructor(private _modelCallbacks: ModelCallbacks) {}

  public configure(newConfig: config.ConfigInterface): Worker {
    Logger.debug('engine', 'Loaded config', { config: inspect(newConfig, false, null) });
    this._engine = new Engine(this._modelCallbacks, newConfig);
    return this;
  }

  public async process(context: EngineContext, events: Event[]): Promise<EngineResult> {
    const characterId = context.characterId;
    let contextForAquire: Context;
    try {
      contextForAquire = this._engine.preProcess(context, events);
    } catch (e) {
      Logger.error('engine', `Exception ${e.toString()} caught when running preproces`, { events, characterId });
      return { status: 'error', error: e };
    }

    if (contextForAquire.pendingAquire.length) {
      try {
        await Logger.logAsyncStep('engine', 'info', 'Waiting for aquired objects', {
          pendingAquire: contextForAquire.pendingAquire,
          characterId,
        })(() => this.waitAquire(contextForAquire));
        Logger.debug('engine', 'Aquired objects', { aquired: contextForAquire.aquired, characterId });
      } catch (e) {
        Logger.error('engine', `Exception ${e.toString()} caught when aquiring external objects`, { characterId });
        return { status: 'error', error: e };
      }
    }

    return this._engine.process(contextForAquire);
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

  private async waitAquire(baseCtx: Context) {
    Logger.debug('engine', 'Waitin to aquire', { pendingAquire: baseCtx.pendingAquire, characterId: baseCtx.ctx.characterId });

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
