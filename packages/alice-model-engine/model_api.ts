import {
  AquiredObjects,
  EffectModelApi,
  EmptyModel,
  Event,
  EventModelApi,
  LogApiInterface,
  Modifier,
  PreprocessApiInterface,
  ViewModelApiInterface,
} from '@alice/interface/models/alice-model-engine';
import * as _ from 'lodash';
import { cloneDeep } from 'lodash';

import { Context } from './context';
import Logger from './logger';
import { EventCallback } from '@alice/interface/callbacks';
import { Duration } from 'moment';
import * as cuid from 'cuid';

class LogApi implements LogApiInterface {
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
}

class EventModelApiImpl<T extends EmptyModel> extends LogApi implements EventModelApi<T> {
  constructor(private context: Context<T>, private currentEvent?: Event) {
    super();
  }

  get workModel() {
    return this.context.workModel;
  }

  get model() {
    return this.context.baseModel;
  }

  set model(m: T) {
    this.context.baseModel = m;
  }

  public getCatalogObject(catalogName: string, id: string) {
    const catalog = this.context.getDictionary(catalogName);
    if (catalog) {
      return cloneDeep(catalog.find((c) => c.id == id));
    }
  }

  public getModifierById(id: string) {
    return this.context.baseModel.modifiers.find((m) => m.mID == id);
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
    return this.context.baseModel.timers.find((it) => it.name == name);
  }

  public addModifier(modifier: Modifier) {
    const m = cloneDeep(modifier);

    if (!m.mID) {
      m.mID = cuid();
    }

    this.context.baseModel.modifiers.push(m);
    return m;
  }

  public aquiredDeprecated(db: string, id: string): AquiredObjects {
    return _.get(this.context, ['aquired', db, id]);
  }

  public aquired<TOtherModel extends EmptyModel>(type: new () => TOtherModel, id: string): TOtherModel {
    return this.context.aquired[type.name][id];
  }

  public removeModifier(mID: string) {
    _.remove(this.context.baseModel.modifiers, (m) => m.mID == mID);
    return this;
  }

  public setTimer<TEventData = any>(
    name: string,
    description: string,
    duration: Duration,
    event: EventCallback<T, TEventData> | string,
    data: TEventData,
  ) {
    if (typeof event != 'string') {
      event = event.name;
    }
    this.context.setTimer(name, description, duration.asMilliseconds(), event, data);
    return this;
  }

  public removeTimer(name: string) {
    this.context.baseModel.timers = this.context.baseModel.timers.filter((it) => it.name != name);
    return this;
  }

  public sendSelfEvent<TEventData = any>(event: EventCallback<T, TEventData> | string, data: TEventData) {
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
    event: string | EventCallback<TModel, TEventData>,
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

  public sendPubSubNotification(topic: string, body: any) {
    this.context.sendPubSubNotification(topic, body);
    return this;
  }

  public setTableResponse(table: any): this {
    this.context.setTableResponse(table);
    return this;
  }

  private getModifiersBy(predicate: (m: Modifier) => boolean) {
    return this.context.baseModel.modifiers.filter(predicate);
  }
}

class EffectModelApiImpl<T extends EmptyModel> extends LogApi implements EffectModelApi<T> {
  constructor(private context: Context<T>) {
    super();
  }

  get model() {
    return this.context.workModel;
  }

  set model(m: T) {
    this.context.workModel = m;
  }

  public getCatalogObject(catalogName: string, id: string) {
    const catalog = this.context.getDictionary(catalogName);
    if (catalog) {
      return cloneDeep(catalog.find((c) => c.id == id));
    }
  }

  public getModifierById(id: string) {
    return this.context.workModel.modifiers.find((m) => m.mID == id);
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
    return this.context.workModel.timers.find((it) => it.name == name);
  }

  public setTimer<TEventData = any>(
    name: string,
    description: string,
    duration: Duration,
    event: EventCallback<T, TEventData> | string,
    data: TEventData,
  ) {
    if (typeof event != 'string') {
      event = event.name;
    }
    this.context.setTimer(name, description, duration.asMilliseconds(), event, data);
    return this;
  }

  public removeTimer(name: string) {
    this.context.workModel.timers = this.context.workModel.timers.filter((it) => it.name != name);
    return this;
  }

  public sendSelfEvent<TEventData = any>(event: EventCallback<T, TEventData> | string, data: TEventData) {
    const timestamp = this.context.timestamp;
    if (typeof event != 'string') {
      event = event.name;
    }
    this.context.sendSelfEvent(event, timestamp, data);
    return this;
  }

  public sendOutboundEvent<TModel extends EmptyModel, TEventData = any>(
    type: new () => TModel,
    modelId: string,
    event: string | EventCallback<TModel, TEventData>,
    data: TEventData,
  ) {
    const timestamp = this.context.timestamp;
    if (typeof event != 'string') {
      event = event.name;
    }
    this.context.sendOutboundEvent(type.name, modelId, event, timestamp, data);
    return this;
  }

  private getModifiersBy(predicate: (m: Modifier) => boolean) {
    return this.context.workModel.modifiers.filter(predicate);
  }
}

class ViewModelApi<T extends EmptyModel> extends LogApi implements ViewModelApiInterface<T> {
  constructor(private context: Context<T>) {
    super();
  }

  get model() {
    return this.context.workModel;
  }

  get baseModel() {
    return this.context.baseModel;
  }
}

class PreprocessApi<T extends EmptyModel> extends LogApi implements PreprocessApiInterface<T> {
  constructor(private context: Context<T>) {
    super();
  }

  get model() {
    return this.context.baseModel;
  }

  public aquire(db: string, id: string) {
    this.context.pendingAquire.push([db, id]);
    return this;
  }
}

export function EffectModelApiFactory<T extends EmptyModel>(context: Context<T>): EffectModelApi<T> {
  return new EffectModelApiImpl(context);
}

export function EventModelApiFactory<T extends EmptyModel>(context: Context<T>, event?: Event): EventModelApi<T> {
  return new EventModelApiImpl(context, event);
}

export function ViewModelApiFactory<T extends EmptyModel>(context: Context<T>): ViewModelApiInterface<T> {
  return new ViewModelApi(context);
}

export function PreprocessApiFactory<T extends EmptyModel>(context: Context<T>): PreprocessApiInterface<T> {
  return new PreprocessApi(context);
}
