export type Callback = {
    model: string,
    callback: string
}

type EventHandler = {
    handle: string,
    callbacks: Callback[]
}

export interface ConfigInterface {
    events: EventHandler[]
}

export class Config implements ConfigInterface {
    events: EventHandler[]

    constructor() {
        this.events = [];
    }

    static parse(src: any): Config {
        let config = new Config();
        if ('events' in src) config.events = src.events;

        return config;
    }
}
