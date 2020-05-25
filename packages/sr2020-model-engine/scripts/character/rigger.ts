import { EffectModelApi, EventModelApi, Modifier, UserVisibleError } from '@sr2020/interface/models/alice-model-engine';
import { AddedImplant, Sr2020Character } from '@sr2020/sr2020-common/models/sr2020-character.model';
import { Implant, kAllImplants } from './implants_library';
import { QrCode } from '@sr2020/sr2020-common/models/qr-code.model';
import { installImplant, removeImplant } from './merchandise';
import { consume } from '../qr/events';
import { createMerchandise } from '../qr/merchandise';
import { autodocHeal, autodocRevive, healthStateTransition } from './death_and_rebirth';
import { BodyStorageQrData, DroneQrData, MerchandiseQrData, typedQrData } from '@sr2020/sr2020-model-engine/scripts/qr/datatypes';
import { ActiveAbilityData } from '@sr2020/sr2020-model-engine/scripts/character/active_abilities';
import { duration } from 'moment';
import { putBodyToStorage, removeBodyFromStorage } from '@sr2020/sr2020-model-engine/scripts/qr/body_storage';
import { kDroneAbilityIds } from '@sr2020/sr2020-model-engine/scripts/qr/drone_library';
import { startUsingDrone, stopUsingDrone } from '@sr2020/sr2020-model-engine/scripts/qr/drones';
import { sendNotificationAndHistoryRecord } from '@sr2020/sr2020-model-engine/scripts/character/util';

const kInDroneModifierId = 'in-the-drone';

export function analyzeBody(api: EventModelApi<Sr2020Character>, data: { targetCharacterId: string }) {
  const patient = api.aquired(Sr2020Character, data.targetCharacterId);

  api.model.analyzedBody = {
    essence: patient.essence,
    healthState: patient.healthState,
    implants: patient.implants,
  };
}

export function disconnectFromBody(api: EventModelApi<Sr2020Character>, data: {}) {
  api.model.analyzedBody = undefined;
}

function checkIfCanWorkWithImplant(rigger: Sr2020Character, implant: AddedImplant | Implant) {
  if (implant.grade == 'bio' && !rigger.rigging.canWorkWithBioware) {
    throw new UserVisibleError('Вы не умеете работать с биоваром');
  }

  if (rigger.intelligence + rigger.rigging.implantDifficultyBonus < implant.installDifficulty) {
    throw new UserVisibleError('Вы не умеете работать с настолько сложными имплантами');
  }
}

// Tries to install implant from the QR code.
export function riggerInstallImplant(api: EventModelApi<Sr2020Character>, data: { targetCharacterId: string; qrCode: string }) {
  const qr = api.aquired(QrCode, data.qrCode);
  if (qr.type != 'implant') {
    throw new UserVisibleError('Отсканированный QR-код не является имплантом.');
  }

  const implant = kAllImplants.find((it) => it.id == typedQrData<MerchandiseQrData>(qr).id);
  if (implant == undefined) {
    throw new UserVisibleError('Отсканированный QR-код не является имплантом.');
  }

  checkIfCanWorkWithImplant(api.workModel, implant);

  api.sendOutboundEvent(QrCode, data.qrCode, consume, {});
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId, installImplant, typedQrData<MerchandiseQrData>(qr));

  // Not calling analyzeBody directly as we need for install event above propagate first
  api.sendOutboundEvent(Sr2020Character, api.model.modelId, analyzeBody, data);
}

// Tries to extract implant. Writes extracted implant to the QR code.
export function riggerUninstallImplant(
  api: EventModelApi<Sr2020Character>,
  data: { targetCharacterId: string; implantId: string; qrCode: string },
) {
  const patient = api.aquired(Sr2020Character, data.targetCharacterId);
  const implant = patient.implants.find((it) => it.id == data.implantId);
  if (implant == undefined) {
    throw new UserVisibleError('Имплант не найден. Попробуйте переподключиться к пациенту для актуализации списка имплантов.');
  }

  checkIfCanWorkWithImplant(api.workModel, implant);

  const qr = api.aquired(QrCode, data.qrCode);
  if (qr.type != 'empty') {
    throw new UserVisibleError('Отсканированный QR-код не является пустышкой.');
  }

  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId, removeImplant, { id: implant.id });
  api.sendOutboundEvent(QrCode, data.qrCode, createMerchandise, {
    id: implant.id,
    name: implant.name,
    description: implant.description,
    basePrice: implant.basePrice,
    rentPrice: implant.rentPrice,
    gmDescription: implant.gmDescription,
    dealId: implant.dealId,
    lifestyle: implant.lifestyle,
    additionalData: {},
  });

  // Not calling analyzeBody directly as we need for uninstall event above propagate first
  api.sendOutboundEvent(Sr2020Character, api.model.modelId, analyzeBody, data);
}

