import * as winston from 'winston';
import { Token } from "typedi";

export interface LoggerInterface {
  debug(msg: string, data?: any);
  info(msg: string, data?: any);
  warn(msg: string, data?: any);
  error(msg: string, data?: any);
}

export const LoggerToken = new Token<LoggerInterface>();

export class WinstonLogger implements LoggerInterface {
  private _logger: winston.LoggerInstance;

  constructor(opts: winston.LoggerOptions) {
    this._logger = new winston.Logger(opts);
  };

  debug(msg: string, data?: any) {
    this._logger.debug(msg, data);
  }
  info(msg: string, data?: any) {
    this._logger.info(msg, data);
  }
  warn(msg: string, data?: any) {
    this._logger.warn(msg, data);
  }
  error(msg: string, data?: any) {
    this._logger.error(msg, data);
  }
}