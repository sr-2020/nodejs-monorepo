import { Inject } from './di';
import { Container, ContainerInstance } from 'winston';
import * as winston from 'winston';
import * as Elasticsearch from 'winston-elasticsearch';

import { Config, LoggerConfig } from './config';
import { LogLevel, LogSource } from 'deus-engine-manager-api';

// Set default winston config
(winston.transports as any).Elasticsearch = Elasticsearch;
winston.setLevels(winston.config.syslog.levels);

function defLevel(level: LogLevel) {
    return function(source: LogSource, msg: string, ...rest: any[]) {
        this.log(source, level, msg, ...rest);
    };
}

export interface LoggerInterface {
    log(source: LogSource, level: LogLevel, msg: string, ...rest: any[]): void;
    debug(source: LogSource, msg: string, ...rest: any[]): void;
    info(source: LogSource, msg: string, ...rest: any[]): void;
    notice(source: LogSource, msg: string, ...rest: any[]): void;
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
    notice = defLevel('notice');
    warn = defLevel('warning');
    error = defLevel('error');
}
