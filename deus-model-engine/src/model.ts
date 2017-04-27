import * as I from 'immutable';
import * as dispatcher from './dispatcher';

type Timer = {
    seconds: number,
    handle: string,
    data: any
}

export class Context {
    private ctx: I.Map<string, any>;
    private events: I.List<dispatcher.Event>;
    private timers: I.List<Timer> = I.List() as I.List<Timer>;

    constructor(contextSrc: any, events: dispatcher.Event[]) {
        this.ctx = I.fromJS(contextSrc)

        this.events = I.List(events).sort((a, b) => {
            return a.timestamp - b.timestamp;
        }) as I.List<dispatcher.Event>;

        if (this.ctx.has('timers')) {
            this.timers = this.ctx.get('timers').map((t: any) => t.toJS());
            this.sortTimers();
            this.ctx = this.ctx.remove('timers');
        }
    }

    get(name: string | string[]) {
        let value;
        if (typeof name == 'string') {
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

    set(name: string | string[], value: any) {
        value = I.fromJS(value);

        if (typeof name == 'string') {
            this.ctx = this.ctx.set(name, value);
        } else {
            this.ctx = this.ctx.setIn(name, value);
        }

        return this;
    }

    update(name: string | string[], updater: (value: any) => any) {
        let value = this.get(name);
        value = updater(value);
        return this.set(name, value);
    }

    getTimestamp(): number {
        return this.ctx.get('timestamp');
    }

    setTimestamp(timestamp: number): number {
        this.ctx = this.ctx.set('timestamp', timestamp);
        return timestamp;
    }

    setTimer(seconds: number, handle: string, data: any) {
        this.timers = this.timers.push({ seconds, handle, data });
        this.sortTimers();
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

    updateTimers(prevTimestamp: number): void {
        if (this.timers.isEmpty()) return;

        let diff = Math.floor((this.getTimestamp() - prevTimestamp) / 1000);
        this.timers = this.timers.map((t: Timer) => {
            return {
                seconds: t.seconds - diff,
                handle: t.handle,
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

    timerEvent(timer: Timer): dispatcher.Event {
        return {
            handle: timer.handle,
            timestamp: this.getTimestamp() + timer.seconds * 1000,
            data: timer.data
        };
    }
}

export type Callback = (context: Context, data: any) => void

export type Callbacks = {
    [key: string]: Callback
}

export interface ModelInterface {
    name: string,
    description: string | null | undefined,
    files: string[],

    resolveCallback: ((handle: string) => Callback)
}

export class Model implements ModelInterface {
    constructor(
        public name: string,
        public description: string,
        public files: string[],
        public callbacks: Callbacks
    ) { }

    resolveCallback(name: string) {
        return this.callbacks[name]
    }
}
