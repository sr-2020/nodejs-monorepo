import {Middleware, ExpressErrorMiddlewareInterface, ExpressMiddlewareInterface} from "routing-controllers";
import { LoggerToken } from "../services/logger";
import { Container } from "typedi";
import { createLogData } from "../utils";

@Middleware({ type: "after" })
export class LoggingErrorHandler implements ExpressErrorMiddlewareInterface {
    error(error: any, request: any, response: any, next: (err: any) => any) {
        const logData = createLogData(request, error.httpCode || 500);
        logData.msg = error.message || '';
        Container.get(LoggerToken).error('Returning error response', logData)
        next(error);
    }
}