import { EventModelApi, UserVisibleError, Event, Modifier, EffectModelApi } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020Character, AddedImplant } from '@sr2020/interface/models/sr2020-character.model';
import { Implant, kAllImplants } from './implants_library';
import { QrCode } from '@sr2020/interface/models/qr-code.model';
import { installImplant, removeImplant } from './merchandise';
import { consume } from '../qr/events';
import { createMerchandise } from '../qr/merchandise';
import { autodocRevive, autodocHeal } from './death_and_rebirth';
import { BodyStorageQrData, DroneQrData, MerchandiseQrData, typedQrData } from '@sr2020/sr2020-models/scripts/qr/datatypes';
import { ActiveAbilityData } from '@sr2020/sr2020-models/scripts/character/active_abilities';
import { duration } from 'moment';
import { putBodyToStorage, removeBodyFromStorage } from '@sr2020/sr2020-models/scripts/qr/body_storage';
import { kDroneAbilityIds } from '@sr2020/sr2020-models/scripts/qr/drone_library';
import { startUsingDrone, stopUsingDrone } from '@sr2020/sr2020-models/scripts/qr/drones';

const kInDroneModifierId = 'in-the-drone';

export function analyzeBody(api: EventModelApi<Sr2020Character>, data: { targetCharacterId: string }, _: Event) {
  const patient = api.aquired(Sr2020Character, data.targetCharacterId);

  api.model.analyzedBody = {
    essence: patient.essence,
    healthState: patient.healthState,
    implants: patient.implants,
  };
}

export function disconnectFromBody(api: EventModelApi<Sr2020Character>, data: {}, _: Event) {
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
export function riggerInstallImplant(
  api: EventModelApi<Sr2020Character>,
  data: { targetCharacterId: string; qrCode: string },
  event: Event,
) {
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
  event: Event,
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

export function riggerRevive(api: EventModelApi<Sr2020Character>, data: { targetCharacterId: string }, _: Event) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId, autodocRevive, {});
  // Not calling analyzeBody directly as we need for autodocRevive event above propagate first
  api.sendOutboundEvent(Sr2020Character, api.model.modelId, analyzeBody, data);
}

export function riggerHeal(api: EventModelApi<Sr2020Character>, data: { targetCharacterId: string }, _: Event) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId, autodocHeal, {});
}

export function enterDrone(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData, _: Event) {
  if (api.workModel.currentBody != 'physical') {
    throw new UserVisibleError('Для подключения к дрону необходимо быть в мясном теле.');
  }

  const drone = typedQrData<DroneQrData>(api.aquired(QrCode, data.droneId!));
  if (drone.inUse) {
    throw new UserVisibleError('Этот в настоящий момент уже используется.');
  }

  // TODO(https://trello.com/c/HgKga3aT/338-тела-дроны-создать-сущность-дроны-их-можно-покупать-в-магазине-носить-с-собой-на-куар-коде-и-в-них-можно-включаться)
  // TODO: Check sensor
  // TODO: Check skill?
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const timeInDrone = duration(10, 'minutes'); // TODO: Use proper formula
  api.sendOutboundEvent(QrCode, data.bodyStorageId!, putBodyToStorage, {
    characterId: api.model.modelId,
    bodyType: api.workModel.currentBody,
  });

  api.sendOutboundEvent(QrCode, data.droneId!, startUsingDrone, {});

  api.model.activeAbilities = api.model.activeAbilities.concat(drone.activeAbilities);
  api.model.passiveAbilities = api.model.passiveAbilities.concat(drone.passiveAbilities);

  api.addModifier(createDroneModifier(drone, data.droneId!));
}

export function exitDrone(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData, _: Event) {
  if (api.workModel.currentBody != 'drone') {
    throw new UserVisibleError('Для отключения от дрона необходимо быть подключенным к нему.');
  }

  const storage = typedQrData<BodyStorageQrData>(api.aquired(QrCode, data.bodyStorageId!));
  if (!(storage?.body?.characterId == api.model.modelId)) {
    throw new UserVisibleError('Данная ячейка телохранилище не содержит ваше тело.');
  }
  api.sendOutboundEvent(QrCode, data.bodyStorageId!, removeBodyFromStorage, {});

  const m = findInDroneModifier(api);
  api.sendOutboundEvent(QrCode, m.droneQrId, stopUsingDrone, {
    activeAbilities: api.workModel.activeAbilities.filter((ability) => kDroneAbilityIds.has(ability.id)),
  });

  const isDroneAbility = (ability) => !kDroneAbilityIds.has(ability.id);
  api.model.activeAbilities = api.model.activeAbilities.filter(isDroneAbility);
  api.model.passiveAbilities = api.model.passiveAbilities.filter(isDroneAbility);

  api.removeModifier(m.mID);

  // TODO(https://trello.com/c/HgKga3aT/338-тела-дроны-создать-сущность-дроны-их-можно-покупать-в-магазине-носить-с-собой-на-куар-коде-и-в-них-можно-включаться)
  // TODO: Calculate damage and send a notification
}

type InTheDroneModifier = Modifier & { hp: number; droneQrId: string };

function createDroneModifier(drone: DroneQrData, droneQrId: string): InTheDroneModifier {
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
