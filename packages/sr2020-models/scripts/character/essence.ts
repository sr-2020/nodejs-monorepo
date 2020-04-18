import { EffectModelApi, Modifier, Effect } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';

export function createEssenceSystemEffect(): Effect {
  return {
    enabled: true,
    type: 'normal',
    handler: systemEssenceEffect.name,
  };
}

export function systemEssenceEffect(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.essence = api.model.essenceDetails.max - api.model.essenceDetails.gap - api.model.essenceDetails.used;
  // TODO(aeremin): Set debuff
}
