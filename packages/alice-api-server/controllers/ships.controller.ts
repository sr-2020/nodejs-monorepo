import * as PouchDB from 'pouchdb';
import * as PouchDBFind from 'pouchdb-find';
import * as PouchDBUpsert from 'pouchdb-upsert';
PouchDB.plugin(PouchDBUpsert);
PouchDB.plugin(PouchDBFind);

import { CharacterlessEvent } from 'alice-model-engine-api';
import { CurrentUser, Get, JsonController, Param } from 'routing-controllers';
import { Container } from 'typedi';
import { AliceAccount } from '../models/alice-account';
import { DatabasesContainerToken } from '../services/db-container';
import { checkAdmin, currentTimestamp, returnCharacterNotFoundOrRethrow } from '../utils';

export interface EventsRequest {
  events: CharacterlessEvent[];
}

@JsonController()
export class ShipsController {
  @Get('/ships/set_shields/:dock/:shield_value')
  public async setShields(
    @CurrentUser() user: AliceAccount,
    @Param('dock') dock: number,
    @Param('shield_value') shieldValue: number,
  ) {
    try {
      await checkAdmin(user);

      const db = Container.get(DatabasesContainerToken).objCounterDb();
      await db.upsert('ship_' + dock, (doc: any) => {
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
