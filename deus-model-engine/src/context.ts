import * as I from 'immutable';
import * as dispatcher from './dispatcher';

export type Timer = {
    miliseconds: number,
    event: string,
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

export class Context {
    private ctx: I.Map<string, any>;
    private _events: I.List<dispatcher.Event>;
    private _timers: I.List<Timer> = I.List() as I.List<Timer>;

    constructor(contextSrc: any, events: dispatcher.Event[] | I.List<dispatcher.Event>) {
        this.ctx = I.fromJS(contextSrc)

        this._events = I.List(events) as I.List<dispatcher.Event>;
        this.sortEvents();

        if (this.ctx.has('timers')) {
            this._timers = this.ctx.get('timers').map((t: any) => t.toJS());
            this.sortTimers();
            this.ctx = this.ctx.remove('timers');
        }
    }

    get events() {
        return this._events;
    }

    set events(value: I.List<dispatcher.Event> | dispatcher.Event[]) {
        this._events = I.List(value) as I.List<dispatcher.Event>;
        this.sortEvents();
    }

    get timers() {
        return this._timers;
    }

    set timers(value: I.List<Timer> | Timer[]) {
        this._timers = I.List(value) as I.List<Timer>;
        this.sortTimers();
    }

    get timestamp() {
        return this.ctx.get('timestamp');
    }

    set timestamp(value: number) {
        this.ctx = this.ctx.set('timestamp', value);
    }

    clone(): Context {
        const clone = new Context(this.ctx, this._events);
        clone.timers = this.timers;
        return clone;
    }

    get(name: FieldName): FieldValue {
        let value;
        if (typeof name == 'string') {
            // XXX сплитить по '.'
            value = this.ctx.get(name);
        } else {
            value = this.ctx.getIn(name);
        }

        if (typeof value != 'undefined') {
            return value.toJS ? value.toJS() : value;
        } else {
            return null;
        }
    }

    set(name: FieldName, value: FieldValue): this {
        // не модифицировать напрямую id, timestamp, timers, modifiers

        value = I.fromJS(value);

        if (typeof name == 'string') {
            this.ctx = this.ctx.set(name, value);
        } else {
            this.ctx = this.ctx.setIn(name, value);
        }

        return this;
    }

    update(name: FieldName, updater: (value: FieldValue) => FieldValue): this {
        let value = this.get(name);
        value = updater(value);
        return this.set(name, value);
    }

    setTimer(miliseconds: number, event: string, data: any) {
        this._timers = this._timers.push({ miliseconds, event, data });
        this.sortTimers();
        return this;
    }

    sendEvent(characterId: number | null, event: string, data: any) {
        if (!characterId) {
            this._events.unshift({
                eventType: event,
                timestamp: this.timestamp,
                data
            });
        } else {
            // XXX send outside
        }
    }

    nextEvent(): dispatcher.Event {
        let firstTimer = this._timers.first();
        let firstEvent = this._events.first();

        if (firstTimer && this.timestamp + firstTimer.miliseconds <= firstEvent.timestamp) {
            this._timers = this._timers.shift();
            return this.timerEvent(firstTimer);
        } else {
            this._events = this._events.shift();
            return firstEvent;
        }
    }

    *iterateEvents(): Iterable<dispatcher.Event> {
        let event = this.nextEvent();
        while (event) {
            yield event;
            event = this.nextEvent();
        }
    }

    enabledEffectsByType(t: string): Effect[] {
        return (this.ctx.get('modifiers', I.List()))
            .filter((m: any) => Boolean(m.get('enabled')))
            .map((m: any) => m.get('effects'))
            .filter((e: any) => e.get('type') === t && Boolean(e.get('enabled')))
            .toJS();
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

    decreaseTimers(prevTimestamp: number): void {
        if (this._timers.isEmpty()) return;

        let diff = this.timestamp - prevTimestamp;
        this._timers = this._timers.map((t: Timer): Timer => {
            return {
                miliseconds: t.miliseconds - diff,
                event: t.event,
                data: t.data
            };
        }) as I.List<Timer>;
    }

    valueOf() {
        let result = this.ctx.toJS();
        result.timers = this._timers.toJS();
        return result;
    }

    private sortTimers() {
        this._timers = this._timers.sort((a, b) => a.miliseconds - b.miliseconds) as I.List<Timer>;
    }

    private sortEvents() {
        this._events = this._events.sort((a: dispatcher.Event, b: dispatcher.Event) => {
            return a.timestamp - b.timestamp;
        }) as I.List<dispatcher.Event>;
    }

    private timerEvent(timer: Timer): dispatcher.Event {
        return {
            eventType: timer.event,
            timestamp: this.timestamp + timer.miliseconds,
            data: timer.data
        };
    }
}
