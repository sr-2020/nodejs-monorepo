import * as Winston from 'winston';
(Winston as any).level = 'debug';

import { LogLevel, LogSource } from 'deus-engine-manager-api';

function log(source: LogSource, level: LogLevel, msg: string, additionalData?: any) {
    additionalData = additionalData ? additionalData : {};
    additionalData.timestamp = Date.now();
    additionalData.pid = process.pid;
    if (process && process.send) {
        process.send({
            type: 'log',
            source,
            level,
            msg,
            additionalData
        })
    } else {
        Winston.log(level, msg, additionalData);
    }
}

function logStep(source: LogSource, level: LogLevel, step: string, additionalData?: any) {
    return (stepBody: Function) => {
        log(source, level, step + ' -- started', additionalData);
        let result = stepBody();
        log(source, level, step + ' -- finished');
        return result;
    }
}

function logAsyncStep(source: LogSource, level: LogLevel, step: string, additionalData?: any) {
    return async (stepBody: Function) => {
        log(source, level, step + ' -- started', additionalData);
        let result = await stepBody();
        log(source, level, step + ' -- finished');
        return result;
    }
}

function defLevel(level: LogLevel) {
    return function(source: LogSource, msg: string, additionalData?: any) {
        log(source, level, msg, additionalData);
    }
}

export default {
    log,
    logStep,
    logAsyncStep,
    debug: defLevel('debug'),
    info: defLevel('info'),
    notice: defLevel('notice'),
    warn: defLevel('warn'),
    error: defLevel('error'),
    crit: defLevel('crit')
}
