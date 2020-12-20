import type { LoggerService } from '../services/logger.service';
import { ArgumentsHost, Catch, HttpException, HttpServer } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class GlobalExceptionsFilter extends BaseExceptionFilter {
  constructor(server: HttpServer, private logger: LoggerService) {
    super(server);
  }

  catch(error: any, host: ArgumentsHost) {
    const statusCode = error?.response?.status;
    if (statusCode) {
      error = new HttpException({ error: { message: error?.response?.data?.message, statusCode: statusCode } }, statusCode);
      if (statusCode == 400) {
        // UserVisibleError goes here, no need to alert or warn in logs.
        this.logger.info(error.message, error);
      } else if (statusCode == 404) {
        // Typically still caused by a user doing something weird, no need to alert,
        // but it's nice to have an error in logs.
        this.logger.error(error.message, error);
      } else if (statusCode == 422) {
        this.logger.error(error.message, error);
      } else {
        this.logger.error(error.message, error);
      }
    } else {
      this.logger.error(error.message, error);
    }

    super.catch(error, host);
  }
}
