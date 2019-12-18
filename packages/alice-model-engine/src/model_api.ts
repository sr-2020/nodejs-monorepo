import {
  AquiredObjects,
  EmptyModel,
  Event,
  LogApiInterface,
  ModelApiInterface,
  PreprocessApiInterface,
  ReadModelApiInterface,
  ViewModelApiInterface,
  Modifier,
  Effect,
} from 'interface/src/models/alice-model-engine';
import cuid = require('cuid');
import * as _ from 'lodash';
import { cloneDeep } from 'lodash';

import { Context } from './context';
import Logger from './logger';
import { Callback } from '@sr2020/interface/callbacks';

class ReadModelApi<T extends EmptyModel> implements ReadModelApiInterface<T>, LogApiInterface {
  constructor(protected context: Context<T>) {}

  get model() {
    return this.context.model;
  }

  set model(m: T) {
    this.context.model = m;
  }

  public getCatalogObject(catalogName: string, id: string) {
    const catalog = this.context.getDictionary(catalogName);
    if (catalog) {
      return cloneDeep(catalog.find((c) => c.id == id));
    }
  }

  public getModifierById(id: string) {
    return this.context.modifiers.find((m) => m.mID == id);
  }

  public getModifiersByName(name: string) {
    return this.getModifiersBy((m) => m.name == name);
  }

  public getModifiersByClass(className: string) {
    return this.getModifiersBy((m) => m.class == className);
  }

  public getModifiersBySystem(systemName: string) {
    return this.getModifiersBy((m) => m.system == systemName);
  }

  public getTimer(name: string) {
    return this.context.timers[name];
  }

  public debug(msg: string, additionalData?: any) {
    Logger.debug('model', msg, additionalData);
  }

  public info(msg: string, additionalData?: any) {
    Logger.info('model', msg, additionalData);
  }

  public notice(msg: string, additionalData?: any) {
    Logger.notice('model', msg, additionalData);
  }

  public warn(msg: string, additionalData?: any) {
    Logger.warn('model', msg, additionalData);
  }

  public error(msg: string, additionalData?: any) {
    Logger.error('model', msg, additionalData);
  }

  private getModifiersBy(predicate: (m: Modifier) => boolean) {
    return this.context.modifiers.filter(predicate);
  }
}

class ModelApi<T extends EmptyModel> extends ReadModelApi<T> implements ModelApiInterface<T> {
  constructor(context: Context<T>, private currentEvent?: Event) {
    super(context);
  }

  public addModifier(modifier: Modifier) {
    const m = cloneDeep(modifier);

    if (!m.mID) {
      m.mID = cuid();
    }

    this.context.modifiers.push(m);
    return m;
  }

  public aquired(db: string, id: string): AquiredObjects {
    return _.get(this.context, ['aquired', db, id]);
  }

  public removeModifier(mID: string) {
    _.remove(this.context.modifiers, (m) => m.mID == mID);
    return this;
  }

  public setTimer<TEventData = any>(name: string, miliseconds: number, eventType: Callback<T, TEventData> | string, data: TEventData) {
    if (typeof eventType != 'string') {
      eventType = eventType.name;
    }
    this.context.setTimer(name, miliseconds, eventType, data);
    return this;
  }

  public removeTimer(name: string) {
    delete this.context.timers[name];
    return this;
  }

  public sendSelfEvent<TEventData = any>(event: Callback<T, TEventData> | string, data: TEventData) {
    const timestamp = this.currentEvent ? this.currentEvent.timestamp : this.context.timestamp;
    if (typeof event != 'string') {
      event = event.name;
    }
    this.context.sendSelfEvent(event, timestamp, data);
    return this;
  }

  public sendOutboundEvent<TModel extends EmptyModel, TEventData = any>(
    type: new () => TModel,
    modelId: string,
    event: string | Callback<TModel, TEventData>,
    data: TEventData,
  ) {
    const timestamp = this.currentEvent ? this.currentEvent.timestamp : this.context.timestamp;
    if (typeof event != 'string') {
      event = event.name;
    }
    this.context.sendOutboundEvent(type.name, modelId, event, timestamp, data);
    return this;
  }

  public sendNotification(title: string, body: string): this {
    this.context.sendNotification(title, body);
    return this;
  }

  public setTableResponse(table: any): this {
    this.context.setTableResponse(table);
    return this;
  }
}

class ViewModelApi<T extends EmptyModel> extends ReadModelApi<T> implements ViewModelApiInterface<T> {
  constructor(context: Context<T>, protected baseContext: Context<T>) {
    super(context);
  }

  get baseModel() {
    return this.baseContext.model;
  }
}

class PreprocessApi<T extends EmptyModel> extends ReadModelApi<T> implements PreprocessApiInterface<T> {
  public aquire(db: string, id: string) {
    this.context.pendingAquire.push([db, id]);
    return this;
  }
}

export function ModelApiFactory<T extends EmptyModel>(context: Context<T>, event?: Event): ModelApiInterface<T> {
  return new ModelApi(context, event);
}

export function ViewModelApiFactory<T extends EmptyModel>(context: Context<T>, baseContext: Context<T>): ViewModelApiInterface<T> {
  return new ViewModelApi(context, baseContext);
}

export function PreprocessApiFactory<T extends EmptyModel>(context: Context<T>): PreprocessApiInterface<T> {
  return new PreprocessApi(context);
}
