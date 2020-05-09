import { EventModelApi, UserVisibleError, Event } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020Character, AddedImplant } from '@sr2020/interface/models/sr2020-character.model';
import { Implant, kAllImplants } from './implants_library';
import { QrCode } from '@sr2020/interface/models/qr-code.model';
import { installImplant, removeImplant } from './merchandise';
import { consume } from '../qr/events';
import { createMerchandise } from '../qr/merchandise';
import { autodocRevive, autodocHeal } from './death_and_rebirth';
import { MerchandiseQrData, typedQrData } from '@sr2020/sr2020-models/scripts/qr/datatypes';

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
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId, installImplant, { id: typedQrData<MerchandiseQrData>(qr).id });

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
    // TODO(aeremin): Should we have some data here, like a globally-unique implant id?
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
