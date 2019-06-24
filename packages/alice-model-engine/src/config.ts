export type Callback = string;

export interface EventHandler {
  eventType: string;
  effects: Callback[];
}

export interface SerializedConfig {
  events: EventHandler[];
  [name: string]: any;
}

export interface ConfigInterface {
  events: EventHandler[];
  dictionaries: {
    [name: string]: any;
  };
}

export class Config implements ConfigInterface {

  public static parse(src: SerializedConfig): Config {
    const config = new Config();

    const { events, ...dictionaries } = src;
    config.events = events;
    config.dictionaries = dictionaries;

    return config;
  }
  public events: EventHandler[] = [];
  public dictionaries: { [name: string]: any } = {};
}
