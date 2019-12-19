import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { Event, EventModelApi } from '@sr2020/interface/models/alice-model-engine';
import { sendNotificationAndHistoryRecord } from './util';

const kClinicalDeathTimerName = 'timer-clinically-dead';
const kClinicalDeathTimerTime = 5 * 60 * 1000;

export function wound(api: EventModelApi<Sr2020Character>, _data: {}, _: Event) {
  if (api.model.healthState != 'healthy') return;

  api.model.healthState = 'wounded';
  sendNotificationAndHistoryRecord(api, 'Ранение', 'Вы тяжело ранены');

  api.setTimer(kClinicalDeathTimerName, kClinicalDeathTimerTime, clinicalDeath, {});
}

export function clinicalDeath(api: EventModelApi<Sr2020Character>, _data: {}, _: Event) {
  if (api.model.healthState != 'wounded') return;

  api.model.healthState = 'clinically_dead';
  sendNotificationAndHistoryRecord(api, 'Ранение', 'Вы в состоянии клинической смерти');
}

export function clinicalDeathOnTarget(api: EventModelApi<Sr2020Character>, data: { targetCharacterId: number }, _: Event) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId.toString(), clinicalDeath, {});
}

export function reviveOnTarget(api: EventModelApi<Sr2020Character>, data: { targetCharacterId: number }, _: Event) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId.toString(), revive, {});
}

export function revive(api: EventModelApi<Sr2020Character>, _data: {}, _: Event) {
  if (api.model.healthState == 'biologically_dead') return;
  sendNotificationAndHistoryRecord(api, 'Лечение', 'Хиты полностью восстановлены', 'Вы полностью здоровы. Ура!');
  api.model.healthState = 'healthy';
  api.removeTimer(kClinicalDeathTimerName);
}
