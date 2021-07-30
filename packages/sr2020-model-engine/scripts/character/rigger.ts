import { EffectModelApi, EventModelApi, Modifier, UserVisibleError } from '@alice/alice-common/models/alice-model-engine';
import { AddedImplant, LocationMixin, Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { kAllImplants } from './implants_library';
import { QrCode } from '@alice/sr2020-common/models/qr-code.model';
import { installImplant, removeImplant } from './merchandise';
import { consume } from '../qr/events';
import { createMerchandise } from '../qr/merchandise';
import { autodocHeal, autodocRevive, healthStateTransition } from './death_and_rebirth';
import {
  BodyStorageQrData,
  CyberDeckQrData,
  DroneQrData,
  MerchandiseQrData,
  RepairKitQrData,
  typedQrData,
} from '@alice/sr2020-model-engine/scripts/qr/datatypes';
import { ActiveAbilityData, Implant } from '@alice/sr2020-common/models/common_definitions';
import { duration } from 'moment';
import { putBodyToStorage, removeBodyFromStorage } from '@alice/sr2020-model-engine/scripts/qr/body_storage';
import { DroneType, kDroneAbilityIds, kDroneDangerAbilityIds } from '@alice/sr2020-model-engine/scripts/qr/drone_library';
import { repairDrone, startUsingDroneOrSpirit, stopUsingDroneOrSpirit } from '@alice/sr2020-model-engine/scripts/qr/drones';
import { sendNotificationAndHistoryRecord } from '@alice/sr2020-model-engine/scripts/character/util';
import { addFeatureToModel, removeFeatureFromModel } from '@alice/sr2020-model-engine/scripts/character/features';
import { repairCyberdeck } from '../qr/cyberdecks';

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
  api.model.analyzedBody = null;
}

function checkIfCanWorkWithImplant(rigger: Sr2020Character, implant: AddedImplant | Implant) {
  if (implant.grade == 'bio' && !rigger.rigging.canWorkWithBioware) {
    throw new UserVisibleError('Вы не умеете работать с биоваром');
  }

  if (rigger.intelligence + rigger.rigging.implantsBonus < implant.installDifficulty) {
    throw new UserVisibleError('Вы не умеете работать с настолько сложными имплантами');
  }
}

function checkIfCanWorkWithImplantUninstall(rigger: Sr2020Character, implant: AddedImplant | Implant) {
  if (implant.grade == 'bio') {
    throw new UserVisibleError('Вы не можете удалять биовар');
  }

  if (rigger.intelligence + Math.max(rigger.rigging.implantsBonus, rigger.rigging.repomanBonus) < implant.installDifficulty) {
    throw new UserVisibleError('Вы не умеете работать с настолько сложными имплантами');
  }
}
// Tries to install implant from the QR code.
export function riggerInstallImplant(
  api: EventModelApi<Sr2020Character>,
  data: { targetCharacterId: string; qrCode: string } & LocationMixin,
) {
  const qr = api.aquired(QrCode, data.qrCode);
  if (qr.type != 'implant') {
    throw new UserVisibleError('Отсканированный QR-код не является имплантом.');
  }

  const inTheDroneModifier = findInDroneModifier(api);
  if (!inTheDroneModifier) {
    throw new UserVisibleError('Для установки имплантов нужно быть в автодоке.');
  }

  const implant = kAllImplants.find((it) => it.id == typedQrData<MerchandiseQrData>(qr).id);
  if (implant == undefined) {
    throw new UserVisibleError('Отсканированный QR-код не является имплантом.');
  }

  checkIfCanWorkWithImplant(api.workModel, implant);

  api.sendOutboundEvent(QrCode, data.qrCode, consume, {});
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId, installImplant, {
    ...typedQrData<MerchandiseQrData>(qr),
    location: data.location,
    installer: api.model.modelId,
    autodocQrId: inTheDroneModifier.droneQrId,
    autodocLifestyle: inTheDroneModifier.droneLifestyle,
    abilityId: 'autodoc',
  });

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

  checkIfCanWorkWithImplantUninstall(api.workModel, implant);

  const qr = api.aquired(QrCode, data.qrCode);
  if (qr.type != 'empty') {
    throw new UserVisibleError('Отсканированный QR-код не является пустышкой.');
  }

  const inTheDroneModifier = findInDroneModifier(api);
  if (!inTheDroneModifier) {
    throw new UserVisibleError('Для удаления имплантов нужно быть в автодоке.');
  }

  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId, removeImplant, {
    id: implant.id,
    installer: api.model.modelId,
    autodocQrId: inTheDroneModifier.droneQrId,
    autodocLifestyle: inTheDroneModifier.droneLifestyle,
    abilityId: 'autodoc',
  });
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

