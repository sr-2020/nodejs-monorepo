import { HttpError } from 'routing-controllers';
import { Container } from 'typedi';
import { Connection, StatusAndBody } from './connection';
import { characterIdTimestampOnlyRefreshesView } from './consts';
import { DatabasesContainerToken } from './services/db-container';
import { LoggerToken } from './services/logger';
import { ApplicationSettingsToken } from './services/settings';
import { currentTimestamp } from './utils';

export interface Event {
  eventType: string;
  timestamp: number;
  data?: any;
}

export class EventsProcessor {
  private logger = Container.get(LoggerToken);

  public async process(id: string, events: Event[]): Promise<StatusAndBody> {
    events = await this.processTokenUpdateEvents(id, events);
    const isMobileClient = events.some((event) => event.eventType == '_RefreshModel');
    if (isMobileClient) {
      events = this.filterRefreshModelEventsByTimestamp(id, events);
    }
    const cutTimestamp = await this.cutTimestamp(id);
    if (!isMobileClient && events.some((event) => event.timestamp <= cutTimestamp))
      throw new HttpError(409,
        "Can't accept event with timestamp earlier than cut timestamp: they won't get processed!");
    events = events.filter((value: any) => value.timestamp > cutTimestamp);
    if (isMobileClient) {
      if (this.dbContainer().connections.has(id))
        throw new HttpError(429, 'Multiple connections from one client are not allowed');

      this.dbContainer().connections.set(id, new Connection(this.dbContainer().eventsDb(),
        Container.get(ApplicationSettingsToken).viewmodelUpdateTimeout));

      const s = await this.dbContainer().connections.get(id).processEvents(id, events);
      this.dbContainer().connections.delete(id);
      return s;
    } else {
      // In this case we don't need to subscribe for viewmodel updates or
      // block other clients from connecting.
      // So we don't add Connection to this.connections.
      const connection = new Connection(this.dbContainer().eventsDb(), 0);
      return await connection.processEvents(id, events);
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
    const docs = await this.dbContainer().eventsDb().query<any>(characterIdTimestampOnlyRefreshesView,
      { include_docs: true, descending: true, endkey: [id], startkey: [id, {}], limit: 1 });
    return docs.rows.length ? docs.rows[0].doc.timestamp : 0;
  }

  private dbContainer() {
    return Container.get(DatabasesContainerToken);
  }

  private async processTokenUpdateEvents(id: string, events: Event[]) {
    const tokenUpdatedEvents = events.filter(
      (event) => event.eventType == 'tokenUpdated' && event.data &&
        event.data.token && event.data.token.registrationId);
    if (tokenUpdatedEvents.length > 0) {
      const token = tokenUpdatedEvents[tokenUpdatedEvents.length - 1].data.token.registrationId;
      const existingCharacterWithThatToken =
        await this.dbContainer().accountsDb().find({ selector: { pushToken: token } });
      for (const existingCharacter of existingCharacterWithThatToken.docs) {
        await this.dbContainer().accountsDb().upsert(existingCharacter._id, (accountInfo) => {
          this.logger.info(`Removing token (${token} == ${accountInfo.pushToken}) ` +
            `from character ${existingCharacter._id} to give it to ${id}`);
          delete accountInfo.pushToken;
          return accountInfo;
        });
      }
      await this.dbContainer().accountsDb().upsert(id, (accountInfo) => {
        this.logger.info(`Saving push token`, { characterId: id, source: 'api' });
        accountInfo.pushToken = token;
        return accountInfo;
      });
    }
    return events.filter((event) => event.eventType != 'tokenUpdated');
  }

  // Removes _RefreshModel events which are too far in future
  // (timestamp > current timestamp + settings.tooFarInFutureFilterTime).
  // Then removes all _RefreshModel events except latest one.
  private filterRefreshModelEventsByTimestamp(id, events: Event[]): Event[] {
    const tooFarInFuturetimestamp = currentTimestamp() +
      Container.get(ApplicationSettingsToken).tooFarInFutureFilterTime;
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

  private async latestViewmodelTimestamp(id: string): Promise<number> {
    return (await this.dbContainer().viewModelDb('mobile').get(id)).timestamp;
  }
}
