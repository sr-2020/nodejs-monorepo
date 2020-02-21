import { EventModelApi, UserVisibleError, Event } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';

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
