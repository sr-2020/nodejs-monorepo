import * as PouchDB from 'pouchdb';
import * as PouchDBFind from 'pouchdb-find';
PouchDB.plugin(PouchDBFind);

import { Body, CurrentUser, JsonController, Param, Post } from 'routing-controllers';
import { Container } from 'typedi';

import { EventsProcessor } from '../events.processor';
import { DatabasesContainerToken } from '../services/db-container';
import { AccessPropagation, checkAccess, currentTimestamp, returnCharacterNotFoundOrRethrow } from '../utils';

import { CharacterlessEvent } from 'alice-model-engine-api';
import { AliceAccount } from '../models/alice-account';

interface LocationEvent {
  eventType: string;
  data?: any;
}

interface LocationEventsRequest {
  events: LocationEvent[];
}

@JsonController()
export class LocationEventsController {
  @Post('/location_events/:locationId')
  public async post( @CurrentUser() user: AliceAccount, @Param('locationId') locationId: string,
                     @Body() body: LocationEventsRequest) {
    try {
      await checkAccess(user, '', AccessPropagation.AdminOnly);

      // Any way to make it better but still be sure that everything will be processed?
      let timestamp = currentTimestamp() + 2000;

      const events: CharacterlessEvent[] = body.events.map((event) => ({...event, timestamp: timestamp++}));

      const modelDb = Container.get(DatabasesContainerToken).modelsDb();
      const charactersInLocation = await modelDb.find({ selector: {location: locationId}});
      const processor = new EventsProcessor();
      for (const character of charactersInLocation.docs)
        await processor.process(character._id, { events });

      return { receivers: charactersInLocation.docs.map((r) => r._id) };
    } catch (e) {
      returnCharacterNotFoundOrRethrow(e);
    }
  }
}
