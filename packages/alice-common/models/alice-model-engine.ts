import { IsArray, IsBoolean, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Duration } from 'moment';
import { PubSubNotification, PushNotification } from './push-notification.model';
import { EventCallback } from '../callbacks';
import { Column, PrimaryColumn, ValueTransformer } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export type LogLevel = 'debug' | 'info' | 'notice' | 'warn' | 'error' | 'crit' | 'alert' | 'emerg';
export type LogSource = 'default' | 'manager' | 'engine' | 'model';

class JsonToTextTransformer implements ValueTransformer {
  to = (v: any) => JSON.stringify(v);
  from = (v: any) => JSON.parse(v);
}

export class BigIntTransformer implements ValueTransformer {
  to = (v: number) => v.toString();
  from = (v: string) => Number(v);
}

export function JsonColumn() {
  if (process.env.NODE_ENV == 'test') {
    return Column({ type: 'text', transformer: new JsonToTextTransformer() });
  } else {
    return Column({ type: 'json', default: [] });
  }
}

export function JsonNullableColumn() {
  if (process.env.NODE_ENV == 'test') {
    return Column({ type: 'text', transformer: new JsonToTextTransformer(), nullable: true });
  } else {
    return Column({ type: 'json', default: null, nullable: true });
  }
}

export function StringProperty(options: { optional: boolean } = { optional: false }) {
  return (target: unknown, name: string) => {
    ApiProperty({ required: !options.optional })(target, name);
    IsString()(target, name);
    if (options.optional) {
      IsOptional()(target, name);
    }
  };
}

export function BoolProperty(options: { optional: boolean } = { optional: false }) {
  return (target: unknown, name: string) => {
    ApiProperty({ required: !options.optional })(target, name);
    IsBoolean()(target, name);
    if (options.optional) {
      IsOptional()(target, name);
    }
  };
}

export function NumberProperty(options: { optional: boolean } = { optional: false }) {
  return (target: unknown, name: string) => {
    ApiProperty({ required: !options.optional })(target, name);
    IsNumber()(target, name);
    if (options.optional) {
      IsOptional()(target, name);
    }
  };
}

export function ArrayProperty<T extends unknown>(itemType: new () => T, options: { optional: boolean } = { optional: false }) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (target: object, name: string) => {
    ApiProperty({ type: itemType, isArray: true, required: !options.optional })(target, name);
    IsArray()(target, name);
    if (itemType.name == 'String') {
      IsString({ each: true });
    } else {
      ValidateNested({ each: true })(target, name);
      Type(() => itemType)(target, name);
    }
    if (options.optional) {
      IsOptional()(target, name);
    }
  };
}

export function ObjectProperty<T extends unknown>(itemType: new () => T, options: { optional: boolean } = { optional: false }) {
  return (target: unknown, name: string) => {
    ApiProperty({ required: !options.optional })(target, name);
    IsObject()(target, name);
    ValidateNested()(target, name);
    Type(() => itemType)(target, name);
    if (options.optional) {
      IsOptional()(target, name);
    }
  };
}

// This one doesn't contain timestamp (as server will calculate it) and modelId (server will figure it out from the URL).
export class EventRequest {
  @StringProperty()
  eventType: string;

  @ObjectProperty(Object, { optional: true })
  data?: any;
}

// This one doesn't modelId (server can figure it out from model.modelId).
export class IdLessEvent extends EventRequest {
  @NumberProperty()
  timestamp: number;
}

export class Event extends IdLessEvent {
  @StringProperty()
  modelId: string;
}

export class EventForModelType extends Event {
  @StringProperty()
  modelType: string;
}

export interface SyncRequest {
  modelId: string;
  scheduledUpdateTimestamp: number;
}

export interface ModelMetadata {
  scheduledUpdateTimestamp: number;
}

