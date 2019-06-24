import * as PouchDB from 'pouchdb';
import * as PouchDBUpsert from 'pouchdb-upsert';
PouchDB.plugin(PouchDBUpsert);
import { CharacterlessEvent } from 'alice-model-engine-api';
import { HttpError } from 'routing-controllers';
import { Container } from 'typedi';
import { Connection, ProcessRequest, StatusAndBody } from './connection';
import { DatabasesContainerToken } from './services/db-container';
import { LoggerToken } from './services/logger';
import { ApplicationSettingsToken } from './services/settings';
import { currentTimestamp } from './utils';

export class EventsProcessor {
  private logger = Container.get(LoggerToken);

  public async process(id: string, request: ProcessRequest): Promise<StatusAndBody> {
    request.events = await this.processTokenUpdateEvents(id, request.events);
    this._cancelUpdateIfTooFarInFuture(id, request);
    const cutTimestamp = await this.cutTimestamp(id);

    // If request.scheduledUpdateTimestamp is present, it means that events have come
    // from mobile client. It's possible that some of them were already processed if
    // previous connection attempt was not successful.
    if (!request.scheduledUpdateTimestamp &&
        request.events.some((event) => event.timestamp <= cutTimestamp))
      throw new HttpError(409,
        "Can't accept event with timestamp earlier than cut timestamp: they won't get processed!");

    request.events = request.events.filter((value: any) => value.timestamp > cutTimestamp);

    const connection = new Connection(this.dbContainer().eventsDb(),  this.dbContainer().metadataDb(),
      Container.get(ApplicationSettingsToken).viewmodelUpdateTimeout);
    if (request.scheduledUpdateTimestamp) {
      if (this.dbContainer().connections.has(id))
        throw new HttpError(429, 'Multiple connections from one client are not allowed');

      this.dbContainer().connections.set(id, connection);
      const s = await this.dbContainer().connections.get(id).processEvents(id, request);
      this.dbContainer().connections.delete(id);
      return s;
    } else {
      // In this case we don't need to subscribe for viewmodel updates or
      // block other clients from connecting.
      // So we don't add Connection to this.connections.
      return await connection.processEvents(id, request);
    }
  }

  public async cutTimestamp(id: string): Promise<number> {
    const [currentViewmodelTimestamp, lastEventTimeStamp] = await Promise.all([
      this.latestViewmodelTimestamp(id),
      this.latestExistingMobileEventTimestamp(id),
    ]);
    return Math.max(currentViewmodelTimestamp, lastEventTimeStamp);
  }

  public async latestExistingMobileEventTimestamp(id: string): Promise<number> {
    try {
      return (await this.dbContainer().metadataDb().get(id)).scheduledUpdateTimestamp;
    } catch (e) {
      if (e.status == 404) {
        return 0;
      } else {
        throw e;
      }
    }
  }

  private dbContainer() {
    return Container.get(DatabasesContainerToken);
  }

  private async processTokenUpdateEvents(id: string, events: CharacterlessEvent[]) {
    const tokenUpdatedEvents = events.filter(
      (event) => event.eventType == 'tokenUpdated' && event.data &&
        event.data.token && event.data.token.registrationId);
    if (tokenUpdatedEvents.length > 0) {
      const token = tokenUpdatedEvents[tokenUpdatedEvents.length - 1].data.token.registrationId;
      const existingCharacterWithThatToken =
        await this.dbContainer().accountsDb().find({ selector: { pushToken: token } });
      for (const existingCharacter of existingCharacterWithThatToken.docs) {
        await this.dbContainer().accountsDb().upsert(existingCharacter._id, (accountInfo: any) => {
          this.logger.info(`Removing token (${token} == ${accountInfo.pushToken}) ` +
            `from character ${existingCharacter._id} to give it to ${id}`);
          delete accountInfo.pushToken;
          return accountInfo;
        });
      }
      await this.dbContainer().accountsDb().upsert(id, (accountInfo: any) => {
        this.logger.info(`Saving push token`, { characterId: id, source: 'api' });
        accountInfo.pushToken = token;
        return accountInfo;
      });
    }
    return events.filter((event) => event.eventType != 'tokenUpdated');
  }

  private _cancelUpdateIfTooFarInFuture(id: string, request: ProcessRequest) {
    const tooFarInFutureFilterTime = Container.get(ApplicationSettingsToken).tooFarInFutureFilterTime;
    if (request.scheduledUpdateTimestamp && tooFarInFutureFilterTime &&
      request.scheduledUpdateTimestamp > currentTimestamp() + tooFarInFutureFilterTime) {
        this.logger.error(
          `Received request with scheduledUpdateTimestamp too far in future. Somebody messing with time?`,
          { source: 'api', characterId: id });
        request.scheduledUpdateTimestamp = undefined;
    }
  }

  private async latestViewmodelTimestamp(id: string): Promise<number> {
    return (await this.dbContainer().viewModelDb('mobile').get(id)).timestamp;
  }
}
