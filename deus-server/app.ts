import * as basic_auth from 'basic-auth';
import * as bodyparser from 'body-parser';
import * as express from 'express';
import * as addRequestId from 'express-request-id';
import * as time from 'express-timestamp';
import * as http from 'http';
import * as moment from 'moment';
import * as PouchDB from 'pouchdb';
import * as PouchDBUpsert from 'pouchdb-upsert';
import * as rp from 'request-promise';
import * as winston from 'winston';
PouchDB.plugin(PouchDBUpsert);

import { TSMap } from 'typescript-map';

import { Connection, StatusAndBody } from './connection';
import { ApplicationSettings } from './settings';
import { makeVisibleNotificationPayload, makeSilentRefreshNotificationPayload } from './push-helpers';
import { characterIdTimestampOnlyRefreshesView } from './consts';
import "reflect-metadata"; // this shim is required
import {createExpressServer, useExpressServer, Action, UnauthorizedError} from "routing-controllers";
import { TimeController } from './controllers/time.controller';
import { DatabasesContainer, setDatabaseContainer } from './services/db-container';
import { currentTimestamp, canonicalId, IsNotFoundError, RequestId, createLogData, returnCharacterNotFoundOrRethrow } from './utils';
import { ViewModelController } from './controllers/view-mode.controller';
import { LoggingErrorHandler } from './middleware/error-handler'
import { Container } from "typedi";
import { LoggerToken } from "./services/logger";

class AuthError extends Error { }

function CleanEventsForLogging(events: any[]) {
  return events.map((event) => {
    return {
      type: event.eventType,
      timestamp: event.timestamp
    }
  });
}


class App {
  private app: express.Express = express();
  private server: http.Server | null = null;
  private connections = new TSMap<string, Connection>();
  private cancelAutoNotify: NodeJS.Timer | null = null;
  private cancelAutoRefresh: NodeJS.Timer | null = null;
  private logger = Container.get(LoggerToken);

