import { Event } from 'alice-model-engine-api';

export const getEvent = (characterId: string, eventType: string, data: any, timestamp = Date.now()): Event => ({
    characterId,
    eventType,
    timestamp,
    data,
});

export const getNoOpEvent = (characterId: string, timestamp = Date.now()): Event => ({
    characterId,
    eventType: '_',
    timestamp,
});

export interface PartialEvent {
    eventType: string;
    data?: any;
}

export const getEvents = (characterId: string, events: PartialEvent[],
                          timestamp = Date.now()): Event[] => {
    const result: Event[] = events.map((e, i) => ({
        characterId,
        timestamp: timestamp + i,
        ...e,
    }));

    result.push(getNoOpEvent(characterId, timestamp + events.length));
    return result;
};
