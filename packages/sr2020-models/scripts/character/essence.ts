import { EffectModelApi, Modifier, Effect, UserVisibleError, EventModelApi } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020Character, AddedImplant } from '@sr2020/interface/models/sr2020-character.model';
import { increaseMagic, increaseResonance, increaseCharisma } from './basic_effects';
import { Implant } from './implants_library';

export function createEssenceSystemEffect(): Effect {
  return {
    enabled: true,
    type: 'normal',
    handler: systemEssenceEffect.name,
  };
}

export function systemEssenceEffect(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.essence = Math.max(0, api.model.essenceDetails.max - api.model.essenceDetails.gap - api.model.essenceDetails.used);
  if (api.model.essence <= 500) {
    const amount = -Math.min(5, Math.floor((600 - api.model.essence) / 100));
    increaseMagic(api, { ...m, amount });
    increaseResonance(api, { ...m, amount });
    increaseCharisma(api, { ...m, amount });
  }

  if (api.model.essence <= 100) {
    if (api.model.essence != 0) {
      api.model.mentalDefenceBonus += Math.floor(500 / api.model.essence);
    } else {
      api.model.mentalDefenceBonus += 500;
    }
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
