import * as I from 'immutable';
import * as dispatcher from './dispatcher';

export type Timer = {
    name: string,
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
    private _ctx: I.Map<string, any>;
    private _events: I.List<dispatcher.Event>;
    private _timers: I.List<Timer> = I.List() as I.List<Timer>;
    private _dictionaries: I.Map<string, any> = I.Map<string, any>();

    constructor(contextSrc: any, events: dispatcher.Event[] | I.List<dispatcher.Event>, dictionaries?: any) {
        this._ctx = I.fromJS(contextSrc)

        this._events = I.List(events) as I.List<dispatcher.Event>;
        this.sortEvents();

        if (this._ctx.has('timers')) {
            this._timers = this._ctx.get('timers').map((t: any) => t.toJS());
            this.sortTimers();
            this._ctx = this._ctx.remove('timers');
        }

        if (dictionaries) {
            this._dictionaries = I.fromJS(dictionaries);
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
        return this._ctx.get('timestamp');
    }

    set timestamp(value: number) {
        this._ctx = this._ctx.set('timestamp', value);
    }

    get modifiers() {
        return this._ctx.get('modifiers');
    }

    get effects() {
        return this._ctx.get('modifiers').map((c: any) => c.get('effects')).flatten();
    }

    get conditions() {
        return this._ctx.get('conditions');
    }

    clone(): Context {
        const clone = new Context(this._ctx, this._events, this._dictionaries);
        clone.timers = this.timers;
        return clone;
    }

    get(name: FieldName): FieldValue {
        let value;
        if (typeof name == 'string') {
            name = name.split('.');
        }

        return this._ctx.getIn(name);
    }

    set(name: FieldName, value: FieldValue): this {
        if (typeof name == 'string') {
            name = name.split('.');
        }

        //TODO: исправить временный костыль. 
        //Из списка убран 'modifiers' т.к. иначе невозможно обновить модификаторы. 
        //Нужно править API
        if (['id', 'timestamps', 'timers'].includes(name[0])) {
            return this;
        }

        value = I.fromJS(value);

        this._ctx = this._ctx.setIn(name, value);

        return this;
    }

    update(name: FieldName, updater: (value: FieldValue) => FieldValue): this {
        let value = this.get(name);
        value = updater(value);
        return this.set(name, value);
    }

    push(name: FieldName, value: FieldValue): this {
        if (typeof name == 'string') {
            name = name.split('.');
        }

        value = I.fromJS(value);

        this._ctx = this._ctx.setIn(name, this._ctx.getIn(name, I.List()).push(value));
        return this;
    }

    getDictionary(name: FieldName) {
        if (typeof name == 'string') {
            name = name.split('.');
        }

        return this._dictionaries.getIn(name);
    }

    setTimer(name: string, miliseconds: number, event: string, data: any) {
        this._timers = this._timers.push({ name, miliseconds, event, data });
        this.sortTimers();
        return this;
    }

    sendEvent(characterId: number | null, event: string, data: any /* delay: number */) {
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

        if (firstTimer && (!firstEvent || this.timestamp + firstTimer.miliseconds <= firstEvent.timestamp)) {
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
        let result: any = (this._ctx.get('modifiers', I.List()))
            .filter((m: any) => Boolean(m.get('enabled')))
            .flatMap((m: any) => m.get('effects'))
            .filter((e: any) => e.get('type') === t && Boolean(e.get('enabled')))
            .toJS();

        return result;
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
                name: t.name,
                miliseconds: t.miliseconds - diff,
                event: t.event,
                data: t.data
            };
        }) as I.List<Timer>;
    }

    valueOf() {
        let result = this._ctx.toJS();
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