export function riggerRevive(api: EventModelApi<Sr2020Character>, data: { targetCharacterId: string }) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId, autodocRevive, {});
  // Not calling analyzeBody directly as we need for autodocRevive event above propagate first
  api.sendOutboundEvent(Sr2020Character, api.model.modelId, analyzeBody, data);
}

export function riggerHeal(api: EventModelApi<Sr2020Character>, data: { targetCharacterId: string }) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId, autodocHeal, {});
}

const kDroneTimerIds = ['drone-timer-stage-0', 'drone-timer-stage-1', 'drone-timer-stage-2'];

export function enterDrone(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  if (api.workModel.currentBody != 'physical') {
    throw new UserVisibleError('Для подключения к дрону необходимо быть в мясном теле.');
  }

  const drone = typedQrData<DroneQrData>(api.aquired(QrCode, data.droneId!));
  if (drone.inUse) {
    throw new UserVisibleError('Этот в настоящий момент уже используется.');
  }

  if (!data.id.startsWith(drone.type)) {
    throw new UserVisibleError('Этот навык не подходит к дрону данного класса.');
  }

  // TODO(https://trello.com/c/HgKga3aT/338-тела-дроны-создать-сущность-дроны-их-можно-покупать-в-магазине-носить-с-собой-на-куар-коде-и-в-них-можно-включаться)
  // TODO: Check sensor

  const timeInDrone = duration(10, 'minutes'); // TODO: Use proper formula
  api.setTimer(kDroneTimerIds[0], 'Аварийный выход из дрона', timeInDrone, droneTimeout, {});

  api.sendOutboundEvent(QrCode, data.bodyStorageId!, putBodyToStorage, {
    characterId: api.model.modelId,
    bodyType: api.workModel.currentBody,
  });

  api.sendOutboundEvent(QrCode, data.droneId!, startUsingDrone, {});

  api.model.activeAbilities = api.model.activeAbilities.concat(drone.activeAbilities);
  api.model.passiveAbilities = api.model.passiveAbilities.concat(drone.passiveAbilities);

  const penalty = api.model.passiveAbilities.find((ability) => ability.id == 'arch-rigger-negative-3') ? 1 : 0;

  api.addModifier(createDroneModifier(drone, data.droneId!, penalty));
}

export function exitDrone(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  if (api.workModel.currentBody != 'drone') {
    throw new UserVisibleError('Для отключения от дрона необходимо быть подключенным к нему.');
  }

  const storage = typedQrData<BodyStorageQrData>(api.aquired(QrCode, data.bodyStorageId!));
  if (!(storage?.body?.characterId == api.model.modelId)) {
    throw new UserVisibleError('Данная ячейка телохранилище не содержит ваше тело.');
  }
  api.sendOutboundEvent(QrCode, data.bodyStorageId!, removeBodyFromStorage, {});

  for (const timerId of kDroneTimerIds) api.removeTimer(timerId);

  const m = findInDroneModifier(api);
  api.sendOutboundEvent(QrCode, m.droneQrId, stopUsingDrone, {
    activeAbilities: api.workModel.activeAbilities.filter((ability) => kDroneAbilityIds.has(ability.id)),
  });

  const isDroneAbility = (ability) => !kDroneAbilityIds.has(ability.id);
  api.model.activeAbilities = api.model.activeAbilities.filter(isDroneAbility);
  api.model.passiveAbilities = api.model.passiveAbilities.filter(isDroneAbility);

  if (m.postDroneDamage == 0) {
    sendNotificationAndHistoryRecord(api, 'Выход из дрона', 'Вы вышли из дрона, все в порядке.');
  } else {
    sendNotificationAndHistoryRecord(api, 'Выход из дрона', `При выходе из дрона вы потеряли ${m.postDroneDamage} хитов`);
  }

  // Not calling directly as we need to remove modifier and recalculate max HP first.
  api.sendSelfEvent(applyPostDroneDamange, { amount: m.postDroneDamage });
  api.removeModifier(m.mID);
}

