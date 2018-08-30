import { Container, ContainerInstance } from 'winston';
import * as winston from 'winston';
import * as Elasticsearch from 'winston-elasticsearch';

import { LogLevel, LogSource } from 'alice-model-engine-api';
import { Config, LoggerConfig } from './config';

// Set default winston config
(winston.transports as any).Elasticsearch = Elasticsearch;
winston.setLevels(winston.config.syslog.levels);

export interface LoggerInterface {
    log(source: LogSource, level: LogLevel, msg: string, additionalData?: any): void;
    debug(source: LogSource, msg: string, additionalData?: any): void;
    info(source: LogSource, msg: string, additionalData?: any): void;
    notice(source: LogSource, msg: string, additionalData?: any): void;
    warn(source: LogSource, msg: string, additionalData?: any): void;
    error(source: LogSource, msg: string, additionalData?: any): void;
}

export class Logger implements LoggerInterface {

    public debug = this.defLevel('debug');
    public info = this.defLevel('info');
    public notice = this.defLevel('notice');
    public warn = this.defLevel('warn');
    public error = this.defLevel('error');
    private config: LoggerConfig;
    private container: ContainerInstance;

    constructor(config: Config) {
        this.config = config.logger;

        this.container = new Container(this.config.default);

        for (const src in this.config) {
            if (src == 'default') continue;
            this.container.add(src, this.config[src]);
        }
    }

    public log(source: LogSource, level: LogLevel, msg: string, additionalData?: any) {
        this.container.get(source).log(level, msg, additionalData);
    }

    private defLevel(level: LogLevel) {
        return (source: LogSource, msg: string, additionalData?: any) => {
            additionalData = additionalData ? additionalData : {};
            additionalData.source = source;
            this.log(source, level, msg, additionalData);
        };
    }
}
