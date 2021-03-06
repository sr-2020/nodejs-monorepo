import { Event } from '@alice/alice-common/models/alice-model-engine';

export function getEvent(characterId: string, eventType: string, data: any, timestamp = Date.now()): Event {
  return {
    modelId: characterId,
    eventType,
    timestamp,
    data,
  };
}

export function getNoOpEvent(characterId: string, timestamp = Date.now()): Event {
  return {
    modelId: characterId,
    eventType: '_',
    timestamp,
  };
}

export interface PartialEvent {
  eventType: string;
  data?: any;
}

export function getEvents(characterId: string, events: PartialEvent[], timestamp = Date.now()): Event[] {
  const result: Event[] = events.map((e, i) => ({
    modelId: characterId,
    timestamp: timestamp + i,
    ...e,
  }));

  result.push(getNoOpEvent(characterId, timestamp + events.length));
  return result;
}
