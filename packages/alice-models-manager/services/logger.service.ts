import { Provider } from '@loopback/core';
import * as winston from 'winston';
import { LoggingWinston } from '@google-cloud/logging-winston';

export interface LoggerService {
  debug(msg: string, meta?: any): void;
  info(msg: string, meta?: any): void;
  warning(msg: string, meta?: any): void;
  error(msg: string, meta?: any): void;
}

class WinstonLogger implements LoggerService {
  static loggingWinston = new LoggingWinston();
  static logger = winston.createLogger({
    level: 'info',
    transports: [
      new winston.transports.Console(),
      // Add Stackdriver Logging
      WinstonLogger.loggingWinston,
    ],
  });

  debug(msg: string, meta?: any) {
    WinstonLogger.logger.debug(msg, meta);
  }
  info(msg: string, meta?: any) {
    WinstonLogger.logger.info(msg, meta);
  }
  warning(msg: string, meta?: any) {
    WinstonLogger.logger.warn(msg, meta);
  }
  error(msg: string, meta?: any) {
    WinstonLogger.logger.error(msg, meta);
  }
}

export class LoggerServiceProvider implements Provider<LoggerService> {
  value(): LoggerService {
    return new WinstonLogger();
  }
}
