import * as PouchDB from 'pouchdb';

import { JsonController, Post, CurrentUser, Body, BadRequestError, Param } from "routing-controllers";
import { Container } from "typedi";

import { DatabasesContainerToken, Account } from "../services/db-container";
import { returnCharacterNotFoundOrRethrow, checkAccess, currentTimestamp, AccessPropagation } from "../utils";
import { EventsRequest } from "./events.controller";
import * as rp from 'request-promise';
import { ApplicationSettingsToken } from "../services/settings";

@JsonController()
export class LocationEventsController {
  @Post("/location_events/:locationId")
  async post( @CurrentUser() user: Account, @Param("locationId") locationId: string, @Body() body: EventsRequest) {
    try {
      await checkAccess(user, '', AccessPropagation.AdminOnly);

      {
        // Any way to make it better but still be sure that everything will be processed?
        let timestamp = currentTimestamp() + 2000;
        for (const event of body.events)
          event.timestamp = timestamp++;
      }

      const modelDb = Container.get(DatabasesContainerToken).modelsDb();
      const charactersInLocation = await modelDb.query('model/by-location', { key: locationId });
      const eventsEndpoint = `http://localhost:${Container.get(ApplicationSettingsToken).port}/events/`;

      for (const character of charactersInLocation.rows)
        await rp.post(eventsEndpoint + character.id, {
          json: { events: body.events },
          auth: { username: user._id, password: user.password },
        }).promise();

      return { receivers: charactersInLocation.rows.map(r => r.id) };
    }
    catch (e) {
      returnCharacterNotFoundOrRethrow(e);
    }
  }
}
