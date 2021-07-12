import { Effect, EffectModelApi, EventModelApi, Modifier } from '@alice/alice-common/models/alice-model-engine';
import { MetaRace, Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { increaseCharisma, increaseMagic, increaseResonance } from './basic_effects';
import { removeImplant } from './merchandise';
import { FullTargetedAbilityData } from '@alice/sr2020-common/models/common_definitions';
import { sendNotificationAndHistoryRecord } from '@alice/sr2020-model-engine/scripts/character/util';

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

export function increaseMaxEssence(api: EventModelApi<Sr2020Character>, data: { amount?: number }) {
  api.model.essenceDetails.max += data.amount ?? 100;
}

export function decreaseMaxEssence(api: EventModelApi<Sr2020Character>, data: { amount?: number }) {
  api.model.essenceDetails.max -= data.amount ?? 100;
}

export function essenceReset(api: EventModelApi<Sr2020Character>, data: {}) {
  while (api.model.implants.length) {
    removeImplant(api, { id: api.model.implants[api.model.implants.length - 1].id, abilityId: 'gm-reset-essence' });
  }
  api.model.essenceDetails.used = 0;
  api.model.essenceDetails.gap = 0;
}

export function gmIncreaseMaxEssence(api: EventModelApi<Sr2020Character>, data: FullTargetedAbilityData) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId, increaseMaxEssence, {});
}

export function gmDecreaseMaxEssence(api: EventModelApi<Sr2020Character>, data: FullTargetedAbilityData) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId, decreaseMaxEssence, {});
}

export function gmEssenceReset(api: EventModelApi<Sr2020Character>, data: FullTargetedAbilityData) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId, essenceReset, {});
}

export function essenceScanAbility(api: EventModelApi<Sr2020Character>, data: FullTargetedAbilityData) {
  const target = api.aquired(Sr2020Character, data.targetCharacterId!);
  sendNotificationAndHistoryRecord(
    api,
    'Анализ эссенса',
    `Всего: ${target.essenceDetails.max / 100}. Занято имплантами: ${target.essenceDetails.used}. Остаток: ${target.essence}.`,
  );
}
