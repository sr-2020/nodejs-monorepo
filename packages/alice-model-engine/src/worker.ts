import * as _ from 'lodash';
import { inspect } from 'util';

import { AquiredObjects, EngineResult, Event, EmptyModel, PendingAquire } from 'interface/src/models/alice-model-engine';

import * as config from './config';
import Logger from './logger';
import { loadModels } from './utils';
import { Engine } from './engine';
import { ModelCallbacks } from '@sr2020/interface/callbacks';

// eslint-disable-next-line no-var
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
      const aquired: AquiredObjects = pendingAquire.length
        ? await Logger.logAsyncStep('engine', 'info', 'Waiting for aquired objects', {
            pendingAquire,
            modelId,
          })(() => this.waitAquire(pendingAquire))
        : {};
      Logger.debug('engine', 'Aquired objects', { aquired, modelId });
      return this._engine.process(context, aquired, events);
    } catch (e) {
      Logger.error('engine', `Exception ${e.toString()} caught when aquiring external objects`, { modelId });
      return { status: 'error', error: e };
    }
  }

  private async waitAquire(pendingAquire: PendingAquire): Promise<AquiredObjects> {
    Logger.debug('engine', 'Waitin to aquire', { pendingAquire });

    return new Promise((resolve, reject) => {
      if (TEST_EXTERNAL_OBJECTS) {
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
