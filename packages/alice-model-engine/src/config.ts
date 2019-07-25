export type Callback = string;

export interface EventHandler {
  eventType: string;
  effects: Callback[];
}

export interface SerializedConfig {
  [name: string]: any;
}

export interface ConfigInterface {
  dictionaries: {
    [name: string]: any;
  };
}

export class Config implements ConfigInterface {
  public static parse(src: SerializedConfig): Config {
    const config = new Config();

    const { ...dictionaries } = src;
    config.dictionaries = dictionaries;

    return config;
  }
  public dictionaries: { [name: string]: any } = {};
}
