import * as Winston from 'winston';
(Winston as any).level = 'debug';

import { LogLevel, LogSource } from 'alice-model-engine-api';

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
      additionalData,
    });
  } else {
    Winston.log(level, msg, additionalData);
  }
}

function logStep(source: LogSource, level: LogLevel, step: string, additionalData?: any) {
  return (stepBody: () => any) => {
    log(source, level, step + ' -- started', additionalData);
    const result = stepBody();
    log(source, level, step + ' -- finished');
    return result;
  };
}

function logAsyncStep(source: LogSource, level: LogLevel, step: string, additionalData?: any) {
  return async (stepBody: () => any) => {
    log(source, level, step + ' -- started', additionalData);
    const result = await stepBody();
    log(source, level, step + ' -- finished');
    return result;
  };
}

function defLevel(level: LogLevel) {
  return (source: LogSource, msg: string, additionalData?: any) => {
    log(source, level, msg, additionalData);
  };
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
  crit: defLevel('crit'),
};
