import * as _ from 'lodash';
import { inspect } from 'util';

import { EngineMessage, EngineMessageConfigure, EngineMessageEvents, EngineResult, Event, EmptyModel } from 'alice-model-engine-api';

import * as config from './config';
import { PendingAquire, AquiredObjects } from './context';
import Logger from './logger';
import { loadModels } from './utils';
import { Engine } from './engine';
import { ModelCallbacks } from './callbacks';

declare var TEST_EXTERNAL_OBJECTS: any;

export class Worker {
  private _engine: Engine<EmptyModel>;

  public static load(dir: string): Worker {
    const m = loadModels(dir);
    Logger.debug('engine', 'Loaded model', { model: inspect(m, false, null) });
    return new Worker(m);
  }

  constructor(private _modelCallbacks: ModelCallbacks<EmptyModel>) {}

  public configure(newConfig: config.ConfigInterface): Worker {
    Logger.debug('engine', 'Loaded config', { config: inspect(newConfig, false, null) });
    this._engine = new Engine(this._modelCallbacks, newConfig);
    return this;
  }

  public async process(context: EmptyModel, events: Event[]): Promise<EngineResult> {
    const modelId = context.modelId;
    let pendingAquire: PendingAquire;
    try {
      pendingAquire = this._engine.preProcess(context, events);
    } catch (e) {
      Logger.error('engine', `Exception ${e.toString()} caught when running preproces`, { events, modelId });
      return { status: 'error', error: e };
    }

    try {
      const aquired = pendingAquire.length
        ? await Logger.logAsyncStep('engine', 'info', 'Waiting for aquired objects', {
            pendingAquire,
            modelId,
          })(() => this.waitAquire(pendingAquire))
        : undefined;
      Logger.debug('engine', 'Aquired objects', { aquired, modelId });
      return this._engine.process(context, aquired, events);
    } catch (e) {
      Logger.error('engine', `Exception ${e.toString()} caught when aquiring external objects`, { modelId });
      return { status: 'error', error: e };
    }
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

  private async waitAquire(pendingAquire: PendingAquire): Promise<AquiredObjects> {
    Logger.debug('engine', 'Waitin to aquire', { pendingAquire });

    return new Promise((resolve, reject) => {
      if (process && process.send) {
        process.once('message', (msg: EngineMessage) => {
          if (msg.type == 'aquired') {
            resolve(msg.data);
          } else {
            reject();
          }
        });

        process.send({
          type: 'aquire',
          keys: pendingAquire,
        });
      } else if (TEST_EXTERNAL_OBJECTS) {
        const result = pendingAquire.reduce<any>((aquired, [db, id]) => {
          const obj = _.get(TEST_EXTERNAL_OBJECTS, [db, id]);
          if (obj) _.set(aquired, [db, id], obj);
          return aquired;
        }, {});

        resolve(result);
      } else {
        reject(new Error('Called in wrong context'));
      }
    });
  }
}
