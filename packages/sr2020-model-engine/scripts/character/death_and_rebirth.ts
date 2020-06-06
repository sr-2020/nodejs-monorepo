import { duration } from 'moment';
import { HealthState, Sr2020Character } from '@sr2020/sr2020-common/models/sr2020-character.model';
import { EffectModelApi, EventModelApi, Modifier, UserVisibleError } from '@sr2020/interface/models/alice-model-engine';
import { addTemporaryModifier, modifierFromEffect, sendNotificationAndHistoryRecord } from './util';
import { ActiveAbilityData, FullTargetedAbilityData, kIWillSurviveModifierId } from './active_abilities';
import { kReviveModifierId } from './implants_library';
import { resetAllAddictions } from './chemo';
import { QrCode } from '@sr2020/sr2020-common/models/qr-code.model';
import { AiSymbolData, ReanimateCapsuleData, typedQrData } from '@sr2020/sr2020-model-engine/scripts/qr/datatypes';
import { resetHunger } from '@sr2020/sr2020-model-engine/scripts/character/hunger';

const kClinicalDeathTimerName = 'timer-clinically-dead';
const kClinicalDeathTimerTime = duration(30, 'minutes');

const kMedkitReviveTimerName = 'timer-medkit-revive';
const kMedkitReviveTimerTime = duration(10, 'minutes');

const kIWillSurviveReviveTimerName = 'timer-i-will-survive';
const kIWillSurviveReviveTimerTime = duration(30, 'seconds');

export function wound(api: EventModelApi<Sr2020Character>, _data: {}) {
  if (api.model.healthState != 'healthy') return;

  healthStateTransition(api, 'wounded');
  sendNotificationAndHistoryRecord(api, 'Ранение', 'Вы тяжело ранены');
}

export function clinicalDeath(api: EventModelApi<Sr2020Character>, _data: {}) {
  if (api.model.healthState != 'wounded') return;

  healthStateTransition(api, 'clinically_dead');
  sendNotificationAndHistoryRecord(api, 'Ранение', 'Вы в состоянии клинической смерти');
}

export function clinicalDeath0MaxHp(api: EventModelApi<Sr2020Character>, _data: {}) {
  if (api.model.healthState == 'biologically_dead') return;
  healthStateTransition(api, 'clinically_dead');
  sendNotificationAndHistoryRecord(api, 'Ранение', 'Вы в состоянии клинической смерти');
}

export function clinicalDeathOnTarget(api: EventModelApi<Sr2020Character>, data: FullTargetedAbilityData) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId.toString(), clinicalDeath, {});
}

export function reviveOnTarget(api: EventModelApi<Sr2020Character>, data: FullTargetedAbilityData) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId.toString(), revive, {});
}

export function revive(api: EventModelApi<Sr2020Character>, _data: {}) {
  if (api.model.healthState == 'biologically_dead') return;
  sendNotificationAndHistoryRecord(api, 'Лечение', 'Хиты полностью восстановлены', 'Вы полностью здоровы. Ура!');
  healthStateTransition(api, 'healthy');
}

export function reviveAbsoluteOnTarget(api: EventModelApi<Sr2020Character>, data: FullTargetedAbilityData) {
  const target = api.aquired(Sr2020Character, data.targetCharacterId);
  if (!['meta-norm', 'meta-elf', 'meta-dwarf', 'meta-ork', 'meta-troll'].includes(target.metarace)) {
    throw new UserVisibleError('Эта способность действует только на  нормов, эльфов, орков, троллей и гномов');
  }
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId, reviveAbsolute, {});
}

export function reviveAbsolute(api: EventModelApi<Sr2020Character>, _data: {}) {
  sendNotificationAndHistoryRecord(api, 'Лечение', 'Хиты полностью восстановлены', 'Вы полностью здоровы. Ура!');
  healthStateTransition(api, 'healthy');
}

export function absoluteDeath(api: EventModelApi<Sr2020Character>, _data: {}) {
  if (api.model.healthState == 'healthy') {
    throw new UserVisibleError('Цель не ранена!');
  }
  sendNotificationAndHistoryRecord(api, 'Абсолютная смерть', 'Вы окончательно мертвы');
  healthStateTransition(api, 'biologically_dead');
}

