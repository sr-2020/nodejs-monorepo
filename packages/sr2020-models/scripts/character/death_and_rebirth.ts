import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { Event, EventModelApi, EffectModelApi, Modifier } from '@sr2020/interface/models/alice-model-engine';
import { sendNotificationAndHistoryRecord, modifierFromEffect, addTemporaryModifier } from './util';
import { FullTargetedAbilityData } from './active_abilities';
import { kReviveModifierId } from './implants_library';

const kClinicalDeathTimerName = 'timer-clinically-dead';
const kClinicalDeathTimerTime = 30 * 60 * 1000;

const kMedkitReviveTimerName = 'timer-medkit-revive';
const kMedkitReviveTimerTime = 10 * 60 * 1000;

export function wound(api: EventModelApi<Sr2020Character>, _data: {}, _: Event) {
  if (api.model.healthState != 'healthy') return;

  healthStateTransition(api, 'wounded');
  sendNotificationAndHistoryRecord(api, 'Ранение', 'Вы тяжело ранены');

  api.setTimer(kClinicalDeathTimerName, kClinicalDeathTimerTime, clinicalDeath, {});
}

export function clinicalDeath(api: EventModelApi<Sr2020Character>, _data: {}, _: Event) {
  if (api.model.healthState != 'wounded') return;

  healthStateTransition(api, 'clinically_dead');
  sendNotificationAndHistoryRecord(api, 'Ранение', 'Вы в состоянии клинической смерти');
}

export function clinicalDeathOnTarget(api: EventModelApi<Sr2020Character>, data: FullTargetedAbilityData, _: Event) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId.toString(), clinicalDeath, {});
}

export function reviveOnTarget(api: EventModelApi<Sr2020Character>, data: FullTargetedAbilityData, _: Event) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId.toString(), revive, {});
}

export function revive(api: EventModelApi<Sr2020Character>, _data: {}, _: Event) {
  if (api.model.healthState == 'biologically_dead') return;
  sendNotificationAndHistoryRecord(api, 'Лечение', 'Хиты полностью восстановлены', 'Вы полностью здоровы. Ура!');
  healthStateTransition(api, 'healthy');
  api.removeTimer(kClinicalDeathTimerName);
}

function healthStateTransition(
  api: EventModelApi<Sr2020Character>,
  stateTo: 'healthy' | 'wounded' | 'clinically_dead' | 'biologically_dead',
) {
  const stateFrom = api.model.healthState;
  if (stateFrom == stateTo) return;

  if (stateFrom == 'wounded') {
    api.removeTimer(kMedkitReviveTimerName);
  }

  if (stateFrom == 'healthy' && stateTo == 'wounded') {
    if (hasEnabledMedkit(api)) {
      api.setTimer(kMedkitReviveTimerName, kMedkitReviveTimerTime, medkitTryToRevive, {});
    }
  }

  api.model.healthState = stateTo;
  api.sendPubSubNotification('health_state', { characterId: Number(api.model.modelId), stateFrom, stateTo });
}

export function medkitTryToRevive(api: EventModelApi<Sr2020Character>, _data: {}, _: Event) {
  if (!hasEnabledMedkit(api)) return;
  revive(api, {}, _);
  addTemporaryModifier(api, modifierFromEffect(disableMedkit, {}), 4 * 3600);
}

export function disableMedkit(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  const medkit = api.getModifierById(kReviveModifierId);
  if (medkit) medkit.enabled = false;
}

function hasEnabledMedkit(api: EventModelApi<Sr2020Character>): boolean {
  const medkit = api.workModel.modifiers.find((m) => m.mID == kReviveModifierId);
  return medkit?.enabled == true;
}