export function riggerRevive(api: EventModelApi<Sr2020Character>, data: { targetCharacterId: string } & LocationMixin) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId, autodocRevive, data);
  // Not calling analyzeBody directly as we need for autodocRevive event above propagate first
  api.sendOutboundEvent(Sr2020Character, api.model.modelId, analyzeBody, data);
}

export function riggerHeal(api: EventModelApi<Sr2020Character>, data: { targetCharacterId: string }) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId, autodocHeal, {});
}

const kDroneTimerIds = ['drone-timer-stage-0', 'drone-timer-stage-1', 'drone-timer-stage-2'];

function droneCraft(model: Sr2020Character, droneType: DroneType): number {
  if (droneType == 'aircraft') return model.drones.aircraftBonus;
  if (droneType == 'groundcraft') return model.drones.groundcraftBonus;
  if (droneType == 'medicart') return model.drones.medicraftBonus;
  if (droneType == 'autodoc') return model.drones.autodocBonus;
  return 0;
}

export function enterDrone(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  if (api.workModel.currentBody != 'physical') {
    throw new UserVisibleError('Для подключения к дрону необходимо быть в мясном теле.');
  }

  if (api.workModel.healthState != 'healthy') {
    throw new UserVisibleError('Для входа в дрона необходимо быть здоровым.');
  }

  const drone = typedQrData<DroneQrData>(api.aquired(QrCode, data.droneId!));
  if (drone.broken) {
    throw new UserVisibleError('Ты не можешь подключитсья к этому дрону, он сломан.');
  }

  if (drone.inUse) {
    throw new UserVisibleError('Этот дрон в настоящий момент уже используется.');
  }

  if (api.workModel.drones.maxDifficulty < -100) {
    throw new UserVisibleError('Невозможно управлять дроном не имея RCC.');
  }

  if (api.workModel.drones.maxDifficulty + Math.floor(api.workModel.intelligence / 2) < drone.sensor) {
    throw new UserVisibleError('Ваш RCC не позволяет управлять данным дроном.');
  }

  if (api.workModel.intelligence + droneCraft(api.workModel, drone.type) < drone.sensor) {
    throw new UserVisibleError('У вас не хватает навыков управления этим типом дрона.');
  }

  const timeInDrone = duration(7 * api.workModel.body + api.workModel.drones.maxTimeInside, 'minutes');
  api.setTimer(kDroneTimerIds[0], 'Аварийный выход из дрона', timeInDrone, droneTimeout, {});

  api.sendOutboundEvent(QrCode, data.bodyStorageId!, putBodyToStorage, {
    characterId: api.model.modelId,
    bodyType: api.workModel.currentBody,
    name: api.workModel.name,
    metarace: api.workModel.metarace,
  });

  api.sendOutboundEvent(QrCode, data.droneId!, startUsingDroneOrSpirit, {});

  api.model.activeAbilities = api.model.activeAbilities.concat(drone.activeAbilities);
  for (const passiveAbility of drone.passiveAbilities) {
    addFeatureToModel(api.model, passiveAbility.id);
  }

  const penalty = api.workModel.drones.feedbackModifier;
  api.addModifier(createDroneModifier(drone, data.droneId!, penalty));

  sendNotificationAndHistoryRecord(
    api,
    'Вход в дрона',
    `Вы подключились к дрону. Ваше тело - в телохранилище ${data.bodyStorageId}. Не перепутайте при выходе!`,
  );
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
  api.sendOutboundEvent(QrCode, m.droneQrId, stopUsingDroneOrSpirit, {
    activeAbilities: api.model.activeAbilities.filter((ability) => kDroneAbilityIds.has(ability.id)),
    broken: m.broken,
  });

  for (const abilityId of kDroneAbilityIds) {
    removeFeatureFromModel(api.model, abilityId);
  }

  // Not calling directly as we need to remove modifier and recalculate max HP first.
  api.sendSelfEvent(applyPostDroneDamange, { amount: m.postDroneDamage, location: data.location });
  api.removeModifier(m.mID);
}

