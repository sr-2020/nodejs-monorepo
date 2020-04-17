import { EventModelApi, UserVisibleError, Event, Modifier, EffectModelApi } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020Character, AddedActiveAbility } from '@sr2020/interface/models/sr2020-character.model';
import { sendNotificationAndHistoryRecord, addHistoryRecord, addTemporaryModifier, modifierFromEffect, validUntil } from './util';
import { reviveOnTarget } from './death_and_rebirth';
import { multiplyAllDiscounts } from './basic_effects';
import { duration } from 'moment';
import { Location } from '@sr2020/interface/models/location.model';

export const kIWillSurviveModifierId = 'i-will-survive-modifier';

interface ActiveAbilityData {
  id: string; // corresponds to ActiveAbility.id and AddedActiveAbility.id
  targetCharacterId?: string; // Identifier of target character
  locationId: string;
}

export type FullActiveAbilityData = ActiveAbilityData & AddedActiveAbility;

export type FullTargetedAbilityData = FullActiveAbilityData & { targetCharacterId: string };

export function useAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData, event: Event) {
  const ability = api.workModel.activeAbilities.find((s) => s.id == data.id);
  if (!ability) {
    throw new UserVisibleError('Нельзя использовать способность, которой у вас нет!');
  }

  if (ability.cooldownUntil > event.timestamp) {
    throw new UserVisibleError('Способность еще на кулдауне!');
  }

  // Second `find` as we must change the value in (base) model, not in workModel.
  // (and the ability to use should be taken from workModel as there are temporary abilities.
  const maybeAbility = api.model.activeAbilities.find((a) => a.id == data.id);
  // This is needed to support the case when the ability is temporary and as such only present in workModel.
  // This will lead to maybeAbility being undefined. But it's fine: such abilities are one-time-use anyway, so no need to
  // set cooldown.
  if (maybeAbility) {
    maybeAbility.cooldownUntil = event.timestamp + ability.cooldownMinutes * 60 * 1000;
  }

  api.sendSelfEvent(ability.eventType, { ...ability, ...data });

  addHistoryRecord(api, 'Способность', ability.humanReadableName, `Способность ${ability.humanReadableName} успешно применена`);
}

export function oneTimeRevive(api: EventModelApi<Sr2020Character>, data: FullTargetedAbilityData, event: Event) {
  sendNotificationAndHistoryRecord(
    api,
    'Навык',
    'Применен Ground Heal',
    'Вы применили навык полученный благодаря заклинанию Ground Heal. Заклинание перестало действовать',
  );

  const mods = api.getModifiersByName('ground-heal-modifier');
  if (mods.length) {
    // We remove the first one as it's the "oldest" one.
    api.removeModifier(mods[0].mID);
  }

  reviveOnTarget(api, data, event);
}

export function dummyAbility(api: EventModelApi<Sr2020Character>, data: void, event: Event) {
  api.sendNotification('Способность еще не реализована :(', 'Приходите завтра. Или послезавтра?');
}

export function discountAll10(api: EventModelApi<Sr2020Character>, data: never, _: Event) {
  addTemporaryModifier(api, modifierFromEffect(multiplyAllDiscounts, { amount: 0.9 }), duration(30, 'minutes'));
}

export function discountAll20(api: EventModelApi<Sr2020Character>, data: never, _: Event) {
  addTemporaryModifier(api, modifierFromEffect(multiplyAllDiscounts, { amount: 0.8 }), duration(30, 'minutes'));
}

export function discountAll30(api: EventModelApi<Sr2020Character>, data: never, _: Event) {
  addTemporaryModifier(api, modifierFromEffect(multiplyAllDiscounts, { amount: 0.7 }), duration(30, 'minutes'));
}

// Adept abilities

export function hammerOfJustice(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData, _: Event) {
  const manaLevel = api.aquired(Location, data.locationId).manaDensity;
  const d = duration(10 + 3 * manaLevel, 'minutes');
  const m = modifierFromEffect(hammerOfJusticeEffect, { validUntil: validUntil(api, d) });
  addTemporaryModifier(api, m, d);
}

export function hammerOfJusticeEffect(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.passiveAbilities.push({
    id: 'hammer-of-justice-effect',
    name: 'Hammer of Justice',
    description: 'Одноручное оружие считается тяжёлым.',
    validUntil: m.validUntil,
  });
}

export function arrowgant(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData, _: Event) {
  const manaLevel = api.aquired(Location, data.locationId).manaDensity;
  const d = duration(5 + 1 * manaLevel, 'minutes');
  const m = modifierFromEffect(arrowgantEffect, { validUntil: validUntil(api, d) });
  addTemporaryModifier(api, m, d);
}

export function arrowgantEffect(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.passiveAbilities.push({
    id: 'arrowgant-effect',
    name: 'Arrowgant',
    description: 'Защита от дистанционных атак (только от нерфов).',
    validUntil: m.validUntil,
  });
}

export function trollton(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData, _: Event) {
  const manaLevel = api.aquired(Location, data.locationId).manaDensity;
  const d = duration(5 + 2 * manaLevel, 'minutes');
  const m = modifierFromEffect(trolltonEffect, { validUntil: validUntil(api, d) });
  addTemporaryModifier(api, m, d);
}

export function trolltonEffect(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.passiveAbilities.push({
    id: 'trollton-effect',
    name: 'Trollton',
    description: 'У вас тяжелая броня.',
    validUntil: m.validUntil,
  });
}

export function iWillSurvive(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData, _: Event) {
  const manaLevel = api.aquired(Location, data.locationId).manaDensity;
  const d = duration(5 + 2 * manaLevel, 'minutes');
  addTemporaryModifier(api, { mID: kIWillSurviveModifierId, enabled: true, effects: [] }, d);
}
