import { RejectProvider } from '@loopback/rest/dist/providers/reject.provider';
import { HandlerContext } from '@loopback/rest/dist/types';
import { HttpError } from 'http-errors';

// For whatever reason Loopback 4 is bad at propagating its own errors:
// it rewraps them into message field, so propagated error could look like this:
// {"statusCode":400,"message":"{\"error\":{\"statusCode\":400,\"name\":\"BadRequestError\",\"message\":\"Reason bla bla bla\"}}"}
// Here we unwrap error.message if possible.
export class CustomRejectProvider extends RejectProvider {
  action({ request, response }: HandlerContext, error: Error) {
    const err = <HttpError>error;

    try {
      error = <HttpError>JSON.parse(err.message).error ?? error;
    } catch (e) {
      // This is fine, probably error was returned by non-Loopback service, so let's keep current error value
    }

    super.action({ request, response }, error);
  }
}
