import { Token } from 'typedi';
import * as winston from 'winston';

export interface LoggerInterface {
  debug(msg: string, data?: any);
  info(msg: string, data?: any);
  warn(msg: string, data?: any);
  error(msg: string, data?: any);
}

// tslint:disable-next-line:variable-name
export const LoggerToken = new Token<LoggerInterface>();

export class WinstonLogger implements LoggerInterface {
  private _logger: winston.LoggerInstance;

  constructor(opts: winston.LoggerOptions) {
    this._logger = new winston.Logger(opts);
  }

  public debug(msg: string, data?: any) {
    this._logger.debug(msg, data);
  }
  public info(msg: string, data?: any) {
    this._logger.info(msg, data);
  }
  public warn(msg: string, data?: any) {
    this._logger.warn(msg, data);
  }
  public error(msg: string, data?: any) {
    this._logger.error(msg, data);
  }
}
