import * as basic_auth from 'basic-auth';
import * as express from 'express';
import * as addRequestId from 'express-request-id';
import * as time from 'express-timestamp';
import * as http from 'http';
import * as PouchDB from 'pouchdb';
import * as PouchDBFind from 'pouchdb-find';
PouchDB.plugin(PouchDBFind);

import { StatusAndBody } from './connection';
import { makeVisibleNotificationPayload, makeSilentRefreshNotificationPayload, sendGenericPushNotification } from './push-helpers';
import "reflect-metadata"; // this shim is required
import { useExpressServer, Action, UnauthorizedError } from "routing-controllers";
import { TimeController } from './controllers/time.controller';
import { DatabasesContainerToken, Account } from './services/db-container';
import { currentTimestamp, canonicalId, RequestId, returnCharacterNotFoundOrRethrow } from './utils';
import { ViewModelController } from './controllers/viewmodel.controller';
import { LoggingErrorHandler } from './middleware/error-handler'
import { Container } from "typedi";
import { LoggerToken } from "./services/logger";
import { CharactersController } from "./controllers/characters.controller";
import { ApplicationSettingsToken } from "./services/settings";
import { PushController } from "./controllers/push.controller";
import { EventsController } from "./controllers/events.controller";
import { EconomyController } from './controllers/economy.controller';
import { LocationEventsController } from "./controllers/location-events.controller";

class App {
  private app: express.Express = express();
  private server: http.Server | null = null;
  private cancelAutoNotify: NodeJS.Timer | null = null;
  private cancelAutoRefresh: NodeJS.Timer | null = null;
  private logger = Container.get(LoggerToken);
  private dbContainer = Container.get(DatabasesContainerToken);
  private settings = Container.get(ApplicationSettingsToken);

  constructor() {
    this.app.use(addRequestId());
    this.app.use(time.init);

    this.app.use((req, res, next) => {
      this.logger.debug('Request body', { requestId: RequestId(req), body: req.body, source: 'api' });
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    });

    useExpressServer(this.app, {
      currentUserChecker: async (action: Action): Promise<Account | undefined> => {
        const credentials = basic_auth(action.request);
        if (!credentials)
          throw new UnauthorizedError('No authorization provided');;

        try {
          credentials.name = await canonicalId(credentials.name);
          const account: Account = await this.dbContainer.accountsDb().get(credentials.name);
          if (account.password != credentials.pass)
            throw new UnauthorizedError('Wrong password');
          return account;
        } catch (e) {
          returnCharacterNotFoundOrRethrow(e);
        }
      },
      controllers: [
        TimeController, ViewModelController, CharactersController, PushController, EventsController, EconomyController,
        LocationEventsController
      ],
      middlewares: [LoggingErrorHandler],
      cors: true,
    });

    const deleteMeLogFn = (id: string, result: Promise<StatusAndBody>) => {
      result.then((r) => this.logger.info(`Sending push notification to force refresh`, { r, characterId: id, source: 'api' }))
        .catch((err) => this.logger.warn(`Failed to send notification: ${err}`, { characterId: id, source: 'api' }));
    };

    if (this.settings.pushSettings.autoNotify && this.settings.pushSettings.autoNotifyTitle) {
      const autoNotifySettings = this.settings.pushSettings.autoNotify;
      const autoNotifyTitle = this.settings.pushSettings.autoNotifyTitle;
      this.cancelAutoNotify = setInterval(async () => {
        const currentHour = new Date().getHours();
        if (autoNotifySettings.allowFromHour && autoNotifySettings.allowFromHour > currentHour)
          return;
        if (autoNotifySettings.allowToHour && autoNotifySettings.allowToHour < currentHour)
          return;
        try {
          const inactiveIDs =
            await this.getCharactersInactiveForMoreThan(autoNotifySettings.notifyIfInactiveForMoreThanMs);
          inactiveIDs.map((id) => deleteMeLogFn(id, sendGenericPushNotification(id,
            makeVisibleNotificationPayload(autoNotifyTitle, this.settings.pushSettings.autoNotifyBody))));
        } catch (e) {
          this.logger.error(`Error when getting inactive users: ${e}`, { source: 'api' });
        }
      }, autoNotifySettings.performOncePerMs);
    }

    if (this.settings.pushSettings.autoRefresh) {
      const autoRefreshSettings = this.settings.pushSettings.autoRefresh;
      this.cancelAutoRefresh = setInterval(async () => {
        const currentHour = new Date().getHours();
        if (autoRefreshSettings.allowFromHour && autoRefreshSettings.allowFromHour > currentHour)
          return;
        if (autoRefreshSettings.allowToHour && autoRefreshSettings.allowToHour < currentHour)
          return;
        try {
          const inactiveIDs =
            await this.getCharactersInactiveForMoreThan(autoRefreshSettings.notifyIfInactiveForMoreThanMs);
          inactiveIDs.map((id) => deleteMeLogFn(id, sendGenericPushNotification(id,
            makeSilentRefreshNotificationPayload())));
        } catch (e) {
          this.logger.error(`Error when getting inactive users: ${e}`, { source: 'api' });
        }
      }, autoRefreshSettings.performOncePerMs);
    }
  }

  public async listen() {
    this.server = this.app.listen(this.settings.port);
  }

  public stop() {
    if (!this.server) return;
    this.server.close();
    if (this.cancelAutoNotify) {
      clearInterval(this.cancelAutoNotify);
    }
    if (this.cancelAutoRefresh) {
      clearInterval(this.cancelAutoRefresh);
    }
  }

  private async getCharactersInactiveForMoreThan(ms: number): Promise<string[]> {
    const docs = await this.dbContainer.viewModelDb('mobile').find({
      selector: { timestamp: { $lt: currentTimestamp() - ms } }
    });

    return docs.docs.map((doc) => doc._id);
  }
}

export default App;