export class Timer {
  @StringProperty() name: string;
  @NumberProperty() miliseconds: number;
  @StringProperty() eventType: string;
  @StringProperty() description: string;
  @ObjectProperty(Object) data: any;
}

export class Effect {
  // Unique id of this effect "kind" (not of specific effect instance).
  // Doesn't really used by the scripts code, typical usage is to get effect
  // by id from some external static data storage (e.g. DB containing all existing effects.
  // If Effect is created from the code, can be skipped altogether.
  @StringProperty({ optional: true })
  id?: string;

  // If set to false, Effect won't be applied. Can be useful to temporarily disable something
  // without removing the whole Effect.
  @BoolProperty()
  enabled: boolean;

  // 'Functional' effects can change enabled/disabed state of 'normal' effects.
  // In particular, all functional effects are applied before normal ones.
  // If your effect doesn't change enabled/disabled state - make it normal.
  @StringProperty()
  type: 'normal' | 'functional';

  // Name of TypeScript/JavaScript function which will be called to apply this Effect.
  // If set from the code, consider passing foo.name instead of "foo" so you will get compilation failure
  // if handler function is removed, but there is an effect referencing it.
  @StringProperty()
  handler: string;
}

export class Modifier {
  @StringProperty()
  mID: string;

  @StringProperty({ optional: true })
  name?: string;

  @StringProperty({ optional: true })
  class?: string;

  @StringProperty({ optional: true })
  system?: string;

  @BoolProperty()
  enabled: boolean;

  @ArrayProperty(Effect)
  effects: Effect[];

  @NumberProperty()
  priority: number;

  static kPriorityEarliest = 5;
  static kDefaultPriority = 5;

  [key: string]: any;
}

export class Condition {
  @StringProperty()
  id: string;

  @StringProperty()
  class: string;

  @StringProperty()
  text: string;

  @StringProperty({ optional: true })
  details?: string;

  @StringProperty({ optional: true })
  group?: string;

  @NumberProperty({ optional: true })
  level?: number;
}
export type PendingAquire = Array<[string, string]>;

export class AquiredObjects {
  [db: string]: {
    [id: string]: any;
  };
}

export type EngineMessageEvents = {
  type: 'events';
  context: any;
  events: Event[];
};

export type EngineMessageConfigure = {
  type: 'configure';
  data: any;
};

export type EngineMessageAquired = {
  type: 'aquired';
  data: AquiredObjects;
};

export type EngineMessage = EngineMessageEvents | EngineMessageConfigure | EngineMessageAquired;

export type EngineResultOk = {
  status: 'ok';
  baseModel: any;
  workingModel: any;
  viewModels: { [base: string]: any };
  aquired: AquiredObjects;
  outboundEvents: EventForModelType[];
  notifications: PushNotification[];
  pubSubNotifications: PubSubNotification[];
  tableResponse: any;
};

export type EngineResultError = {
  status: 'error';
  error: any;
};

export type EngineResult = EngineResultOk | EngineResultError;

export type EngineReplyResult = EngineResult & { type: 'result' };

export type EngineReplyLog = {
  type: 'log';
  source: string;
  level: LogLevel;
  msg: string;
  params: any[];
};

export type EngineReplyAquire = {
  type: 'aquire';
  keys: [string, string][];
};

export type EngineReplyReady = {
  type: 'ready';
};

export type EngineReply = EngineReplyReady | EngineReplyResult | EngineReplyLog | EngineReplyAquire;

export class EmptyModel {
  @StringProperty()
  @PrimaryColumn()
  modelId: string;

  @NumberProperty()
  @Column({ type: 'bigint', transformer: new BigIntTransformer() })
  timestamp: number;

  @ArrayProperty(Modifier)
  @JsonColumn()
  modifiers: Modifier[];

  @ArrayProperty(Timer)
  @JsonColumn()
  timers: Timer[];
}

