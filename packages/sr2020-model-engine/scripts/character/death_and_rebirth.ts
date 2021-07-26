import { duration } from 'moment';
import { HealthState, LocationData, LocationMixin, Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { EffectModelApi, EventModelApi, Modifier, UserVisibleError } from '@alice/alice-common/models/alice-model-engine';
import { addTemporaryModifier, modifierFromEffect, sendNotificationAndHistoryRecord } from './util';
import { ActiveAbilityData, FullTargetedAbilityData } from '@alice/sr2020-common/models/common_definitions';
import { kReviveModifierId } from './implants_library';
import { QrCode } from '@alice/sr2020-common/models/qr-code.model';
import { AiSymbolData, ReanimateCapsuleData, typedQrData } from '@alice/sr2020-model-engine/scripts/qr/datatypes';
import { isHmhvv } from '@alice/sr2020-model-engine/scripts/character/common_helpers';
import { kIWillSurviveModifierId } from '@alice/sr2020-model-engine/scripts/character/consts';
import { resetHunger } from '@alice/sr2020-model-engine/scripts/character/hunger';

const kClinicalDeathTimerName = 'timer-clinically-dead';
const kClinicalDeathTimerTime = duration(30, 'minutes');
const kClinicalDeathAiTimerTime = duration(0, 'minutes');

const kMedkitReviveTimerName = 'timer-medkit-revive';
const kMedkitReviveTimerTime = duration(10, 'minutes');

const kIWillSurviveReviveTimerName = 'timer-i-will-survive';
const kIWillSurviveReviveTimerTime = duration(30, 'seconds');

export function wound(api: EventModelApi<Sr2020Character>, _data: {}) {
  if (api.model.healthState != 'healthy') return;

  healthStateTransition(api, 'wounded', undefined);
  sendNotificationAndHistoryRecord(api, 'Ранение', 'Вы тяжело ранены');
}

export function clinicalDeath(api: EventModelApi<Sr2020Character>, data: { location?: LocationData }) {
  if (api.model.healthState != 'wounded') return;
  clinicalDeathUnchecked(api, data);
}

export function clinicalDeathUnchecked(api: EventModelApi<Sr2020Character>, data: { location?: LocationData }) {
  if (api.model.healthState == 'biologically_dead') return;

  healthStateTransition(api, 'clinically_dead', data.location);
  sendNotificationAndHistoryRecord(api, 'Ранение', 'Вы в состоянии клинической смерти');
}

export function clinicalDeath0MaxHp(api: EventModelApi<Sr2020Character>, data: {}) {
  if (api.model.healthState == 'biologically_dead') return;
  healthStateTransition(api, 'clinically_dead', undefined);
  sendNotificationAndHistoryRecord(api, 'Ранение', 'Вы в состоянии клинической смерти');
}

export function clinicalDeathOnTarget(api: EventModelApi<Sr2020Character>, data: FullTargetedAbilityData) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId.toString(), clinicalDeath, data);
}

export function reviveOnTarget(api: EventModelApi<Sr2020Character>, data: FullTargetedAbilityData) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId.toString(), revive, data);
}

export function revive(api: EventModelApi<Sr2020Character>, data: { location?: LocationData }) {
  if (api.model.healthState == 'biologically_dead') return;
  sendNotificationAndHistoryRecord(api, 'Лечение', 'Хиты полностью восстановлены', 'Вы полностью здоровы. Ура!');
  healthStateTransition(api, 'healthy', data?.location);
}

export function reviveAbsoluteOnTarget(api: EventModelApi<Sr2020Character>, data: FullTargetedAbilityData) {
  const target = api.aquired(Sr2020Character, data.targetCharacterId);
  if (!['meta-norm', 'meta-elf', 'meta-dwarf', 'meta-ork', 'meta-troll'].includes(target.metarace)) {
    throw new UserVisibleError('Эта способность действует только на  нормов, эльфов, орков, троллей и гномов');
  }
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId, reviveAbsolute, data);
}

export function reviveAbsoluteOnDigitalTarget(api: EventModelApi<Sr2020Character>, data: FullTargetedAbilityData) {
  const target = api.aquired(Sr2020Character, data.targetCharacterId);
  if (target.metarace != 'meta-digital') {
    throw new UserVisibleError('Эта способность действует только на цифровых');
  }
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId, reviveAbsolute, data);
}

export function debugReviveAbsolute(api: EventModelApi<Sr2020Character>, data?: { location?: LocationData }) {
  throw new UserVisibleError('Нет этой кнопки больше :p Обновите приложение!');
}

export function debugReviveAbsoluteSecret(api: EventModelApi<Sr2020Character>, data?: { location?: LocationData }) {
  reviveAbsolute(api, data);
}

