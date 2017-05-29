import * as I from 'immutable';
import * as dispatcher from './dispatcher';

export type Timer = {
    seconds: number,
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
    private events: I.List<dispatcher.Event>;
    private timers: I.List<Timer> = I.List() as I.List<Timer>;

    constructor(contextSrc: any, events: dispatcher.Event[] | I.List<dispatcher.Event>) {
        this.ctx = I.fromJS(contextSrc)

        this.events = I.List(events).sort((a: dispatcher.Event, b: dispatcher.Event) => {
            return a.timestamp - b.timestamp;
        }) as I.List<dispatcher.Event>;

        if (this.ctx.has('timers')) {
            this.timers = this.ctx.get('timers').map((t: any) => t.toJS());
            this.sortTimers();
            this.ctx = this.ctx.remove('timers');
        }
    }

    clone(): Context {
        return new Context(this.ctx, this.events);
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

    getTimestamp(): Timestamp {
        return this.ctx.get('timestamp');
    }

    setTimestamp(timestamp: Timestamp): Timestamp {
        this.ctx = this.ctx.set('timestamp', timestamp);
        return timestamp;
    }

    setTimer(seconds: number, event: string, data: any) {
        this.timers = this.timers.push({ seconds, event, data });
        this.sortTimers();
        return this;
    }

    nextEvent(): dispatcher.Event {
        let firstTimer = this.timers.first();
        let firstEvent = this.events.first();

        if (firstTimer && this.getTimestamp() + firstTimer.seconds * 1000 <= firstEvent.timestamp) {
            this.timers = this.timers.shift();
            return this.timerEvent(firstTimer);
        } else {
            this.events = this.events.shift();
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
        if (this.timers.isEmpty()) return;

        let diff = Math.floor((this.getTimestamp() - prevTimestamp) / 1000);
        this.timers = this.timers.map((t: Timer): Timer => {
            return {
                seconds: t.seconds - diff,
                event: t.event,
                data: t.data
            };
        }) as I.List<Timer>;
    }

    valueOf() {
        let result = this.ctx.toJS();
        result.timers = this.timers.toJS();
        return result;
    }

    private sortTimers() {
        this.timers = this.timers.sort((a, b) => a.seconds - b.seconds) as I.List<Timer>;
    }

    private timerEvent(timer: Timer): dispatcher.Event {
        return {
            eventType: timer.event,
            timestamp: this.getTimestamp() + timer.seconds * 1000,
            data: timer.data
        };
    }
}
