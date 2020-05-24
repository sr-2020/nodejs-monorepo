import { EventModelApi } from '@sr2020/interface/models/alice-model-engine';
import { Location, SpellTrace } from '@sr2020/sr2020-common/models/location.model';
import * as uuid from 'uuid';
import { duration } from 'moment';

const MAX_SPELL_TRACES = 100;

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
    api.setTimer(uuid.v4(), 'Сдвиг заклинаний в прошлое', duration(i, 'minutes'), shiftSpellTraces, {
      maxLookupSeconds: 600,
      shiftTimeSeconds: 300,
    });
  }
}
