import * as _ from 'lodash';
import { cloneDeep } from 'lodash';
import * as dispatcher from './dispatcher';

import { Event } from 'deus-engine-manager-api';

export type Timer = {
    name: string,
    miliseconds: number,
    eventType: string,
    data: any
}

export type Effect = {
    enabled: boolean,
    name: string,
    class: string,
    type: 'normal' | 'functional',
    handler: string
}

export type FieldName = string | string[];
export type FieldValue = any;
export type Timestamp = number;

export type Modifier = {
    mID: string,
    name: string,
    class: string,
    system: string,
    enabled: boolean,
    effects: Effect[],
    [key: string]: any
}

export type Condition = {
    id: string,
    mID: string,
    class: string,
    group?: string,
    level?: number
}

export type Timers = {
    [name: string]: Timer
}

export type Character = {
    characterId: string,
    timestamp: number,

    modifiers: Modifier[],
    conditions: Condition[],

    timers: Timers,

    [key: string]: any
}

export type Dictionaries = {
    [catalog: string]: any[]
}

export class Context {
    private _ctx: Character;
    private _events: Event[];
    private _dictionaries: Dictionaries = {};

    constructor(contextSrc: any, events: Event[], dictionaries?: any) {
        this._ctx = cloneDeep(contextSrc);

        this._events = cloneDeep(events);

        this.sortEvents();

        if (dictionaries) {
            this._dictionaries = cloneDeep(dictionaries);
        }
    }

    get events() {
        return this._events;
    }

    set events(value: Event[]) {
        this._events = cloneDeep(value);
        this.sortEvents();
    }

    get ctx() { return this._ctx; }

    get timers(): Timers {
        return _.get(this._ctx, 'timers', {});
    }

    set timers(value: Timers) {
        this._ctx.timers = cloneDeep(value);
    }

    get timestamp() {
        return this._ctx.timestamp;
    }

    set timestamp(value: number) {
        this._ctx.timestamp = value;
    }

    get modifiers(): Modifier[] {
        if (!this._ctx.modifiers) this._ctx.modifiers = [];
        return this._ctx.modifiers;
    }

    get effects() {
        let enabledModifiers = this.modifiers.filter((m) => m.enabled)
        return _.flatMap(enabledModifiers, (c) => c.effects);
    }

    get conditions(): Condition[] {
        if (!this._ctx.conditions) this._ctx.conditions = [];
        return this._ctx.conditions;
    }

    clone(): Context {
        const clone = new Context(this._ctx, this._events, this._dictionaries);
        clone.timers = this.timers;
        return clone;
    }

    getDictionary(name: FieldName): any[] | undefined {
        return _.get(this._dictionaries, name, undefined);
    }

    setTimer(name: string, miliseconds: number, eventType: string, data: any): this {
        let timer = {
            name, miliseconds, eventType, data
        };
        if (!this._ctx.timers) this._ctx.timers = {};
        this._ctx.timers[timer.name] = timer;
        return this;
    }

    sendEvent(characterId: number | null, event: string, data: any /* delay: number */) {
        if (!characterId) {
            this._events.unshift({
                characterId: this._ctx.characterId,
                eventType: event,
                timestamp: this.timestamp,
                data
            });
        } else {
            // XXX send outside
        }
    }

    nextTimer(): Timer | null {
        return _.reduce(this.timers, (current: Timer | null, t) => {
            if (!current) return t;
            if (current.miliseconds > t.miliseconds) return t;
            return current;
        }, null);
    }

    nextEvent(): Event | undefined {
        if (!this._events.length) return;

        let firstTimer = this.nextTimer();
        let firstEvent = this._events[0];

        if (firstTimer && (this.timestamp + firstTimer.miliseconds <= firstEvent.timestamp)) {
            delete this._ctx.timers[firstTimer.name];
            return this.timerEvent(firstTimer);
        } else {
            this._events.shift();
            return firstEvent;
        }
    }

    *iterateEvents(): Iterable<Event> {
        let event = this.nextEvent();
        while (event) {
            yield event;
            event = this.nextEvent();
        }
    }

    enabledEffectsByType(t: string): Effect[] {
        return this.effects.filter((e) => e.enabled && e.type == t);
    }

    enabledFunctionalEffects() {
        return this.enabledEffectsByType('functional');
    }

    enabledNormalEffects() {
        return this.enabledEffectsByType('normal');
    }

    *iterateEnabledFunctionalEffects(): Iterable<Effect> {
        for (let effect of this.enabledFunctionalEffects()) {
            yield effect;
        }
    }

    *iterateEnabledNormalEffects() {
        for (let effect of this.enabledNormalEffects()) {
            yield effect;
        }
    }

    decreaseTimers(diff: number): void {
        if (!this._ctx.timers) return;

        this._ctx.timers = _.mapValues(this._ctx.timers, (t) => {
            return {
                name: t.name,
                miliseconds: t.miliseconds - diff,
                eventType: t.eventType,
                data: t.data
            };
        });
    }

    valueOf() {
        return cloneDeep(this._ctx);
    }

    private sortEvents() {
        this._events.sort((a: Event, b: Event) => {
            return a.timestamp - b.timestamp;
        });
    }

    private timerEvent(timer: Timer): Event {
        return {
            characterId: this._ctx.characterId,
            eventType: timer.eventType,
            timestamp: this.timestamp + timer.miliseconds,
            data: timer.data
        };
    }
}
