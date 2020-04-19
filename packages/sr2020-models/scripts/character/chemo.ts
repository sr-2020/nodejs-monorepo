import { EventModelApi, Event, UserVisibleError, EffectModelApi, Modifier } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020Character, Concentrations } from '@sr2020/interface/models/sr2020-character.model';
import { kAllPills } from './chemo_library';
import { addTemporaryModifier, modifierFromEffect } from './util';
import { duration } from 'moment';

export function consumeChemo(api: EventModelApi<Sr2020Character>, data: { id: string }, _: Event) {
  const pill = kAllPills.find((it) => it.id == data.id);
  if (!pill) {
    throw new UserVisibleError('Такого препарата не существует');
  }
  addTemporaryModifier(api, modifierFromEffect(increaseConcentration, { concentrations: pill.content }), duration(1, 'hour'));
  api.sendSelfEvent(checkConcentrations, {});
}

export function checkConcentrations(api: EventModelApi<Sr2020Character>, data: {}, _: Event) {
  // TODO(aeremin) Implement
}

export function increaseConcentration(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  const concentrations: Concentrations = m.concentrations;
  for (const element in concentrations) {
    api.model.chemo.concentration[element] += concentrations[element];
  }
}
