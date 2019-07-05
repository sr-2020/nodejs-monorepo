export type LogLevel = 'debug' | 'info' | 'notice' | 'warn' | 'error' | 'crit' | 'alert' | 'emerg';
export type LogSource = 'default' | 'manager' | 'engine' | 'model';
import { model, property } from '@loopback/repository';

// This one doesn't contain timestamp (as server will calculate it) and modelId (server will figure it out from the URL).
@model()
export class EventRequest {
  @property({ required: true })
  eventType: string;

  @property()
  data?: any;
}

// This one doesn't modelId (server can figure it out from model.modelId).
@model()
export class IdLessEvent extends EventRequest {
  @property({ required: true })
  timestamp: number;
}

@model()
export class Event extends IdLessEvent {
  @property({ required: true })
  modelId: string;
}

export interface SyncRequest {
  modelId: string;
  scheduledUpdateTimestamp: number;
}

export interface ModelMetadata {
  scheduledUpdateTimestamp: number;
}

export type Timer = {
  name: string;
  miliseconds: number;
  eventType: string;
  data: any;
};

@model()
export class Effect {
  @property({ required: true })
  enabled: boolean;

  @property({ required: true })
  id: string;

  @property({ required: true })
  class: string;

  // TODO: Improve validation?
  @property({ required: true })
  type: 'normal' | 'functional';

  @property({ required: true })
  handler: string;
}

@model()
export class Modifier {
  @property({ required: true })
  mID: string;

  @property()
  name?: string;

  @property()
  class?: string;

  @property()
  system?: string;

  @property({ required: true })
  enabled: boolean;

  @property.array(Effect, { required: true })
  effects: Effect[];

  [key: string]: any;
}

@model()
export class Condition {
  @property({ required: true })
  id: string;

  @property({ required: true })
  class: string;

  @property({ required: true })
  text: string;

  @property()
  details?: string;

  @property()
  group?: string;

  @property()
  level?: number;
}

export type PendingAquire = Array<[string, string]>;

export interface AquiredObjects {
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
  outboundEvents: Event[];
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

export interface Timers {
  [name: string]: Timer;
}

@model()
export class EmptyModel {
  @property({ required: true })
  modelId: string;

  @property({ required: true })
  timestamp: number;

  @property.array(Modifier, { required: true })
  modifiers: Modifier[];

  @property.array(Condition, { required: true })
  conditions: Condition[];

  @property()
  timers?: Timers;
}

export interface ReadModelApiInterface<T extends EmptyModel> {
  model: T;

  getCatalogObject<O>(catalog: string, id: string): O | undefined;

  getModifierById(id: string): Modifier | undefined;
  getModifiersByName(name: string): Modifier[];
  getModifiersByClass(className: string): Modifier[];
  getModifiersBySystem(systemName: string): Modifier[];

  getEffectsByClass(className: string): Effect[];

  getConditionById(id: string): Condition | undefined;
  getConditionsByClass(className: string): Condition[];
  getConditionsByGroup(group: string): Condition[];

  getTimer(name: string): Timer | undefined;
}

export interface LogApiInterface {
  debug(msg: string, additionalData?: any): void;
  info(msg: string, additionalData?: any): void;
  warn(msg: string, additionalData?: any): void;
  error(msg: string, additionalData?: any): void;
}

export interface WriteModelApiInterface {
  // If modifier.mID is not present, will generate new unique one.
  // Returns added modifier.
  addModifier(modifier: Modifier): Modifier;
  // Will do nothing if no modifier with such mID is present.
  removeModifier(mID: string): this;

  // If condition with same id is present, will do nothing
  // and return existing condition.
  // If condition.mID is not present, will generate new unique one.
  // Returns added condition.
  addCondition(condition: Condition): Condition;
  // Will do nothing if no condition with such id is present.
  removeCondition(id: string): this;

  // Schedules delayed event for current character.
  // name should be unique - in other case new timer will override existing one.
  setTimer(name: string, miliseconds: number, eventType: string, data: any): this;
  // Cancels existing timer.
  // NB: timer must exist!
  removeTimer(name: string): this;

  // Adds event to events queue of modelId. If modelId is null,
  // event is send to currently processed model. Timestamp of event
  // is "now", i.e. equals to timestamp of event currently being processed.
  sendEvent(modelId: string | null, event: string, data: any): this;
}

export interface PreprocessApiInterface<T extends EmptyModel> extends ReadModelApiInterface<T>, LogApiInterface {
  aquire(db: string, id: string): this;
}

export interface ViewModelApiInterface<T extends EmptyModel> extends ReadModelApiInterface<T>, LogApiInterface {
  baseModel: T;
}

export interface ModelApiInterface<T extends EmptyModel> extends ReadModelApiInterface<T>, WriteModelApiInterface, LogApiInterface {
  aquired(db: string, id: string): any;
}
