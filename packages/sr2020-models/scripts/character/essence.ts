import { EffectModelApi, Modifier, Effect } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { increaseMagic, increaseResonance, increaseCharisma } from './basic_effects';

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
}
