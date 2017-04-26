import * as I from 'immutable';

export class Context {
    private ctx: I.Map<string, any>

    constructor(src: any) {
        if (!(src instanceof I.Iterable)) {
            this.ctx = I.fromJS(src)
        } else {
            this.ctx = src;
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
    }

    update(name: string | string[], updater: (value: any) => any) {
        let value = this.get(name);
        value = updater(value);
        this.set(name, value);
    }

    getTimestamp(): number {
        return this.ctx.get('timestamp');
    }

    setTimestamp(timestamp: number): number {
        this.ctx = this.ctx.set('timestamp', timestamp);
        return timestamp;
    }

    setTimer(seconds: number, handle: string, data: any) {
        let timers: I.List<any> = this.ctx.get('timers') || I.List();
        let newTimer = I.Map({ seconds, handle, data });
        timers = timers.push(newTimer);
        this.ctx = this.ctx.set('timers', timers);
    }

    pullTimerBefore(timestamp: number) {
        let timers: I.List<any> = this.ctx.get('timers');
        if (!timers || !timers.size) return null;

        timers = timers.sort((a: any, b: any) => a.get('seconds') - b.get('seconds')) as I.List<any>;

        let timer = timers.first();
        let diff = timestamp - this.getTimestamp();

        if (timer.get('seconds') * 1000 < diff) {
            this.ctx = this.ctx.set('timers', timers.shift());
            return timer.toJS();
        }

        return null;
    }

    getTimers(sorted: boolean = true) {
        let timers = this.ctx.get('timers');

        if (!timers) {
            return [];
        }

        timers = timers.toJS();

        if (sorted) {
            timers = timers.sort((a: any, b: any) => a.seconds - b.seconds);
        }

        return timers;
    }

    updateTimers(diff: number): void {
        if (!this.ctx.get('timers')) return;

        this.ctx = this.ctx.update('timers', (timers) => {
            return timers.map((t: any) => t.set('seconds', t.get('seconds') - diff))
        });
    }

    valueOf() {
        return this.ctx.toJS()
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
