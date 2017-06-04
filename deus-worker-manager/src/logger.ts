import { Container, ContainerInstance } from 'winston';

import { Config } from './config';

function defLevel(level: LogLevel) {
    return function(source: LogSource, msg: string, ...rest: any[]) {
        this.log(source, level, msg, ...rest);
    }
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'
export type LogSource = 'default' | 'manager' | 'engine' | 'model';

export default class Logger {
    private container: ContainerInstance;

    constructor(private config: Config) {
        this.container = new Container(config.logger.default);

        for (let src in this.config.logger) {
            if (src == 'default') continue;
            this.container.add(src, this.config.logger[src]);
        }
    }

    log(source: LogSource, level: string, msg: string, ...rest: any[]) {
        this.container.get(source).log(level, msg, ...rest);
    }

    debug = defLevel('debug')
    info = defLevel('info')
    warn = defLevel('warn')
    error = defLevel('error')
}
