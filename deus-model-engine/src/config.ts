import { requireDir } from './utils';

export type Callback = string;

export type EventHandler = {
    eventType: string,
    effects: Callback[]
}

export type SerializedConfig = {
    events: EventHandler[],
    [name: string]: any
}

export interface ConfigInterface {
    events: EventHandler[]
    dictionaries: {
        [name: string]: any
    }
}

export class Config implements ConfigInterface {
    events: EventHandler[] = []
    dictionaries: { [name: string]: any } = {}

    static parse(src: SerializedConfig): Config {
        let config = new Config();

        if ('events' in src) config.events = src.events;
        for (let name in src) {
            if (name != 'events') {
                config.dictionaries[name] = src[name];
            }
        }

        return config;
    }

    static load(dir: string): Config {
        let src = requireDir(dir);
        return this.parse(src);
    }
}
