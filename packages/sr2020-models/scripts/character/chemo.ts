import { EventModelApi, Event, UserVisibleError, EffectModelApi, Modifier } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { kAllPills } from './chemo_library';
import { addTemporaryModifier, modifierFromEffect } from './util';
import { duration } from 'moment';

export function consumeChemo(api: EventModelApi<Sr2020Character>, data: { id: string }, _: Event) {
  // TODO(aeremin) Check for body type
  const pill = kAllPills.find((it) => it.id == data.id);
  if (!pill) {
    throw new UserVisibleError('Такого препарата не существует');
  }
  for (const element in pill.content) {
    const amount = pill.content[element];
    const modifierClass = `${element}-concentration`;
    const mods = api.getModifiersByClass(modifierClass);
    if (mods.length) {
      mods[0].amount += amount;
    } else {
      addTemporaryModifier(api, modifierFromEffect(increaseConcentration, { element, amount }, modifierClass), duration(1, 'hour'));
    }
  }
  api.sendSelfEvent(checkConcentrations, {});
}

export function checkConcentrations(api: EventModelApi<Sr2020Character>, data: {}, _: Event) {
  // TODO(aeremin) Implement chemo effects
  // TODO(aeremin) Implement addictions
}

export function increaseConcentration(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.chemo.concentration[m.element] += m.amount;
}
