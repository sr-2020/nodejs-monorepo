import { Event, EventModelApi } from '@sr2020/interface/models/alice-model-engine';
import { SpellTrace, Location } from '@sr2020/interface/models/location.model';
import * as uuid from 'uuid';
import { duration } from 'moment';

const MAX_SPELL_TRACES = 100;

export function reduceManaDensity(api: EventModelApi<Location>, data: { amount: number }) {
  api.model.manaDensity -= data.amount;
  if (api.model.manaDensity < 0) {
    api.model.manaDensity = 0;
  }
}

export function scheduleEvent(api: EventModelApi<Location>, data: { event: Event; delayInSeconds: number }) {
  api.setTimer(uuid.v4(), duration(data.delayInSeconds, 'seconds'), data.event.eventType, data.event.data);
}

export function increaseManaDensityDelayed(api: EventModelApi<Location>, data: { amount: number; delayInSeconds: number }) {
  api.setTimer(uuid.v4(), duration(data.delayInSeconds, 'seconds'), reduceManaDensity, { amount: -data.amount });
}

export function recordSpellTrace(api: EventModelApi<Location>, data: SpellTrace) {
  if (api.model.spellTraces.length > MAX_SPELL_TRACES) api.model.spellTraces.shift();
  api.model.spellTraces.push(data);
}

export function shiftSpellTraces(api: EventModelApi<Location>, data: { shiftTimeSeconds: number; maxLookupSeconds: number }) {
  api.model.spellTraces = api.model.spellTraces
    .map((trace) => {
      if (trace.timestamp >= api.model.timestamp - data.maxLookupSeconds * 1000) trace.timestamp -= data.shiftTimeSeconds * 1000;
      return trace;
    })
    .sort((t1, t2) => t1.timestamp - t2.timestamp);
}

export function brasiliaEffect(api: EventModelApi<Location>, data: { durationMinutes: number }) {
  for (let i = 1; i <= data.durationMinutes; ++i) {
    api.setTimer(uuid.v4(), duration(i, 'minutes'), shiftSpellTraces, { maxLookupSeconds: 600, shiftTimeSeconds: 300 });
  }
}
