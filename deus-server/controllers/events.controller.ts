import * as express from 'express';
import * as PouchDB from 'pouchdb';
import * as PouchDBUpsert from 'pouchdb-upsert';
PouchDB.plugin(PouchDBUpsert);

import { JsonController, Get, CurrentUser, Param, Post, Body, HttpError, Res, BadRequestError, Req } from "routing-controllers";
import { canonicalId, returnCharacterNotFoundOrRethrow, currentTimestamp, checkAccess, createLogData } from "../utils";
import { characterIdTimestampOnlyRefreshesView } from "../consts";
import { Container } from "typedi";
import { DatabasesContainerToken } from "../services/db-container";
import { LoggerToken } from "../services/logger";
import { ApplicationSettingsToken } from "../services/settings";
import { Connection, StatusAndBody } from "../connection";
import { sendGenericPushNotification, makeVisibleNotificationPayload } from "../push-helpers";

interface Event {
  eventType: string,
  timestamp: number
}

interface EventsRequest {
  events: Event[]
}

function CleanEventsForLogging(events: any[]) {
  return events.map((event) => {
    return {
      type: event.eventType,
      timestamp: event.timestamp
    }
  });
}

@JsonController()
export class EventsController {
  private logger = Container.get(LoggerToken);

  @Get("/events/:id")
  async get( @CurrentUser() user: string, @Param("id") id: string) {
    try {
      id = await canonicalId(id);
      await checkAccess(user, id);
      const response = {
        serverTime: currentTimestamp(),
        id,
        timestamp: await this.cutTimestamp(id),
      };
      return response;
    } catch (e) {
      returnCharacterNotFoundOrRethrow(e);
    }
  }

  @Post("/events/:id")
  async post( @CurrentUser() user: string, @Param("id") id: string, @Body() body: any,
    @Req() req: express.Request, @Res() res: express.Response)
  {
    try {
      id = await canonicalId(id);
      await checkAccess(user, id);

      let events = body.events;
      if (!(events instanceof Array))
        throw new BadRequestError('No events array in request');

      events = await this.processTokenUpdateEvents(id, events);
      const eventsForLogBefore = CleanEventsForLogging(events);
      const isMobileClient = events.some((event) => event.eventType == '_RefreshModel');
      if (isMobileClient) {
        events = this.filterRefreshModelEventsByTimestamp(id, events);
      }
      const cutTimestamp = await this.cutTimestamp(id);
      if (!isMobileClient && events.some((event) => event.timestamp <= cutTimestamp))
        throw new HttpError(409, "Can't accept event with timestamp earlier than cut timestamp: they won't get processed!");
      events = events.filter((value: any) => value.timestamp > cutTimestamp);
      if (isMobileClient) {
        if (this.dbContainer().connections.has(id))
          throw new HttpError(429, 'Multiple connections from one client are not allowed');

        this.dbContainer().connections.set(id, new Connection(this.dbContainer().eventsDb(),
          Container.get(ApplicationSettingsToken).viewmodelUpdateTimeout));

        const eventsForLogAfter = CleanEventsForLogging(events);
        const viewModelTimestampBefore = await this.latestExistingMobileEventTimestamp(id);
        const s = await this.dbContainer().connections.get(id).processEvents(id, events);
        if (s.status == 200) {
          await this.sendPushNotifications(viewModelTimestampBefore, s.body.viewModel);
          this.logSuccessfulResponse(req, eventsForLogBefore, eventsForLogAfter, s.status);
        }
        else {
          this.logHalfSuccessfulResponse(req, eventsForLogBefore, eventsForLogAfter, s.status);
        }
        this.dbContainer().connections.delete(id);
        res.status(s.status);
        return s.body;
      } else {
        // In this case we don't need to subscribe for viewmodel updates or
        // block other clients from connecting.
        // So we don't add Connection to this.connections.
        const connection = new Connection(this.dbContainer().eventsDb(), 0);
        const s = await connection.processEvents(id, events);
        res.status(s.status);
        return s.body;
      }
    } catch (e) {
      returnCharacterNotFoundOrRethrow(e);
    }

  }

  private dbContainer() {
    return Container.get(DatabasesContainerToken);
  }

  private async cutTimestamp(id: string): Promise<number> {
    const [currentViewmodelTimestamp, lastEventTimeStamp] = await Promise.all([
      this.latestViewmodelTimestamp(id),
      this.latestExistingMobileEventTimestamp(id)
    ]);
    return Math.max(currentViewmodelTimestamp, lastEventTimeStamp);
  }

  private async latestViewmodelTimestamp(id: string): Promise<number> {
    return (await this.dbContainer().viewModelDb('mobile').get(id)).timestamp;
  }

  private async latestExistingMobileEventTimestamp(id: string): Promise<number> {
    const docs = await this.dbContainer().eventsDb().query<any>(characterIdTimestampOnlyRefreshesView,
      { include_docs: true, descending: true, endkey: [id], startkey: [id, {}], limit: 1 });
    return docs.rows.length ? docs.rows[0].doc.timestamp : 0;
  }

  private async processTokenUpdateEvents(id: string, events: any[]) {
    const tokenUpdatedEvents = events.filter(
      (event) => event.eventType == 'tokenUpdated' && event.data &&
        event.data.token && event.data.token.registrationId);
    if (tokenUpdatedEvents.length > 0) {
      const token = tokenUpdatedEvents[tokenUpdatedEvents.length - 1].data.token.registrationId;
      const existingCharacterWithThatToken =
        await this.dbContainer().accountsDb().query('account/by-push-token', { key: token });
      for (const existingCharacter of existingCharacterWithThatToken.rows) {
        await this.dbContainer().accountsDb().upsert(existingCharacter.id, (accountInfo) => {
          this.logger.info(`Removing token (${token} == ${accountInfo.pushToken}) from character ${existingCharacter.id} to give it to ${id}`)
          delete accountInfo.pushToken;
          return accountInfo;
        });
      }
      await this.dbContainer().accountsDb().upsert(id, (accountInfo) => {
        this.logger.info(`Saving push token`, { characterId: id, source: 'api' })
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
    const tooFarInFuturetimestamp = currentTimestamp() + Container.get(ApplicationSettingsToken).tooFarInFutureFilterTime;
    events = events.filter((value: any) =>
      value.eventType != '_RefreshModel' || value.timestamp < tooFarInFuturetimestamp);
    if (events.length == 0) {
      this.logger.warn(`All received events are from the future!`, { characterId: id, source: 'api' });
    }
    const refreshModelEvents = events.filter((event) => event.eventType == '_RefreshModel');

    const lastRefreshModelEventTimestamp =
      Math.max(...refreshModelEvents.map((event) => event.timestamp));
    return events.filter((value: any) =>
      value.eventType != '_RefreshModel' || value.timestamp == lastRefreshModelEventTimestamp);
  }

  private async sendPushNotifications(timestampBefore: number, updatedViewModel: any): Promise<void> {
    // TODO: Rework this horror
    if (!updatedViewModel.pages) return;
    const changesPage = (updatedViewModel.pages as any[]).find(page => page.viewId == "page:changes");
    if (!changesPage) return;
    await Promise.all(
      (changesPage.body.items as any[])
        .filter(item => item.unixSecondsValue * 1000 > timestampBefore).map(item => {
          return sendGenericPushNotification(updatedViewModel.passportScreen.id,
            makeVisibleNotificationPayload(item.details.header, item.details.text));
        }));
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
}
