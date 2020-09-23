import * as _ from 'lodash';
import { cloneDeep } from 'lodash';

import { AquiredObjects, EmptyModel, Event, EventForModelType, PendingAquire, Timer } from 'interface/src/models/alice-model-engine';
import { PubSubNotification, PushNotification } from '@sr2020/interface/models/push-notification.model';
import { assert } from 'console';

export type FieldName = string | string[];
export type FieldValue = any;
export type Timestamp = number;

export interface Dictionaries {
  [catalog: string]: any[];
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
  public baseModel: T;
  public workModel: T;
  private _events: Event[];
  private _dictionaries: Dictionaries = {};
  private _outboundEvents: OutboundEvents;
  private _pubsubNotifications: PubSubNotification[] = [];
  private _pendingAquire: PendingAquire;
  private _aquired: AquiredObjects;
  private _notifications: PushNotification[] = [];
  private _tableResponse?: any = undefined;

  constructor(
    baseModel: T,
    events: Event[],
    dictionaries?: any,
    outboundEvents?: OutboundEvents,
    pendingAquire?: PendingAquire,
    aquired?: AquiredObjects,
  ) {
    this.baseModel = cloneDeep(baseModel);
    this.workModel = cloneDeep(baseModel);

    this._events = cloneDeep(events);
    this.sortEvents();

    if (dictionaries) {
      this._dictionaries = cloneDeep(dictionaries);
    }

    this._outboundEvents = outboundEvents ?? new OutboundEvents();
    this._pendingAquire = pendingAquire ?? [];
    this._aquired = aquired ?? {};
  }

  get events() {
    return this._events;
  }

  set events(value: Event[]) {
    this._events = cloneDeep(value);
    this.sortEvents();
  }

  get timestamp() {
    assert(this.baseModel.timestamp == this.workModel.timestamp);
    return this.baseModel.timestamp;
  }

  get outboundEvents(): EventForModelType[] {
    return this._outboundEvents.valueOf();
  }

  get notifications(): PushNotification[] {
    return this._notifications;
  }

  get pubSubNotifications(): PubSubNotification[] {
    return this._pubsubNotifications;
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

  public getDictionary(name: FieldName): any[] | undefined {
    return _.get(this._dictionaries, name, undefined);
  }

  public setTimer(name: string, description: string, miliseconds: number, eventType: string, data: any): this {
    // Remove existing timers with this name if any are present
    this.baseModel.timers = this.baseModel.timers.filter((t) => t.name != name);
    this.baseModel.timers.push({ name, description, miliseconds, eventType, data });
    return this;
  }

  public sendSelfEvent(eventType: string, timestamp: number, data: any) {
    this._events.unshift({
      modelId: this.baseModel.modelId,
      eventType,
      timestamp: timestamp,
      data,
    });
  }

  public sendOutboundEvent(modelType: string, modelId: string, eventType: string, timestamp: number, data: any) {
    this._outboundEvents.push({
      modelType: modelType!,
      modelId,
      eventType,
      timestamp: timestamp,
      data,
    });
  }

  public sendNotification(title: string, body: string) {
    this._notifications.push({ title, body });
  }

  public sendPubSubNotification(topic: string, body: any) {
    this._pubsubNotifications.push({ topic, body: { ...body, timestamp: this.timestamp } });
  }

  public setTableResponse(table: any) {
    this._tableResponse = table;
  }

  get tableResponse() {
    return this._tableResponse;
  }

  public *iterateEvents(): Iterable<Event> {
    let event = this.nextEvent();
    while (event) {
      yield event;
      event = this.nextEvent();
    }
  }

  public advanceTimeBy(diff: number) {
    this.decreaseTimers(diff);
    this.baseModel.timestamp += diff;
    this.workModel.timestamp += diff;
    assert(this.baseModel.timestamp == this.workModel.timestamp);
  }

  private decreaseTimers(diff: number): void {
    this.baseModel.timers = this.baseModel.timers.map((t) => {
      return {
        ...t,
        miliseconds: t.miliseconds - diff,
      };
    });
    this.workModel.timers = this.baseModel.timers;
  }

  private nextEvent(): Event | undefined {
    if (!this._events.length) return;

    const firstTimer = this.nextTimer();
    const firstEvent = this._events[0];

    if (firstTimer && this.timestamp + firstTimer.miliseconds <= firstEvent.timestamp) {
      this.baseModel.timers = this.baseModel.timers.filter((it) => it.name != firstTimer.name);
      return this.timerEvent(firstTimer);
    } else {
      this._events.shift();
      return firstEvent;
    }
  }

  private nextTimer(): Timer | null {
    return this.baseModel.timers.reduce((current: Timer | null, t) => {
      if (!current) return t;
      if (current.miliseconds > t.miliseconds) return t;
      return current;
    }, null);
  }

  private sortEvents() {
    this._events.sort((a: Event, b: Event) => {
      return a.timestamp - b.timestamp;
    });
  }

  private timerEvent(timer: Timer): Event {
    return {
      modelId: this.baseModel.modelId,
      eventType: timer.eventType,
      timestamp: this.timestamp + timer.miliseconds,
      data: timer.data,
    };
  }
}
