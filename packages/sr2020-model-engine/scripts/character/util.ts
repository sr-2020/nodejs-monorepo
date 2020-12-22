import * as moment from 'moment';
import { Duration } from 'moment';
import { EffectModelApi, EventModelApi, Modifier } from '@alice/alice-common/models/alice-model-engine';
import { MAX_HISTORY_LINES } from './consts';
import { Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import * as uuid from 'uuid';

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
    priority: Modifier.kDefaultPriority,
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

export function addTemporaryModifierEvent(
  api: EventModelApi<Sr2020Character>,
  data: { modifier: Modifier; durationInSeconds: number; effectDescription: string },
) {
  addTemporaryModifier(api, data.modifier, moment.duration(data.durationInSeconds, 'seconds'), data.effectDescription);
}

// Adds 'self-destructing' modifier. If you need some temporary Effect - use it in the composition with modifierFromEffect.
export function addTemporaryModifier(api: EventModelApi<Sr2020Character>, m: Modifier, duration: Duration, effectDescription: string) {
  api.addModifier(m);
  api.setTimer(uuid.v4(), `Окончание эффекта "${effectDescription}"`, duration, removeModifier, { mID: m.mID });
}

// Implementation detail: we need to have it as an Event handler so we can call it on Timer.
// Don't call directly from the code, use direct api.removeModifier call instead.
export function removeModifier(api: EventModelApi<Sr2020Character>, data: { mID: string }) {
  api.removeModifier(data.mID);
}

// Returns a unix timestamp in ms
export function validUntil(api: EventModelApi<Sr2020Character>, duration: Duration) {
  return api.model.timestamp + duration.asMilliseconds();
}
