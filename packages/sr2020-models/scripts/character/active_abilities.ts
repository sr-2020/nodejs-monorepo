import { EventModelApi, UserVisibleError, Event } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020Character, AddedActiveAbility } from '@sr2020/interface/models/sr2020-character.model';
import { sendNotificationAndHistoryRecord, addHistoryRecord, addTemporaryModifier, modifierFromEffect } from './util';
import { reviveOnTarget } from './death_and_rebirth';
import { multiplyAllDiscounts } from './basic_effects';
import { duration } from 'moment';

interface ActiveAbilityData {
  id: string; // corresponds to ActiveAbility.id and AddedActiveAbility.id
  targetCharacterId?: string; // Identifier of target character
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
  api.model.activeAbilities.find((a) => (a.id = data.id))!.cooldownUntil = event.timestamp + ability.cooldownMinutes * 60 * 1000;

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
