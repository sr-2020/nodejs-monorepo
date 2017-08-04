import * as Winston from 'winston';
(Winston as any).level = 'debug';

import { LogLevel, LogSource } from 'deus-engine-manager-api';

function log(source: LogSource, level: LogLevel, msg: string, ...params: any[]) {
    if (process && process.send) {
        params = params ? params : [];
        params.push({ timestamp: Date.now(), pid: process.pid });
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

function logStep(source: LogSource, level: LogLevel, step: string, ...params: any[]) {
    return (stepBody: Function) => {
        log(source, level, step + ' -- started', ...params);
        let result = stepBody();
        log(source, level, step + ' -- finished');
        return result;
    }
}

function logAsyncStep(source: LogSource, level: LogLevel, step: string, ...params: any[]) {
    return async (stepBody: Function) => {
        log(source, level, step + ' -- started', ...params);
        let result = await stepBody();
        log(source, level, step + ' -- finished');
        return result;
    }
}

function defLevel(level: LogLevel) {
    return function(source: LogSource, msg: string, ...rest: any[]) {
        log(source, level, msg, ...rest);
    }
}

export default {
    log,
    logStep,
    logAsyncStep,
    debug: defLevel('debug'),
    info: defLevel('info'),
    notice: defLevel('notice'),
    warn: defLevel('warning'),
    error: defLevel('error'),
    crit: defLevel('crit')
}
