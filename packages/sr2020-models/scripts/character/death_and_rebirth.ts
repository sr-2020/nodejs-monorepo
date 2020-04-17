import { duration } from 'moment';
import { Sr2020Character, HealthState } from '@sr2020/interface/models/sr2020-character.model';
import { Event, EventModelApi, EffectModelApi, Modifier, UserVisibleError } from '@sr2020/interface/models/alice-model-engine';
import { sendNotificationAndHistoryRecord, modifierFromEffect, addTemporaryModifier } from './util';
import { FullTargetedAbilityData, kIWillSurviveModifierId } from './active_abilities';
import { kReviveModifierId } from './implants_library';

const kClinicalDeathTimerName = 'timer-clinically-dead';
const kClinicalDeathTimerTime = duration(30, 'minutes');

const kMedkitReviveTimerName = 'timer-medkit-revive';
const kMedkitReviveTimerTime = duration(10, 'minutes');

const kIWillSurviveReviveTimerName = 'timer-i-will-survive';
const kIWillSurviveReviveTimerTime = duration(30, 'seconds');

export function wound(api: EventModelApi<Sr2020Character>, _data: {}, _: Event) {
  if (api.model.healthState != 'healthy') return;

  healthStateTransition(api, 'wounded');
  sendNotificationAndHistoryRecord(api, 'Ранение', 'Вы тяжело ранены');
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
}

export function reviveAbsoluteOnTarget(api: EventModelApi<Sr2020Character>, data: FullTargetedAbilityData, _: Event) {
  if (!['meta-norm', 'meta-elf', 'meta-dwarf', 'meta-ork', 'meta-troll'].includes(api.model.metarace)) {
    throw new UserVisibleError('Эта способность действует только на  нормов, эльфов, орков, троллей и гномов');
  }
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId.toString(), reviveAbsolute, {});
}

export function reviveAbsolute(api: EventModelApi<Sr2020Character>, _data: {}, _: Event) {
  sendNotificationAndHistoryRecord(api, 'Лечение', 'Хиты полностью восстановлены', 'Вы полностью здоровы. Ура!');
  healthStateTransition(api, 'healthy');
}

export function autodocRevive(api: EventModelApi<Sr2020Character>, _data: {}, _: Event) {
  if (api.model.healthState != 'wounded') {
    throw new UserVisibleError('Пациент не находится в состоянии тяжелого ранения');
  }
  sendNotificationAndHistoryRecord(api, 'Лечение', 'Хиты полностью восстановлены', 'Вы полностью здоровы. Ура!');
  healthStateTransition(api, 'healthy');
}

export function autodocHeal(api: EventModelApi<Sr2020Character>, _data: {}, _: Event) {
  if (api.model.healthState != 'healthy') {
    throw new UserVisibleError('Пациент ранен слишком тяжело для этого');
  }
  sendNotificationAndHistoryRecord(api, 'Лечение', 'Хиты полностью восстановлены', 'Вы полностью здоровы. Ура!');
}

function healthStateTransition(api: EventModelApi<Sr2020Character>, stateTo: HealthState) {
  const stateFrom = api.model.healthState;
  if (stateFrom == stateTo) return;

  if (stateFrom == 'wounded') {
    api.removeTimer(kMedkitReviveTimerName);
    api.removeTimer(kClinicalDeathTimerName);
    api.removeTimer(kIWillSurviveReviveTimerName);
  }

  if (stateFrom == 'healthy' && stateTo == 'wounded') {
    api.setTimer(kClinicalDeathTimerName, kClinicalDeathTimerTime, clinicalDeath, {});
    api.setTimer(kMedkitReviveTimerName, kMedkitReviveTimerTime, medkitTryToRevive, {});
    if (hasEnabledIWillSurvive(api)) {
      api.setTimer(kIWillSurviveReviveTimerName, kIWillSurviveReviveTimerTime, iWillSurviveRevive, {});
    }
  }

  api.model.healthState = stateTo;
  api.sendPubSubNotification('health_state', { characterId: Number(api.model.modelId), stateFrom, stateTo });
}

export function medkitTryToRevive(api: EventModelApi<Sr2020Character>, _data: {}, _: Event) {
  if (!hasEnabledMedkit(api)) return;
  revive(api, {}, _);
  addTemporaryModifier(api, modifierFromEffect(disableMedkit, {}), duration(4, 'hours'));
}

export function disableMedkit(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  const medkit = api.getModifierById(kReviveModifierId);
  if (medkit) medkit.enabled = false;
}

function hasEnabledMedkit(api: EventModelApi<Sr2020Character>): boolean {
  const medkit = api.workModel.modifiers.find((m) => m.mID == kReviveModifierId);
  return medkit?.enabled == true;
}

function hasEnabledIWillSurvive(api: EventModelApi<Sr2020Character>): boolean {
  const mod = api.workModel.modifiers.find((m) => m.mID == kIWillSurviveModifierId);
  return mod != undefined;
}

function iWillSurviveRevive(api: EventModelApi<Sr2020Character>, data: {}, event: Event) {
  revive(api, {}, event);
  api.removeModifier(kIWillSurviveModifierId);
}
