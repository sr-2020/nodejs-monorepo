import { Sr2020Character, AddedActiveAbility } from '@sr2020/interface/models/sr2020-character.model';
import { EventModelApi, Event } from '@sr2020/interface/models/alice-model-engine';

export function useMentalAbility(api: EventModelApi<Sr2020Character>, data: AddedActiveAbility, event: Event) {
  api.sendNotification('Менталистика', `Применена способность ${data.humanReadableName}`);
}