export interface LogApiInterface {
  debug(msg: string, additionalData?: any): void;
  info(msg: string, additionalData?: any): void;
  warn(msg: string, additionalData?: any): void;
  error(msg: string, additionalData?: any): void;
}

export interface PreprocessApiInterface<T extends EmptyModel> extends LogApiInterface {
  readonly model: T;
  aquire(db: string, id: string): this;
}

export interface ViewModelApiInterface<T extends EmptyModel> extends LogApiInterface {
  readonly model: T;
  readonly baseModel: T;
}

export interface EventModelApi<T extends EmptyModel> extends LogApiInterface {
  model: T;
  readonly workModel: T;

  getCatalogObject<O>(catalog: string, id: string): O | undefined;

  getModifierById(id: string): Modifier | undefined;
  getModifiersByName(name: string): Modifier[];
  getModifiersByClass(className: string): Modifier[];
  getModifiersBySystem(systemName: string): Modifier[];

  getTimer(name: string): Timer | undefined;

  aquired<TOtherModel extends EmptyModel>(type: new () => TOtherModel, id: string): TOtherModel;
  aquiredDeprecated(db: string, id: string): any;

  // If modifier.mID is not present, will generate new unique one.
  // Returns added modifier.
  addModifier(modifier: Modifier): Modifier;
  // Will do nothing if no modifier with such mID is present.
  removeModifier(mID: string): this;

  // Schedules delayed event for current character.
  // name should be unique - in other case new timer will override existing one.
  setTimer<TEventData = any>(
    name: string,
    description: string,
    duration: Duration,
    event: EventCallback<T, TEventData> | string,
    data: TEventData,
  ): this;
  // Cancels existing timer.
  // NB: timer must exist!
  removeTimer(name: string): this;

  // Schedules and event for currently processed model. Timestamp of event
  // is "now", i.e. equals to timestamp of event currently being processed.
  sendSelfEvent<TEventData = any>(event: EventCallback<T, TEventData> | string, data: TEventData): this;

  // Adds event to events queue of modelId of type TModel. Timestamp of event
  // is "now", i.e. equals to timestamp of event currently being processed.
  // 'event' parameter can be either event handler function (in that case 'data' will be type-checked),
  // or the name of the event handler function (no type-checking then).
  sendOutboundEvent<TOtherModel extends EmptyModel, TEventData = any>(
    type: new () => TOtherModel,
    modelId: string,
    event: EventCallback<TOtherModel, TEventData> | string,
    data: TEventData,
  ): this;

  // Schedules sending of notification to the user "responsible" for model being processed.
  // If model being processed is not a "user" one, notification won't be sent.
  sendNotification(title: string, body: string): this;

  // Schedules sending of PubSub notification.
  sendPubSubNotification(topic: string, body: any): this;

  // Quick hack to be able to send some table data to the user
  // Needs some reconsideration
  setTableResponse(table: any): this;
}

export interface EffectModelApi<T extends EmptyModel> extends LogApiInterface {
  model: T;

  getCatalogObject<O>(catalog: string, id: string): O | undefined;

  getModifierById(id: string): Modifier | undefined;
  getModifiersByName(name: string): Modifier[];
  getModifiersByClass(className: string): Modifier[];
  getModifiersBySystem(systemName: string): Modifier[];

  getTimer(name: string): Timer | undefined;

  // Schedules delayed event for current character.
  // name should be unique - in other case new timer will override existing one.
  setTimer<TEventData = any>(
    name: string,
    description: string,
    duration: Duration,
    eventType: EventCallback<T, TEventData> | string,
    data: TEventData,
  ): this;
  // Cancels existing timer.
  // NB: timer must exist!
  removeTimer(name: string): this;

  // Schedules and event for currently processed model. Timestamp of event
  // is "now", i.e. equals to timestamp of event currently being processed.
  sendSelfEvent<TEventData = any>(event: EventCallback<T, TEventData> | string, data: TEventData): this;
}

export class UserVisibleError extends Error {}
