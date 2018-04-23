import {Middleware, ExpressErrorMiddlewareInterface, ExpressMiddlewareInterface} from "routing-controllers";

@Middleware({ type: "after" })
export class LoggingErrorHandler implements ExpressErrorMiddlewareInterface {
    error(error: any, request: any, response: any, next: (err: any) => any) {
        // TOOD: Proper logging
        // console.error("OH NO, ERROR:", error.message);
        next(error);
    }
}