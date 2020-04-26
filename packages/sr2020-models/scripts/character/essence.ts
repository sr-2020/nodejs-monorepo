import { EffectModelApi, Modifier, Effect, UserVisibleError, EventModelApi, Event } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020Character, AddedImplant, MetaRace } from '@sr2020/interface/models/sr2020-character.model';
import { increaseMagic, increaseResonance, increaseCharisma } from './basic_effects';
import { Implant } from './implants_library';
import { removeImplant } from './merchandise';

export function createEssenceSystemEffect(): Effect {
  return {
    enabled: true,
    type: 'normal',
    handler: systemEssenceEffect.name,
  };
}

export function systemEssenceEffect(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  const racesWithoutEssence: MetaRace[] = ['meta-digital', 'meta-spirit'];
  if (racesWithoutEssence.includes(api.model.metarace)) {
    api.model.essence = 0;
  } else {
    api.model.essence = Math.max(0, api.model.essenceDetails.max - api.model.essenceDetails.gap - api.model.essenceDetails.used);
    if (api.model.essence <= 500) {
      const amount = -Math.min(5, Math.floor((600 - api.model.essence) / 100));
      increaseMagic(api, { ...m, amount });
      increaseResonance(api, { ...m, amount });
      increaseCharisma(api, { ...m, amount });
    }
  }

  if (api.model.essence != 0) {
    api.model.mentalDefenceBonus += Math.floor(500 / api.model.essence);
  } else {
    api.model.mentalDefenceBonus += 500;
  }
}

export function reduceEssenceDueToImplantInstall(api: EventModelApi<Sr2020Character>, implant: Implant) {
  const cost = Math.floor(100 * implant.essenceCost);
  if (cost > api.workModel.essence + api.workModel.essenceDetails.gap - 100) {
    throw new UserVisibleError('Невозможно установить имплант в данное тело');
  }

  api.model.essenceDetails.used += cost;
  api.model.essenceDetails.gap -= Math.min(api.model.essenceDetails.gap, cost);
}

export function createGapDueToImplantUninstall(api: EventModelApi<Sr2020Character>, implant: AddedImplant) {
  const cost = Math.floor(100 * implant.essenceCost);
  api.model.essenceDetails.used -= cost;
  api.model.essenceDetails.gap += cost;
}

export function increaseMaxEssence(api: EventModelApi<Sr2020Character>, data: { amount?: number }, _: Event) {
  api.model.essenceDetails.max += data.amount ?? 100;
}

export function essenceReset(api: EventModelApi<Sr2020Character>, data: {}, event: Event) {
  while (api.model.implants.length) {
    removeImplant(api, { id: api.model.implants[api.model.implants.length - 1].id }, event);
  }
  api.model.essenceDetails.used = 0;
  api.model.essenceDetails.gap = 0;
}
