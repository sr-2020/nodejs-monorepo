import { Inject } from './di';
import { Container, ContainerInstance } from 'winston';

import { Config, LoggerConfig } from './config';

function defLevel(level: LogLevel) {
    return function(source: LogSource, msg: string, ...rest: any[]) {
        this.log(source, level, msg, ...rest);
    };
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogSource = 'default' | 'manager' | 'engine' | 'model';

export interface LoggerInterface {
    log(source: LogSource, level: LogLevel, msg: string, ...rest: any[]): void;
    debug(source: LogSource, msg: string, ...rest: any[]): void;
    info(source: LogSource, msg: string, ...rest: any[]): void;
    warn(source: LogSource, msg: string, ...rest: any[]): void;
    error(source: LogSource, msg: string, ...rest: any[]): void;
}

@Inject
export class Logger implements LoggerInterface {
    private config: LoggerConfig;
    private container: ContainerInstance;

    constructor(config: Config) {
        this.config = config.logger;
        this.container = new Container(this.config.default);

        for (let src in this.config) {
            if (src == 'default') continue;
            this.container.add(src, this.config[src]);
        }
    }

    log(source: LogSource, level: LogLevel, msg: string, ...rest: any[]) {
        this.container.get(source).log(level, msg, ...rest);
    }

    debug = defLevel('debug');
    info = defLevel('info');
    warn = defLevel('warn');
    error = defLevel('error');
}