export function reviveAbsolute(api: EventModelApi<Sr2020Character>, data?: { location?: LocationData }) {
  sendNotificationAndHistoryRecord(api, 'Лечение', 'Хиты полностью восстановлены', 'Вы полностью здоровы. Ура!');
  healthStateTransition(api, 'healthy', data?.location);
}

export function absoluteDeath(api: EventModelApi<Sr2020Character>, data: LocationMixin) {
  if (api.model.healthState == 'healthy') {
    throw new UserVisibleError('Цель не ранена!');
  }
  absoluteDeathUnchecked(api, data);
}

export function absoluteDeathUnchecked(api: EventModelApi<Sr2020Character>, data: LocationMixin) {
  sendNotificationAndHistoryRecord(api, 'Абсолютная смерть', 'Вы окончательно мертвы');
  healthStateTransition(api, 'biologically_dead', data.location);
}

export function medcartReviveAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, autodocRevive, data);
  api.sendNotification('Успех', 'Пациент вылечен');
}

export function medcartHealAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, autodocHeal, {});
  api.sendNotification('Успех', 'Пациент вылечен');
}

export function autodocRevive(api: EventModelApi<Sr2020Character>, data: LocationMixin) {
  if (api.model.healthState != 'wounded') {
    throw new UserVisibleError('Пациент не находится в состоянии тяжелого ранения');
  }
  sendNotificationAndHistoryRecord(api, 'Лечение', 'Хиты полностью восстановлены', 'Вы полностью здоровы. Ура!');
  healthStateTransition(api, 'healthy', data.location);
}

export function autodocHeal(api: EventModelApi<Sr2020Character>, _data: {}) {
  if (api.model.healthState != 'healthy') {
    throw new UserVisibleError('Пациент ранен слишком тяжело для этого');
  }
  sendNotificationAndHistoryRecord(api, 'Лечение', 'Хиты полностью восстановлены', 'Вы полностью здоровы. Ура!');
}

export function healthStateTransition(api: EventModelApi<Sr2020Character>, stateTo: HealthState, location: LocationData | undefined) {
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
    if (api.workModel.metarace == 'meta-digital') {
      api.setTimer(kClinicalDeathTimerName, 'Клиническая смерть', kClinicalDeathAiTimerTime, clinicalDeath, { location: undefined });
    } else {
      api.setTimer(kClinicalDeathTimerName, 'Клиническая смерть', kClinicalDeathTimerTime, clinicalDeath, { location: undefined });
    }

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
    api.sendSelfEvent('resetAllAddictions', {});
    if (!isHmhvv(api.model) && api.model.metarace != 'meta-digital') {
      resetHunger(api.model);
    }
  }

  api.model.healthState = stateTo;
  api.sendPubSubNotification('health_state', {
    characterId: Number(api.model.modelId),
    characterName: api.model.name,
    stateFrom,
    stateTo,
    location,
  });
}

export function medkitTryToRevive(api: EventModelApi<Sr2020Character>, _data: {}) {
  if (!hasEnabledMedkit(api)) return;
  revive(api, { location: undefined });
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
  revive(api, { location: undefined });
  api.removeModifier(kIWillSurviveModifierId);
}

export function capsuleReanimate(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  const capsule = api.aquired(QrCode, data.droneId!);
  if (!(capsule?.type == 'reanimate_capsule')) {
    throw new UserVisibleError('Отсканированный QR не является капсулой');
  }

  const ai = api.aquired(QrCode, data.qrCodeId!);
  if (!(ai?.type == 'ai_symbol')) {
    throw new UserVisibleError('Отсканированный QR не является ИИ');
  }

  const capsuleData = typedQrData<ReanimateCapsuleData>(capsule);
  const aiData = typedQrData<AiSymbolData>(ai);

  const thisAbility = api.model.activeAbilities.find((a) => a.id == data.id)!;
  thisAbility.cooldownUntil += capsuleData.cooldown * 60 * 1000 * api.workModel.cooldownCoefficient;

  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!.toString(), reviveByCapsule, {
    essenceCost: capsuleData.essenceGet + capsuleData.essenceAir,
    location: data.location,
  });

  api.sendPubSubNotification('reanimates', {
    medic: api.workModel.modelId,
    patient: data.targetCharacterId,
    capsuleName: capsule.name,
    location: data.location,
    ...capsuleData,
    ...aiData,
  });
}

export function reviveByCapsule(api: EventModelApi<Sr2020Character>, data: { essenceCost: number } & LocationMixin) {
  if (!['meta-norm', 'meta-elf', 'meta-dwarf', 'meta-ork', 'meta-troll'].includes(api.model.metarace)) {
    throw new UserVisibleError('Эта способность действует только на  нормов, эльфов, орков, троллей и гномов');
  }

  const cost = Math.min(api.workModel.essence, data.essenceCost);
  api.model.essenceDetails.gap += cost;

  revive(api, data);
}
