import { requireDir } from './utils';

export type Callback = string;

export type EventHandler = {
    eventType: string,
    effects: Callback[]
}

export type SerializedConfig = {
    events: EventHandler[]
}

export interface ConfigInterface {
    events: EventHandler[]
}

export class Config implements ConfigInterface {
    events: EventHandler[]

    constructor() {
        this.events = [];
    }

    static parse(src: SerializedConfig): Config {
        let config = new Config();
        if ('events' in src) config.events = src.events;

        return config;
    }

    static load(dir: string): Config {
        let src = requireDir(dir);
        return this.parse(src);
    }
}
