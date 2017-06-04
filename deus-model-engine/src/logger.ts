import * as Winston from 'winston';
(Winston as any).level = 'debug';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'
export type LogSource = 'engine' | 'model';

function log(source: LogSource, level: LogLevel, msg: string, ...params: any[]) {
    if (process && process.send) {
        process.send({
            type: 'log',
            source,
            level,
            msg,
            params
        })
    } else {
        Winston.log(level, msg, ...params);
    }
}

function defLevel(level: LogLevel) {
    return function(source: LogSource, msg: string, ...rest: any[]) {
        log(source, level, msg, ...rest);
    }
}

export default {
    log,
    debug: defLevel('debug'),
    info: defLevel('info'),
    warn: defLevel('warn'),
    error: defLevel('error')
}
