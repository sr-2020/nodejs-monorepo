import { Event } from '@alice/alice-common/models/alice-model-engine';

const REFRESH_EVENT_TYPE = '_RefreshModel';

export const getEvent = (characterId: string, eventType: string, data: any, timestamp = Date.now()): Event => ({
  modelId: characterId,
  eventType,
  timestamp,
  data,
});

export const getRefreshEvent = (characterId: string, timestamp = Date.now()): Event => ({
  modelId: characterId,
  eventType: REFRESH_EVENT_TYPE,
  timestamp,
});

type PartialEvent = { eventType: string; data?: any };

export const getEvents = (characterId: string, events: PartialEvent[], timestamp = Date.now(), withRefresh = true): Event[] => {
  const result: Event[] = events.map((e, i) => ({
    modelId: characterId,
    timestamp: timestamp + i,
    ...e,
  }));

  if (withRefresh) {
    result.push(getRefreshEvent(characterId, timestamp + events.length));
  }

  return result;
};
