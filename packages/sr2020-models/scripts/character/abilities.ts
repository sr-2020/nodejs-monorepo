import { ActiveAbility, Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { Event, EventModelApi } from '@sr2020/interface/models/alice-model-engine';
import { reviveOnTarget } from './death_and_rebirth';
import { sendNotificationAndHistoryRecord } from './util';
import { GROUND_HEAL_MODIFIER_NAME } from './spells';

export const AllActiveAbilities: ActiveAbility[] = [
  {
    humanReadableName: 'Ground Heal',
    description: 'Поднимает одну цель из КС/тяжрана в полные хиты.',
    eventType: oneTimeRevive.name,
    canTargetSelf: false,
    canTargetSingleTarget: true,
  },
];

export function oneTimeRevive(api: EventModelApi<Sr2020Character>, data: { targetCharacterId: number }, event: Event) {
  sendNotificationAndHistoryRecord(
    api,
    'Навык',
    'Применен Ground Heal',
    'Вы применили навык полученный благодаря заклинанию Ground Heal. Заклинание перестало действовать',
  );

  const mods = api.getModifiersByName(GROUND_HEAL_MODIFIER_NAME);
  if (mods.length) {
    // We remove the first one as it's the "oldest" one.
    api.removeModifier(mods[0].mID);
  }

  reviveOnTarget(api, data, event);
}