export function droneRepairAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  const drone = typedQrData<DroneQrData>(api.aquired(QrCode, data.droneId!));
  if (!drone.broken) {
    throw new UserVisibleError('Этот дрон не сломан.');
  }

  if (typedQrData<RepairKitQrData>(api.aquired(QrCode, data.qrCodeId!)).bonus > 10) {
    throw new UserVisibleError('Это Набор микросхем для кибердеки, ремонт не удался.');
  }

  const droneRepairSkill = api.model.drones.recoverySkill + typedQrData<RepairKitQrData>(api.aquired(QrCode, data.qrCodeId!)).bonus;
  if (droneRepairSkill < drone.sensor) {
    throw new UserVisibleError('Ремонт не удался.');
  }

  api.sendOutboundEvent(QrCode, data.droneId!, repairDrone, {});
  api.sendOutboundEvent(QrCode, data.qrCodeId!, consume, {});
}

export function cyberdeckRepairAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  const cyberdeck = typedQrData<CyberDeckQrData>(api.aquired(QrCode, data.droneId!));
  if (!cyberdeck.broken) {
    throw new UserVisibleError('Эта кибердека не сломана.');
  }

  if (typedQrData<RepairKitQrData>(api.aquired(QrCode, data.qrCodeId!)).bonus < 10) {
    throw new UserVisibleError('Это ремкомплект для дрона, ремонт не удался.');
  }

  const cyberdeckRepairSkill = api.model.drones.recoverySkill + typedQrData<RepairKitQrData>(api.aquired(QrCode, data.qrCodeId!)).bonus;
  if (cyberdeckRepairSkill < 22) {
    throw new UserVisibleError('Ремонт не удался.');
  }

  api.sendOutboundEvent(QrCode, data.droneId!, repairCyberdeck, {});
  api.sendOutboundEvent(QrCode, data.qrCodeId!, consume, {});
}

export function applyPostDroneDamange(api: EventModelApi<Sr2020Character>, data: { amount: number } & LocationMixin) {
  if (data.amount <= 0) {
    sendNotificationAndHistoryRecord(api, 'Выход из дрона', 'Вы вышли из дрона, все в порядке.');
  } else if (data.amount < api.workModel.maxHp) {
    sendNotificationAndHistoryRecord(api, 'Выход из дрона', `При выходе из дрона вы потеряли ${data.amount} хитов.`);
  } else {
    sendNotificationAndHistoryRecord(api, 'Выход из дрона', `При выходе из дрона вы потеряли все хиты, что привело к тяжрану.`);
    healthStateTransition(api, 'wounded', data.location);
  }
}

type InTheDroneModifier = Modifier & {
  hp: number;
  droneQrId: string;
  droneLifestyle: string;
  postDroneDamage: number;
  triggerDanger: number;
  stage: number;
  broken: boolean;
};

