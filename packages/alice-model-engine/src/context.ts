import * as _ from 'lodash';
import { cloneDeep } from 'lodash';

import {
  AquiredObjects,
  Condition,
  EmptyModel,
  Event,
  Modifier,
  PendingAquire,
  Timer,
  Timers,
} from 'interface/src/models/alice-model-engine';

export type FieldName = string | string[];
export type FieldValue = any;
export type Timestamp = number;

export interface Dictionaries {
  [catalog: string]: any[];
}

interface EventForModelType extends Event {
  modelType: string;
}

export class OutboundEvents {
  private events: EventForModelType[] = [];

  public push(e: EventForModelType) {
    this.events.push(e);
  }

  public valueOf() {
    return cloneDeep(this.events);
  }
}

export class Context<T extends EmptyModel> {
  private _model: T;
  private _events: Event[];
  private _dictionaries: Dictionaries = {};
  private _outboundEvents: OutboundEvents;
  private _pendingAquire: PendingAquire;
  private _aquired: AquiredObjects;

  constructor(
    model: T,
    events: Event[],
    dictionaries?: any,
    outboundEvents?: OutboundEvents,
    pendingAquire?: PendingAquire,
    aquired?: AquiredObjects,
  ) {
    this._model = cloneDeep(model);

    this._events = cloneDeep(events);
    this.sortEvents();

    if (dictionaries) {
      this._dictionaries = cloneDeep(dictionaries);
    }

    this._outboundEvents = outboundEvents || new OutboundEvents();
    this._pendingAquire = pendingAquire || [];
    this._aquired = aquired || {};
  }

  get events() {
    return this._events;
  }

  set events(value: Event[]) {
    this._events = cloneDeep(value);
    this.sortEvents();
  }

  get model() {
    return this._model;
  }

  get timers(): Timers {
    return _.get(this._model, 'timers', {});
  }

  set timers(value: Timers) {
    this._model.timers = cloneDeep(value);
  }

  get timestamp() {
    return this._model.timestamp;
  }

  set timestamp(value: number) {
    this._model.timestamp = value;
  }

  get modifiers(): Modifier[] {
    return this._model.modifiers;
  }

  get effects() {
    const enabledModifiers = this.modifiers.filter((m) => m.enabled);
    return _.flatMap(enabledModifiers, (c) => c.effects);
  }

  get conditions(): Condition[] {
    return this._model.conditions;
  }

  get outboundEvents(): Event[] {
    return this._outboundEvents.valueOf();
  }

  get aquired(): AquiredObjects {
    return this._aquired;
  }

  set aquired(value: AquiredObjects) {
    this._aquired = value;
  }

  get pendingAquire(): PendingAquire {
    return this._pendingAquire;
  }

  public clone(): Context<T> {
    const clone = new Context(this._model, this._events, this._dictionaries, this._outboundEvents, this._pendingAquire, this._aquired);
    clone.timers = this.timers;
    return clone;
  }

  public getDictionary(name: FieldName): any[] | undefined {
    return _.get(this._dictionaries, name, undefined);
  }

  public setTimer(name: string, miliseconds: number, eventType: string, data: any): this {
    const timer = {
      name,
      miliseconds,
      eventType,
      data,
    };
    if (!this._model.timers) this._model.timers = {};
    this._model.timers[timer.name] = timer;
    return this;
  }

  public sendSelfEvent(eventType: string, timestamp: number, data: any) {
    this._events.unshift({
      modelId: this._model.modelId,
      eventType,
      timestamp: timestamp,
      data,
    });
  }

  public sendOutboundEvent(modelType: string, modelId: string, eventType: string, timestamp: number, data: any) {
    this._outboundEvents.push({
      modelType: modelType!!,
      modelId,
      eventType,
      timestamp: timestamp,
      data,
    });
  }

  public nextTimer(): Timer | null {
    return _.reduce(
      this.timers,
      (current: Timer | null, t) => {
        if (!current) return t;
        if (current.miliseconds > t.miliseconds) return t;
        return current;
      },
      null,
    );
  }

  public nextEvent(): Event | undefined {
    if (!this._events.length) return;

    const firstTimer = this.nextTimer();
    const firstEvent = this._events[0];

    if (firstTimer && this.timestamp + firstTimer.miliseconds <= firstEvent.timestamp) {
      // !! is safe as firstTimer != null means that there are timers indeed.
      delete this._model.timers!![firstTimer.name];
      return this.timerEvent(firstTimer);
    } else {
      this._events.shift();
      return firstEvent;
    }
  }

  public *iterateEvents(): Iterable<Event> {
    let event = this.nextEvent();
    while (event) {
      yield event;
      event = this.nextEvent();
    }
  }

  public decreaseTimers(diff: number): void {
    if (!this._model.timers) return;

    this._model.timers = _.mapValues(this._model.timers, (t) => {
      return {
        name: t.name,
        miliseconds: t.miliseconds - diff,
        eventType: t.eventType,
        data: t.data,
      };
    });
  }

  public valueOf() {
    return cloneDeep(this._model);
  }

  private sortEvents() {
    this._events.sort((a: Event, b: Event) => {
      return a.timestamp - b.timestamp;
    });
  }

  private timerEvent(timer: Timer): Event {
    return {
      modelId: this._model.modelId,
      eventType: timer.eventType,
      timestamp: this.timestamp + timer.miliseconds,
      data: timer.data,
    };
  }
}
