import { Event } from '@sr2020/interface/models/alice-model-engine';
import { LocationApi, SpellTrace } from '@sr2020/interface/models/location.model';
import * as uuid from 'uuid';

const MAX_SPELL_TRACES = 100;

export function reduceManaDensity(api: LocationApi, data: { amount: number }, event: Event) {
  api.model.manaDensity -= data.amount;
  if (api.model.manaDensity < 0) {
    api.model.manaDensity = 0;
  }
}

export function scheduleEvent(api: LocationApi, data: { event: Event; delayInSeconds: number }, _: Event) {
  api.setTimer(uuid.v4(), 1000 * data.delayInSeconds, data.event.eventType, data.event.data);
}

export function increaseManaDensityDelayed(api: LocationApi, data: { amount: number; delayInSeconds: number }, event: Event) {
  api.setTimer(uuid.v4(), 1000 * data.delayInSeconds, reduceManaDensity, { amount: -data.amount });
}

export function recordSpellTrace(api: LocationApi, data: SpellTrace, _: Event) {
  if (api.model.spellTraces.length > MAX_SPELL_TRACES) api.model.spellTraces.shift();
  api.model.spellTraces.push(data);
}
