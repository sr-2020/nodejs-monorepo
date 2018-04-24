import * as basic_auth from 'basic-auth';
import {ExpressMiddlewareInterface, UnauthorizedError} from "routing-controllers";
import { Container } from "typedi";
import { ApplicationSettingsToken } from "../services/settings";

export class PushAuthMiddleware implements ExpressMiddlewareInterface {
    use(request: any, response: any, next: (err?: any) => any): any {
      const pushsettings = Container.get(ApplicationSettingsToken).pushSettings;
      const credentials = basic_auth(request);
        if (!(credentials &&
          credentials.name == pushsettings.username && credentials.pass == pushsettings.password))
          throw new UnauthorizedError('Access denied');
        next();
    }
}