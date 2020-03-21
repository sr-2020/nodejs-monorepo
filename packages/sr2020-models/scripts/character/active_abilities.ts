import { EventModelApi, UserVisibleError, Event } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { sendNotificationAndHistoryRecord } from './util';
import { reviveOnTarget } from './death_and_rebirth';

interface ActiveAbilityData {
  id: string; // corresponds to ActiveAbility.id and AddedActiveAbility.id
  targetCharacterId?: string; // Identifier of target character
}

export function useAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData, event: Event) {
  const ability = api.workModel.activeAbilities.find((s) => s.id == data.id);
  if (!ability) {
    throw new UserVisibleError('Нельзя использовать способность, которой у вас нет!');
  }

  // TODO(aeremin) Handle cooldown

  api.sendSelfEvent(ability.eventType, data);
}

export function oneTimeRevive(api: EventModelApi<Sr2020Character>, data: { targetCharacterId: number }, event: Event) {
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