export function applyPostDroneDamange(api: EventModelApi<Sr2020Character>, data: { amount: number }) {
  if (data.amount == 0) {
    sendNotificationAndHistoryRecord(api, 'Выход из дрона', 'Вы вышли из дрона, все в порядке.');
  } else if (data.amount < api.workModel.maxHp) {
    sendNotificationAndHistoryRecord(api, 'Выход из дрона', `При выходе из дрона вы потеряли ${data.amount} хитов.`);
  } else {
    sendNotificationAndHistoryRecord(api, 'Выход из дрона', `При выходе из дрона вы потеряли ${data.amount} хитов, что привело к тяжрану.`);
    healthStateTransition(api, 'wounded');
  }
}

type InTheDroneModifier = Modifier & { hp: number; droneQrId: string; postDroneDamage: number; stage: number };

function createDroneModifier(drone: DroneQrData, droneQrId: string, postDroneDamage: number): InTheDroneModifier {
  return {
    mID: kInDroneModifierId,
    enabled: true,
    effects: [
      {
        type: 'functional',
        handler: inTheDrone.name,
        enabled: true,
      },
    ],
    hp: drone.hitpoints,
    droneQrId,
    postDroneDamage,
    stage: 0,
  };
}

function findInDroneModifier(api: EventModelApi<Sr2020Character>) {
  const m = api.getModifierById(kInDroneModifierId);
  if (!m) {
    throw new UserVisibleError('Для отключения от дрона необходимо быть подключенным к нему.');
  }
  return m as InTheDroneModifier;
}

export function inTheDrone(api: EffectModelApi<Sr2020Character>, m: InTheDroneModifier) {
  api.model.currentBody = 'drone';
  api.model.maxHp = m.hp;
  api.model.activeAbilities = api.model.activeAbilities.filter((ability) => kDroneAbilityIds.has(ability.id));
  //  What to do with the passive ones?
}

export function droneTimeout(api: EventModelApi<Sr2020Character>, data: {}) {
  sendNotificationAndHistoryRecord(
    api,
    'Превышено максимальное время пребывания в дроне',
    'Необходимо срочно вернуться в мясное тело во избежание урона.',
  );

  droneEmergencyExit(api, data);
}

export function droneWounded(api: EventModelApi<Sr2020Character>, data: {}) {
  sendNotificationAndHistoryRecord(api, 'Дрон критически поврежден', 'Необходимо срочно вернуться в мясное тело во избежание урона.');
  droneEmergencyExit(api, data);
}

export function bodyInStorageWounded(api: EventModelApi<Sr2020Character>, data: {}) {
  sendNotificationAndHistoryRecord(
    api,
    'Мясное тело атаковано',
    'Кто-то атаковал ваше мясное тело в телохранилище. Необходимо срочно в него вернуться во избежание урона.',
  );
  droneEmergencyExit(api, data);
}

export function droneEmergencyExit(api: EventModelApi<Sr2020Character>, data: {}) {
  const m = findInDroneModifier(api);
  if (m.stage != 0) return; // Emergency exit already triggered
  m.postDroneDamage += 1;

  const timerDescription = 'Увеличение штрафа за слишком долгое пребывание в дроне после аварийного выхода';
  api.setTimer(kDroneTimerIds[1], timerDescription, duration(10, 'minutes'), droneReturnTimeoutTick1, {});
  api.setTimer(kDroneTimerIds[2], timerDescription, duration(30, 'minutes'), droneReturnTimeoutTick2, {});
}

export function droneReturnTimeoutTick1(api: EventModelApi<Sr2020Character>, data: {}) {
  findInDroneModifier(api).postDroneDamage += 1;
}

export function droneReturnTimeoutTick2(api: EventModelApi<Sr2020Character>, data: {}) {
  findInDroneModifier(api).postDroneDamage += 2;
}
