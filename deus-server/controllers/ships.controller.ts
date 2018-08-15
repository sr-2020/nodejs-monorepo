import * as PouchDB from 'pouchdb';
import * as PouchDBFind from 'pouchdb-find';
import * as PouchDBUpsert from 'pouchdb-upsert';
PouchDB.plugin(PouchDBUpsert);
PouchDB.plugin(PouchDBFind);

import { CurrentUser, Get, JsonController, Param } from 'routing-controllers';
import { Container } from 'typedi';
import { Event } from '../events.processor';
import { AliceAccount } from '../models/alice-account';
import { currentTimestamp, returnCharacterNotFoundOrRethrow, checkAdmin } from '../utils';
import { DatabasesContainerToken } from '../services/db-container';

export interface EventsRequest {
  events: Event[];
}

@JsonController()
export class ShipsController {
  @Get('/ships/set_shields/:dock/:shield_value')
  public async setShields(
    @CurrentUser() user: AliceAccount,
    @Param('dock') dock: number,
    @Param('shield_value') shieldValue:number
  ) {
    try {
      await checkAdmin(user);

      const db = Container.get(DatabasesContainerToken).objCounterDb();
      await db.upsert('ship_' + dock, (doc) => {
        doc.shield = shieldValue;
        return doc;
      });

      const response = {
        serverTime: currentTimestamp(),
        dock,
      };
      return response;
    } catch (e) {
      returnCharacterNotFoundOrRethrow(e);
    }
  }
}
