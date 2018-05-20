import * as express from 'express';
import * as PouchDB from 'pouchdb';
import * as PouchDBUpsert from 'pouchdb-upsert';
import * as PouchDBFind from 'pouchdb-find';
PouchDB.plugin(PouchDBUpsert);
PouchDB.plugin(PouchDBFind);

import { JsonController, Get, CurrentUser, Param, Post, Body, HttpError, Res, BadRequestError, Req } from "routing-controllers";
import { canonicalId, returnCharacterNotFoundOrRethrow, currentTimestamp, checkAccess, createLogData } from "../utils";
import { characterIdTimestampOnlyRefreshesView } from "../consts";
import { Container } from "typedi";
import { DatabasesContainerToken, Account } from "../services/db-container";
import { LoggerToken } from "../services/logger";
import { ApplicationSettingsToken } from "../services/settings";
import { Connection, StatusAndBody } from "../connection";
import { sendGenericPushNotification, makeVisibleNotificationPayload } from "../push-helpers";
import { Event, EventsProcessor } from "../events.processor";

export interface EventsRequest {
  events: Event[]
}

function CleanEventsForLogging(events: Event[]): Event[] {
  return events.map((event) => {
    return {
      eventType: event.eventType,
      timestamp: event.timestamp
    }
  });
}

@JsonController()
export class EventsController {
  private logger = Container.get(LoggerToken);

  @Get("/events/:id")
  async get( @CurrentUser() user: Account, @Param("id") id: string) {
    try {
      id = await canonicalId(id);
      await checkAccess(user, id);
      const response = {
        serverTime: currentTimestamp(),
        id,
        timestamp: await new EventsProcessor().cutTimestamp(id),
      };
      return response;
    } catch (e) {
      returnCharacterNotFoundOrRethrow(e);
    }
  }

  @Post("/events/:id")
  async post( @CurrentUser() user: Account, @Param("id") id: string, @Body() body: EventsRequest,
    @Req() req: express.Request, @Res() res: express.Response) {
    try {
      id = await canonicalId(id);
      await checkAccess(user, id);

      let events = body.events;
      if (!(events instanceof Array))
        throw new BadRequestError('No events array in request');

      const processor = new EventsProcessor();
      const viewModelTimestampBefore = await processor.latestExistingMobileEventTimestamp(id);
      const s = await processor.process(id, events);

      if (s.status == 200) {
        await this.sendPushNotifications(viewModelTimestampBefore, s.body.viewModel);
        this.logSuccessfulResponse(req, CleanEventsForLogging(events), s.status);
      }
      else {
        this.logHalfSuccessfulResponse(req, CleanEventsForLogging(events), s.status);
      }
      res.status(s.status);
      return s.body;
    } catch (e) {
      returnCharacterNotFoundOrRethrow(e);
    }

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

  private logHalfSuccessfulResponse(req: express.Request, eventTypes: Event[], status: number) {
    const logData = createLogData(req, status);
    logData.eventTypes = eventTypes;
    this.logger.error('Successfully put events into DB, but they were not processed in time', logData);
  }

  private logSuccessfulResponse(req: express.Request, eventTypes: Event[], status: number) {
    const logData = createLogData(req, status);
    logData.eventTypes = eventTypes;
    this.logger.info('Successfully processed all events and answered back to client', logData);
  }
}
