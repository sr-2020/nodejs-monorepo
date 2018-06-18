import * as PouchDB from 'pouchdb';
import * as PouchDBFind from 'pouchdb-find';
PouchDB.plugin(PouchDBFind);

import { Body, CurrentUser, JsonController, Param, Post } from 'routing-controllers';
import { Container } from 'typedi';

import { EventsProcessor } from '../events.processor';
import { Account, DatabasesContainerToken } from '../services/db-container';
import { AccessPropagation, checkAccess, currentTimestamp, returnCharacterNotFoundOrRethrow } from '../utils';
import { EventsRequest } from './events.controller';

@JsonController()
export class LocationEventsController {
  @Post('/location_events/:locationId')
  public async post( @CurrentUser() user: Account, @Param('locationId') locationId: string,
                     @Body() body: EventsRequest) {
    try {
      await checkAccess(user, '', AccessPropagation.AdminOnly);

      {0;
        // Any way to make it better but still be sure that everything will be processed?
        let timestamp = currentTimestamp() + 2000;
        for (const event of body.events)
          event.timestamp = timestamp++;
      }

      const modelDb = Container.get(DatabasesContainerToken).modelsDb();
      const charactersInLocation = await modelDb.find({ selector: {location: locationId}});
      const processor = new EventsProcessor();
      for (const character of charactersInLocation.docs)
        await processor.process(character._id, body.events);

      return { receivers: charactersInLocation.docs.map((r) => r._id) };
    } catch (e) {
      returnCharacterNotFoundOrRethrow(e);
    }
  }
}