  constructor(
    private dbContainer: DatabasesContainer,
    private settings: ApplicationSettings) {
    setDatabaseContainer(dbContainer);

    this.app.use(bodyparser.json());
    this.app.use(addRequestId());
    this.app.use(time.init);

    this.app.use((req, res, next) => {
      this.logger.debug('Request body', { requestId: RequestId(req), body: req.body, source: 'api' });

      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    });

    this.app.use((_req, res, next) => {
      res.setHeader('Access-Control-Allow-Headers',
        res.getHeader('Access-Control-Allow-Headers') + ', Authorization');
      next();
    });

    useExpressServer(this.app, {
      currentUserChecker: async (action: Action) => {
        const credentials = basic_auth(action.request);
        if (!credentials)
          throw new UnauthorizedError('No authorization provided');;

        if (credentials) {
          try {
            credentials.name = await canonicalId(this.dbContainer, credentials.name);
            const password = (await this.dbContainer.accountsDb().get(credentials.name)).password;
            if (password != credentials.pass)
              throw new UnauthorizedError('Wrong password');
            return credentials.name;
          } catch (e) {
            returnCharacterNotFoundOrRethrow(e);
          }
        }
      },
      controllers: [
        TimeController, ViewModelController
      ],
      middlewares: [LoggingErrorHandler],
      cors: true,
    });

    const auth = (propagateAccess: boolean) => async (req, res, next) => {
      const credentials = basic_auth(req);
      if (credentials) {
        try {
          credentials.name = await canonicalId(this.dbContainer, credentials.name);
          const password = (await this.dbContainer.accountsDb().get(credentials.name)).password;
          if (password != credentials.pass)
            throw new AuthError('Wrong password');

          req.params.id = await canonicalId(this.dbContainer, req.params.id);
          const id: string = req.params.id;
          if (id == credentials.name)
            return next();

          if (!propagateAccess)
            throw new AuthError('Access propagation is disabled, but trying to query another user');

          const allowedAccess = (await this.dbContainer.accountsDb().get(id)).access;
          if (allowedAccess.some((access) =>
            access.id == credentials.name && access.timestamp >= currentTimestamp()))
            return next();
          throw new AuthError('Trying to access user without proper access rights');
        } catch (e) {
          if (IsNotFoundError(e)) {
            this.logAndSendErrorResponse(req, res, 404, 'Character with such id or login is not found');
            return;
          }
        }
      }
      res.header('WWW-Authentificate', 'Basic');
      this.logAndSendErrorResponse(req, res, 401, 'Access denied');
    };

    this.app.post('/events/:id', auth(true), (req, res) => this.postEvents(req, res));

    this.app.get('/events/:id', auth(true), async (req, res) => {
      const id: string = req.params.id;

      try {
        const response = {
          serverTime: currentTimestamp(),
          id,
          timestamp: await this.cutTimestamp(id),
        };
        res.status(200).send(response);
      } catch (e) {
        this.returnCharacterNotFoundOrRethrow(e, req, res);
      }
    });

    this.app.post('/characters/:id', auth(false), async (req, res) => {
      const id: string = req.params.id;

      let grantAccess = req.body.grantAccess ? req.body.grantAccess : Array<string>();
      let removeAccess = req.body.removeAccess ? req.body.removeAccess : Array<string>();
      if (!(grantAccess instanceof Array && removeAccess instanceof Array)) {
        res.status(400).send('Wrong request format');
        return;
      }

      grantAccess = await Promise.all(grantAccess.map((login) => canonicalId(this.dbContainer, login)));
      removeAccess = await Promise.all(removeAccess.map((login) => canonicalId(this.dbContainer, login)));

      try {
        const resultAccess: any[] = [];
        await this.dbContainer.accountsDb().upsert(id, (doc) => {
          doc.access = doc.access ? doc.access : [];
          for (const access of doc.access) {
            if (removeAccess.some((removeId) => access.id == removeId))
              continue;

            if (grantAccess.some((grantId) => access.id == grantId))
              access.timestamp = Math.max(access.timestamp, currentTimestamp() + this.settings.accessGrantTime);

            resultAccess.push(access);
          }
          for (const access of grantAccess)
            if (!resultAccess.some((r) => r.id == access))
              resultAccess.push({ id: access, timestamp: currentTimestamp() + this.settings.accessGrantTime });
          doc.access = resultAccess;
          return doc;
        });
        res.send({ access: resultAccess });
      } catch (e) {
        this.returnCharacterNotFoundOrRethrow(e, req, res);
      }
    });

    this.app.get('/characters/:id', auth(false), async (req, res) => {
      const id: string = req.params.id;
      try {
        const allowedAccess = await this.dbContainer.accountsDb().get(id);
        const access = allowedAccess.access ? allowedAccess.access : [];
        res.send({ access });
      } catch (e) {
        this.returnCharacterNotFoundOrRethrow(e, req, res);
      }
    });

    const pushAuth = (req, res, next) => {
      const credentials = basic_auth(req);
      if (credentials &&
        credentials.name == settings.pushSettings.username && credentials.pass == settings.pushSettings.password)
        return next();
      res.header('WWW-Authentificate', 'Basic');
      this.logAndSendErrorResponse(req, res, 401, 'Access denied');
    };

    this.app.post('/push/visible/:id', pushAuth, async (req, res) => {
      await this.sendGenericPushNotificationAndRespond(req, res,
        makeVisibleNotificationPayload(req.body.title, req.body.body));
    });

    this.app.post('/push/refresh/:id', pushAuth, async (req, res) => {
      await this.sendGenericPushNotificationAndRespond(req, res, makeSilentRefreshNotificationPayload());
    });

    this.app.post('/push/:id', pushAuth, async (req, res) => {
      await this.sendGenericPushNotificationAndRespond(req, res, req.body);
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
          inactiveIDs.map((id) => deleteMeLogFn(id, this.sendGenericPushNotification(id,
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
          inactiveIDs.map((id) => deleteMeLogFn(id, this.sendGenericPushNotification(id,
            makeSilentRefreshNotificationPayload())));
        } catch (e) {
          this.logger.error(`Error when getting inactive users: ${e}`, { source: 'api' });
        }
      }, autoRefreshSettings.performOncePerMs);
    }

    const options = { since: 'now', live: true, include_docs: true, return_docs: false };
    this.mobileViewmodelDb().changes(options)
      .on('change', (change) => {
        if (!change.doc)
          return;

        if (this.connections.has(change.doc._id))
          this.connections.get(change.doc._id).onViewModelUpdate(change.doc);
      });
  }

  public async listen(port: number) {
    this.server = this.app.listen(port);
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

  private async postEvents(req: express.Request, res: express.Response) {
    const id: string = req.params.id;

    let events = req.body.events;
    if (!(events instanceof Array)) {
      this.logAndSendErrorResponse(req, res, 400, 'No events array in request');
      return;
    }

    events = await this.processTokenUpdateEvents(id, events);

    const eventsForLogBefore = CleanEventsForLogging(events);

    const isMobileClient = events.some((event) => event.eventType == '_RefreshModel');
    if (isMobileClient) {
      events = this.filterRefreshModelEventsByTimestamp(id, events);
    }

    try {
      const cutTimestamp = await this.cutTimestamp(id);
      if (!isMobileClient && events.some((event) => event.timestamp <= cutTimestamp)) {
        this.logAndSendErrorResponse(req, res, 409,
          "Can't accept event with timestamp earlier than cut timestamp: they won't get processed!");
        return;
      }
      events = events.filter((value: any) => value.timestamp > cutTimestamp);

      if (isMobileClient) {
        if (this.connections.has(id)) {
          this.logAndSendErrorResponse(req, res, 429, 'Multiple connections from one client are not allowed');
          return;
        }
        this.connections.set(id, new Connection(this.dbContainer.eventsDb(), this.settings.viewmodelUpdateTimeout));

        const eventsForLogAfter = CleanEventsForLogging(events);

        const viewModelTimestampBefore = await this.latestExistingMobileEventTimestamp(id);
        this.connections.get(id).processEvents(id, events).then(async (s: StatusAndBody) => {
          if (s.status == 200) {
            await this.sendPushNotifications(viewModelTimestampBefore, s.body.viewModel);
            this.logSuccessfulResponse(req, eventsForLogBefore, eventsForLogAfter, s.status);
          }
          else {
            this.logHalfSuccessfulResponse(req, eventsForLogBefore, eventsForLogAfter, s.status);
          }
          res.status(s.status).send(s.body);
          this.connections.delete(id);
        });
      } else {
        // In this case we don't need to subscribe for viewmodel updates or
        // block other clients from connecting.
        // So we don't add Connection to this.connections.
        const connection = new Connection(this.dbContainer.eventsDb(), 0);
        connection.processEvents(id, events).then((s: StatusAndBody) => {
          this.logSuccessfulResponse(req, eventsForLogBefore, [], s.status);
          res.status(s.status).send(s.body);
        });
      }
    } catch (e) {
      this.returnCharacterNotFoundOrRethrow(e, req, res);
    }
  }

  private async processTokenUpdateEvents(id: string, events: any[]) {
    const tokenUpdatedEvents = events.filter(
      (event) => event.eventType == 'tokenUpdated' && event.data &&
        event.data.token && event.data.token.registrationId);
    if (tokenUpdatedEvents.length > 0) {
      const token = tokenUpdatedEvents[tokenUpdatedEvents.length - 1].data.token.registrationId;
      const existingCharacterWithThatToken =
        await this.dbContainer.accountsDb().query('account/by-push-token', { key: token });
      for (const existingCharacter of existingCharacterWithThatToken.rows) {
        await this.dbContainer.accountsDb().upsert(existingCharacter.id, (accountInfo) => {
          this.logger.info(`Removing token (${token} == ${accountInfo.pushToken}) from character ${existingCharacter.id} to give it to ${id}`)
          delete accountInfo.pushToken;
          return accountInfo;
        });
      }
      await this.dbContainer.accountsDb().upsert(id, (accountInfo) => {
        this.logger.info(`Saving push token`, {characterId: id, source: 'api'})
        accountInfo.pushToken = token;
        return accountInfo;
      });
    }
    return events.filter((event) => event.eventType != 'tokenUpdated');
  }

  // Removes _RefreshModel events which are too far in future
  // (timestamp > current timestamp + settings.tooFarInFutureFilterTime).
  // Then removes all _RefreshModel events except latest one.
  private filterRefreshModelEventsByTimestamp(id, events: any[]): any[] {
    const tooFarInFuturetimestamp = currentTimestamp() + this.settings.tooFarInFutureFilterTime;
    events = events.filter((value: any) =>
      value.eventType != '_RefreshModel' || value.timestamp < tooFarInFuturetimestamp);
    if (events.length == 0) {
      this.logger.warn(`All received events are from the future!`, {characterId: id, source: 'api'});
    }
    const refreshModelEvents = events.filter((event) => event.eventType == '_RefreshModel');

    const lastRefreshModelEventTimestamp =
      Math.max(...refreshModelEvents.map((event) => event.timestamp));
    return events.filter((value: any) =>
      value.eventType != '_RefreshModel' || value.timestamp == lastRefreshModelEventTimestamp);
  }

  private mobileViewmodelDb() { return this.dbContainer.viewModelDb('mobile'); }

  private async latestViewmodelTimestamp(id: string): Promise<number> {
    return (await this.mobileViewmodelDb().get(id)).timestamp;
  }

  private async cutTimestamp(id: string): Promise<number> {
    const [currentViewmodelTimestamp, lastEventTimeStamp] = await Promise.all([
      this.latestViewmodelTimestamp(id),
      this.latestExistingMobileEventTimestamp(id)
    ]);
    return Math.max(currentViewmodelTimestamp, lastEventTimeStamp);
  }

  private async latestExistingMobileEventTimestamp(id: string): Promise<number> {
    const docs = await this.dbContainer.eventsDb().query<any>(characterIdTimestampOnlyRefreshesView,
      { include_docs: true, descending: true, endkey: [id], startkey: [id, {}], limit: 1 });
    return docs.rows.length ? docs.rows[0].doc.timestamp : 0;
  }

  private async getCharactersInactiveForMoreThan(ms: number): Promise<string[]> {
    const docs = await this.mobileViewmodelDb().query('viewmodel/by-timestamp',
      { startkey: 0, endkey: currentTimestamp() - ms });
    return docs.rows.map((doc) => doc.id);
  }

  private returnCharacterNotFoundOrRethrow(e: any, req: express.Request, res: express.Response) {
    if (IsNotFoundError(e))
      this.logAndSendErrorResponse(req, res, 404, 'Character with such id or login is not found');
    else
      throw e;
  }

  private logAndSendErrorResponse(req: express.Request, res: express.Response, status: number, msg: string) {
    const logData = createLogData(req, status);
    logData.msg = msg;
    this.logger.error('Returning error response', logData);
    res.status(status).send(msg);
  }

  private logHalfSuccessfulResponse(req: express.Request, eventTypesBefore: any[],
    eventTypesAfter: any[], status: number) {
    const logData = createLogData(req, status);
    logData.eventTypesBefore = eventTypesBefore;
    logData.eventTypesAfter = eventTypesAfter
    this.logger.error('Successfully put events into DB, but they were not processed in time', logData);
  }

  private logSuccessfulResponse(req: express.Request, eventTypesBefore: any[],
    eventTypesAfter: any[], status: number) {
    const logData = createLogData(req, status);
    logData.eventTypesBefore = eventTypesBefore;
    logData.eventTypesAfter = eventTypesAfter
    this.logger.info('Successfully processed all events and answered back to clien', logData);
  }

  private async sendPushNotifications(timestampBefore: number, updatedViewModel: any): Promise<void> {
    // TODO: Rework this horror
    if (!updatedViewModel.pages) return;
    const changesPage = (updatedViewModel.pages as any[]).find(page => page.viewId == "page:changes");
    if (!changesPage) return;
    await Promise.all(
      (changesPage.body.items as any[])
      .filter(item => item.unixSecondsValue * 1000 > timestampBefore).map(item => {
          return this.sendGenericPushNotification(updatedViewModel.passportScreen.id, makeVisibleNotificationPayload(item.details.header, item.details.text));
        }));
  }

  private async sendGenericPushNotificationAndRespond(req: express.Request, res: express.Response, payload: any) {
    const id: string = await canonicalId(this.dbContainer, req.params.id);
    const statusAndBody = await this.sendGenericPushNotification(id, payload);
    res.status(statusAndBody.status).send(statusAndBody.body);
  }

  private async sendGenericPushNotification(id: string, payload: any): Promise<StatusAndBody> {
    try {
      const pushToken = (await this.dbContainer.accountsDb().get(id)).pushToken;
      if (!pushToken)
        return { status: 404, body: 'No push token for this character' };

      payload.to = pushToken;

      const fcmResponse = await rp.post('https://fcm.googleapis.com/fcm/send', {
        resolveWithFullResponse: true, simple: false,
        headers: { Authorization: 'key=' + this.settings.pushSettings.serverKey },
        json: payload,
      });
      return { status: fcmResponse.statusCode, body: fcmResponse.body };
    } catch (e) {
      if (IsNotFoundError(e))
        return { status: 404, body: 'Character with such id or login is not found' };
      this.logger.error(`Error while sending push notification via FCM: ${e}`, {characterId: id, source: 'api'});
      throw e;
    }
  }

}

export default App;
