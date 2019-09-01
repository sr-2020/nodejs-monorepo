import { Sr2020CharacterApi } from '@sr2020/interface/models/sr2020-character.model';
import { Event, Modifier } from '@sr2020/interface/models/alice-model-engine';
import { MAX_HISTORY_LINES } from './consts';
import uuid = require('uuid');

export function addHistoryRecord(api: Sr2020CharacterApi, title: string, shortText: string = '', longText = '') {
  if (api.model.history.length >= MAX_HISTORY_LINES) api.model.history.shift();

  api.model.history.push({
    id: uuid.v4(),
    title,
    shortText,
    longText,
    timestamp: api.model.timestamp,
  });
}

export function sendNotificationAndHistoryRecord(api: Sr2020CharacterApi, title: string, shortText: string = '', longText = '') {
  api.sendNotification(title, shortText);
  addHistoryRecord(api, title, shortText, longText);
}

// Сreates an modifier having a single Effect. additionalData will be embedded into Modifier so effect handler will be able
// access it.
export function modifierFromEffect(effect: (api: Sr2020CharacterApi, m: Modifier) => void, additionalData: any = {}): Modifier {
  const handler = effect.name;
  return {
    ...additionalData,
    mID: handler + '-' + uuid.v4(),
    enabled: true,
    effects: [
      {
        enabled: true,
        type: 'normal',
        handler,
      },
    ],
  };
}

// Adds 'self-destructing' modifier. If you need some temporary Effect - use it in the composition with modifierFromEffect.
export function addTemporaryModifier(api: Sr2020CharacterApi, m: Modifier, durationInSeconds: number) {
  api.addModifier(m);
  api.setTimer(uuid.v4(), durationInSeconds * 1000, removeModifier, { mID: m.mID });
}

// Implementation detail: we need to have it as an Event handler so we can call it on Timer.
// Don't call directly from the code, use direct api.removeModifier call instead.
export function removeModifier(api: Sr2020CharacterApi, data: { mID: string }, _: Event) {
  api.removeModifier(data.mID);
}