export function autodocRevive(api: EventModelApi<Sr2020Character>, _data: {}) {
  if (api.model.healthState != 'wounded') {
    throw new UserVisibleError('Пациент не находится в состоянии тяжелого ранения');
  }
  sendNotificationAndHistoryRecord(api, 'Лечение', 'Хиты полностью восстановлены', 'Вы полностью здоровы. Ура!');
  healthStateTransition(api, 'healthy');
}

export function autodocHeal(api: EventModelApi<Sr2020Character>, _data: {}) {
  if (api.model.healthState != 'healthy') {
    throw new UserVisibleError('Пациент ранен слишком тяжело для этого');
  }
  sendNotificationAndHistoryRecord(api, 'Лечение', 'Хиты полностью восстановлены', 'Вы полностью здоровы. Ура!');
}

export function healthStateTransition(api: EventModelApi<Sr2020Character>, stateTo: HealthState) {
  if (api.workModel.currentBody != 'physical') {
    throw new UserVisibleError('Только мясное тело может быть ранено, вылечено или воскрешено.');
  }

  const stateFrom = api.model.healthState;
  if (stateFrom == stateTo) return;

  if (stateFrom == 'wounded') {
    api.removeTimer(kMedkitReviveTimerName);
    api.removeTimer(kClinicalDeathTimerName);
    api.removeTimer(kIWillSurviveReviveTimerName);
  }

  if (stateFrom == 'healthy' && stateTo == 'wounded') {
    api.setTimer(kClinicalDeathTimerName, 'Клиническая смерть', kClinicalDeathTimerTime, clinicalDeath, {});
    api.setTimer(kMedkitReviveTimerName, 'Лечение медкитом', kMedkitReviveTimerTime, medkitTryToRevive, {});
    if (hasEnabledIWillSurvive(api)) {
      api.setTimer(
        kIWillSurviveReviveTimerName,
        'Лечение способностью I will survive',
        kIWillSurviveReviveTimerTime,
        iWillSurviveRevive,
        {},
      );
    }
  }

  if (stateFrom == 'biologically_dead' || stateFrom == 'clinically_dead') {
    resetAllAddictions(api);
    resetHunger(api.model);
  }

  api.model.healthState = stateTo;
  api.sendPubSubNotification('health_state', { characterId: Number(api.model.modelId), characterName: api.model.name, stateFrom, stateTo });
}

export function medkitTryToRevive(api: EventModelApi<Sr2020Character>, _data: {}) {
  if (!hasEnabledMedkit(api)) return;
  revive(api, {});
  addTemporaryModifier(api, modifierFromEffect(disableMedkit, {}), duration(4, 'hours'), 'Медкит на кулдауне');
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

export function iWillSurviveRevive(api: EventModelApi<Sr2020Character>, data: {}) {
  revive(api, {});
  api.removeModifier(kIWillSurviveModifierId);
}

export function capsuleReanimate(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  const capsule = api.aquired(QrCode, data.droneId!);
  if (!(capsule?.type == 'reanimate_capsule')) {
    throw new UserVisibleError('Отсканированный QR не является капсулой');
  }

  const ai = api.aquired(QrCode, data.qrCode!);
  if (!(ai?.type == 'ai_symbol')) {
    throw new UserVisibleError('Отсканированный QR не является ИИ');
  }

  const capsuleData = typedQrData<ReanimateCapsuleData>(capsule);
  const aiData = typedQrData<AiSymbolData>(ai);

  const thisAbility = api.model.activeAbilities.find((a) => a.id == data.id)!;
  thisAbility.cooldownUntil += capsuleData.cooldown * 60 * 1000 * api.workModel.cooldownCoefficient;

  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!.toString(), reviveByCapsule, {
    essenceCost: capsuleData.essenceGet + capsuleData.essenceAir,
  });

  api.sendPubSubNotification('reanimates', {
    medic: api.workModel.modelId,
    patient: data.targetCharacterId,
    capsuleName: capsule.name,
    ...capsuleData,
    ...aiData,
  });
}

export function reviveByCapsule(api: EventModelApi<Sr2020Character>, data: { essenceCost: number }) {
  if (!['meta-norm', 'meta-elf', 'meta-dwarf', 'meta-ork', 'meta-troll'].includes(api.model.metarace)) {
    throw new UserVisibleError('Эта способность действует только на  нормов, эльфов, орков, троллей и гномов');
  }

  const cost = Math.min(api.workModel.essence, data.essenceCost);
  api.model.essenceDetails.gap += cost;

  revive(api, {});
}