function createDroneModifier(drone: DroneQrData, droneQrId: string, postDroneDamage: number): InTheDroneModifier {
  return {
    mID: kInDroneModifierId,
    priority: Modifier.kPriorityLater,
    enabled: true,
    effects: [
      {
        type: 'functional',
        handler: inTheDrone.name,
        enabled: true,
      },
      {
        type: 'normal',
        handler: inTheDroneDisabler.name,
        enabled: true,
      },
    ],
    hp: drone.hitpoints,
    droneQrId,
    droneLifestyle: drone.lifestyle,
    postDroneDamage,
    triggerDanger: 0,
    stage: 0,
    broken: false,
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
  api.model.screens.spellbook = false;
  api.model.screens.implants = false;
  api.model.screens.ethics = false;
}

export function inTheDroneDisabler(api: EffectModelApi<Sr2020Character>, m: InTheDroneModifier) {
  if (m.triggerDanger) {
    api.model.activeAbilities = api.model.activeAbilities.filter((ability) => kDroneDangerAbilityIds.has(ability.id));
    if (m.broken) api.model.screens.passiveAbilities = false;
    api.model.screens.billing = false;
    api.model.screens.autodoc = false;
    api.model.screens.karma = false;
  }
}
export function droneTimeout(api: EventModelApi<Sr2020Character>, data: {}) {
  sendNotificationAndHistoryRecord(
    api,
    'Превышено максимальное время пребывания в дроне',
    'Канал связи нарушен, возможности дрона недоступны! Необходимо срочно вернуться в мясное тело во избежание урона мясному телу.',
  );

  droneEmergencyExit(api, data);
}

export function bodyInStorageWounded(api: EventModelApi<Sr2020Character>, data: {}) {
  sendNotificationAndHistoryRecord(
    api,
    'Мясное тело атаковано',
    'Канал связи нарушен, возможности дрона недоступны! Кто-то атаковал ваше мясное тело в телохранилище. Необходимо срочно в него вернуться во избежание урона мясному телу.',
  );
  droneEmergencyExit(api, data);
}

export function droneDangerAbility(api: EventModelApi<Sr2020Character>, data: {}) {
  findInDroneModifier(api).broken = true;
  sendNotificationAndHistoryRecord(
    api,
    'Внимание, дрон поврежден',
    'Возможности дрона недоступны! Необходимо срочно вернуться в мясное тело во избежание урона мясному телу.',
  );

  droneEmergencyExit(api, data);
}

export function droneEmergencyExit(api: EventModelApi<Sr2020Character>, data: {}) {
  const m = findInDroneModifier(api);
  if (m.stage != 0) return; // Emergency exit already triggered
  m.postDroneDamage += 1;
  m.triggerDanger += 1;

  const timerDescription = 'Увеличение штрафа за слишком долгое пребывание в дроне после аварийного выхода';
  api.setTimer(kDroneTimerIds[1], timerDescription, duration(3 * api.workModel.body, 'minutes'), droneReturnTimeoutTick1, {});
  api.setTimer(kDroneTimerIds[2], timerDescription, duration(6 * api.workModel.body, 'minutes'), droneReturnTimeoutTick2, {});
}

export function droneReturnTimeoutTick1(api: EventModelApi<Sr2020Character>, data: {}) {
  findInDroneModifier(api).postDroneDamage += 1;
  api.sendNotification('Внимание!', 'Необходимо срочно вернуться в мясное тело во избежание сильного урона ему.');
}

export function droneReturnTimeoutTick2(api: EventModelApi<Sr2020Character>, data: {}) {
  findInDroneModifier(api).postDroneDamage += 2;
  api.sendNotification('Внимание!', 'Необходимо срочно вернуться в мясное тело во избежание сильнейшего урона ему.');
}

export function hungerWhileInDrone(api: EventModelApi<Sr2020Character>, data: {}) {
  findInDroneModifier(api).postDroneDamage += 10;
}
