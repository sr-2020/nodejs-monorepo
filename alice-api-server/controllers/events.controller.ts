import * as express from 'express';
import * as PouchDB from 'pouchdb';
import * as PouchDBFind from 'pouchdb-find';
import * as PouchDBUpsert from 'pouchdb-upsert';
PouchDB.plugin(PouchDBUpsert);
PouchDB.plugin(PouchDBFind);

import { BadRequestError, Body, CurrentUser, Get, JsonController, Param, Post, Req, Res } from 'routing-controllers';
import { Container } from 'typedi';
import { Event, EventsProcessor } from '../events.processor';
import { AliceAccount } from '../models/alice-account';
import { makeVisibleNotificationPayload, sendGenericPushNotification } from '../push-helpers';
import { LoggerToken } from '../services/logger';
import { canonicalId, checkAccess, createLogData, currentTimestamp, returnCharacterNotFoundOrRethrow } from '../utils';

export interface EventsRequest {
  events: Event[];
}

function CleanEventsForLogging(events: Event[]): Event[] {
  return events.map((event) => {
    return {
      eventType: event.eventType,
      timestamp: event.timestamp,
    };
  });
}

@JsonController()
export class EventsController {
  private logger = Container.get(LoggerToken);

  @Get('/events/:id')
  public async get( @CurrentUser() user: AliceAccount, @Param('id') id: string) {
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

  @Post('/events/:id')
  public async post( @CurrentUser() user: AliceAccount, @Param('id') id: string, @Body() body: EventsRequest,
                     @Req() req: express.Request, @Res() res: express.Response) {
    try {
      id = await canonicalId(id);
      await checkAccess(user, id);

      const events = body.events;
      if (!(events instanceof Array))
        throw new BadRequestError('No events array in request');

      const processor = new EventsProcessor();
      const viewModelTimestampBefore = await processor.latestExistingMobileEventTimestamp(id);
      const s = await processor.process(id, events);

      if (s.status == 200) {
        await this.sendPushNotifications(viewModelTimestampBefore, s.body.viewModel);
        this.logSuccessfulResponse(req, CleanEventsForLogging(events), s.status);
      } else {
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
    const changesPage = (updatedViewModel.pages as any[]).find((page) => page.viewId == 'page:changes');
    if (!changesPage) return;
    await Promise.all(
      (changesPage.body.items as any[])
        .filter((item) => item.unixSecondsValue * 1000 > timestampBefore).map((item) => {
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
