import { EventModelApi, UserVisibleError } from '@alice/alice-common/models/alice-model-engine';
import { AddedImplant, LocationMixin, MetaRace, Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { kAllImplants } from './implants_library';
import { sendNotificationAndHistoryRecord } from './util';
import { MerchandiseQrData } from '@alice/sr2020-model-engine/scripts/qr/datatypes';
import { Implant, ImplantSlot } from '@alice/sr2020-common/models/common_definitions';

export interface ImplantInstallData {
  installer: string;
  autodocLifestyle: string;
  autodocQrId: string;
}

export function installImplant(api: EventModelApi<Sr2020Character>, data: MerchandiseQrData & LocationMixin & ImplantInstallData) {
  if (api.workModel.currentBody != 'physical') {
    throw new UserVisibleError('Импланты можно устанавливать только в мясное тело');
  }

  const implant = kAllImplants.find((it) => it.id == data.id);
  if (!implant) {
    throw new UserVisibleError(`Импланта ${data.id} не существует`);
  }

  if (api.model.implants.filter((it) => it.slot == implant.slot).length >= maxImplantsPerSlot(api.workModel, implant.slot)) {
    throw new UserVisibleError(`Все слоты нужного типа заняты, сначала удалите имплант из одного из них.`);
  }

  const supportedRaces: MetaRace[] = ['meta-norm', 'meta-elf', 'meta-dwarf', 'meta-ork', 'meta-troll'];
  if (implant.grade == 'bio') {
    supportedRaces.push('meta-vampire', 'meta-ghoul');
  }

  if (!supportedRaces.includes(api.model.metarace)) {
    throw new UserVisibleError('Данный имплант нельзя установить представителю этой метарасы');
  }

  reduceEssenceDueToImplantInstall(api, implant);

  if (implant.onInstallEvent) {
    api.sendSelfEvent(implant.onInstallEvent, {});
  }

  const addedImplant: AddedImplant = {
    id: implant.id,
    name: implant.name,
    description: implant.description,
    slot: implant.slot,
    grade: implant.grade,
    installDifficulty: implant.installDifficulty,
    essenceCost: implant.essenceCost,
    basePrice: data.basePrice,
    rentPrice: data.rentPrice,
    gmDescription: data.gmDescription,
    dealId: data.dealId,
    lifestyle: data.lifestyle,
    modifierIds: implant.modifiers.map((it) => api.addModifier(it).mID),
  };
  api.model.implants.push(addedImplant);
  sendNotificationAndHistoryRecord(api, 'Имплант установлен', `Установлен имплант ${addedImplant.name}`);
  api.sendPubSubNotification('implant_install', {
    characterId: api.model.modelId,
    id: implant.id,
    implantLifestyle: data.lifestyle,
    autodocLifestyle: data.autodocLifestyle,
    autodocQrId: data.autodocQrId,
    installer: data.installer,
    location: data.location,
  });
}

export function removeImplant(api: EventModelApi<Sr2020Character>, data: { id: string } & Partial<ImplantInstallData>) {
  if (api.workModel.currentBody != 'physical') {
    throw new UserVisibleError('Импланты можно удалять только из мясного тела');
  }

  const libraryImplant = kAllImplants.find((it) => it.id == data.id);
  if (!libraryImplant) {
    throw new UserVisibleError(`Импланта ${data.id} не существует`);
  }

  const implantIndex = api.model.implants.findIndex((it) => it.id == data.id);
  if (implantIndex == -1) {
    throw new UserVisibleError(`Импланта ${data.id} не установлено`);
  }

  const implant = api.model.implants[implantIndex];
  createGapDueToImplantUninstall(api, implant);

  if (libraryImplant.onRemoveEvent) {
    api.sendSelfEvent(libraryImplant.onRemoveEvent, {});
  }

  sendNotificationAndHistoryRecord(api, 'Имплант удален', `Удален имплант ${implant.name}`);
  api.model.implants[implantIndex].modifierIds.forEach((id) => api.removeModifier(id));
  api.model.implants.splice(implantIndex, 1);

  api.sendPubSubNotification('implant_uninstall', {
    characterId: api.model.modelId,
    id: implant.id,
    autodocQrId: data.autodocQrId,
    installer: data.installer,
  });
}

function maxImplantsPerSlot(model: Sr2020Character, slot: ImplantSlot) {
  if (slot == 'rcc') return 1;
  if (slot == 'body') return model.implantsBodySlots;
  return 2;
}

function reduceEssenceDueToImplantInstall(api: EventModelApi<Sr2020Character>, implant: Implant) {
  const cost = Math.floor(100 * implant.essenceCost);
  if (cost > api.workModel.essence + api.workModel.essenceDetails.gap - 100) {
    throw new UserVisibleError('Невозможно установить имплант в данное тело');
  }

  api.model.essenceDetails.used += cost;
  api.model.essenceDetails.gap -= Math.min(api.model.essenceDetails.gap, cost);
}

function createGapDueToImplantUninstall(api: EventModelApi<Sr2020Character>, implant: AddedImplant) {
  const cost = Math.floor(100 * implant.essenceCost);
  api.model.essenceDetails.used -= cost;
  api.model.essenceDetails.gap += cost;
}
