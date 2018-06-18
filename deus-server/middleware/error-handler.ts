import {ExpressErrorMiddlewareInterface, Middleware} from 'routing-controllers';
import { Container } from 'typedi';
import { LoggerToken } from '../services/logger';
import { createLogData } from '../utils';

@Middleware({ type: 'after' })
export class LoggingErrorHandler implements ExpressErrorMiddlewareInterface {
    public error(error: any, request: any, _response: any, next: (err: any) => any) {
        const logData = createLogData(request, error.httpCode || 500);
        logData.msg = error.message || '';
        Container.get(LoggerToken).error('Returning error response', logData);
        next(error);
    }
}
