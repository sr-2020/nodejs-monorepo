import { Duration } from 'moment';
import { Modifier, EventModelApi, EffectModelApi } from '@sr2020/interface/models/alice-model-engine';
import { MAX_HISTORY_LINES } from './consts';
import uuid = require('uuid');
import * as moment from 'moment';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';

export function addHistoryRecord(api: EventModelApi<Sr2020Character>, title: string, shortText = '', longText = '') {
  if (api.model.history.length >= MAX_HISTORY_LINES) api.model.history.shift();

  api.model.history.push({
    id: uuid.v4(),
    title,
    shortText,
    longText,
    timestamp: api.model.timestamp,
  });
}

export function sendNotificationAndHistoryRecord(api: EventModelApi<Sr2020Character>, title: string, shortText = '', longText = '') {
  api.sendNotification(title, shortText);
  addHistoryRecord(api, title, shortText, longText);
}

// Сreates an modifier having a single Effect. additionalData will be embedded into Modifier so effect handler will be able
// access it.
export function modifierFromEffect<T>(
  effect: (api: EffectModelApi<Sr2020Character>, m: Modifier & T) => void,
  additionalData: T,
  reason: string = '',
): Modifier {
  const handler = effect.name;
  return {
    ...additionalData,
    mID: handler + '-' + uuid.v4(),
    enabled: true,
    class: reason,
    effects: [
      {
        enabled: true,
        type: 'normal',
        handler,
      },
    ],
  };
}

export function addTemporaryModifierEvent(api: EventModelApi<Sr2020Character>, data: { modifier: Modifier; durationInSeconds: number }) {
  addTemporaryModifier(api, data.modifier, moment.duration(data.durationInSeconds, 'seconds'));
}

// Adds 'self-destructing' modifier. If you need some temporary Effect - use it in the composition with modifierFromEffect.
export function addTemporaryModifier(api: EventModelApi<Sr2020Character>, m: Modifier, duration: Duration) {
  api.addModifier(m);
  api.setTimer(uuid.v4(), duration, removeModifier, { mID: m.mID });
}

// Implementation detail: we need to have it as an Event handler so we can call it on Timer.
// Don't call directly from the code, use direct api.removeModifier call instead.
export function removeModifier(api: EventModelApi<Sr2020Character>, data: { mID: string }) {
  api.removeModifier(data.mID);
}

// Returns a unix timestamp in ms
export function validUntil(api: EffectModelApi<Sr2020Character>, duration: Duration) {
  return api.model.timestamp + duration.asMilliseconds();
}
