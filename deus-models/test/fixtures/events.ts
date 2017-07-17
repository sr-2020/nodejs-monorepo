import { Event } from 'deus-engine-manager-api';

const REFRESH_EVENT_TYPE = "_RefreshModel";

export const getEvent = (characterId: string, eventType: string, data: any, timestamp = Date.now()): Event => ({
    characterId,
    eventType,
    timestamp,
    data
});

export const getRefreshEvent = (characterId: string, timestamp = Date.now()): Event => ({
    characterId,
    eventType: REFRESH_EVENT_TYPE,
    timestamp
});

type PartialEvent = { eventType: string, data: any }

export const getEvents = (characterId: string, events: PartialEvent[], timestamp = Date.now(), withRefresh = true): Event[] => {
    let result: Event[] = events.map((e, i) => ({
        characterId,
        timestamp: timestamp + i,
        ...e
    }));

    if (withRefresh) {
        result.push(getRefreshEvent(characterId, timestamp + events.length));
    }

    return result;
};
