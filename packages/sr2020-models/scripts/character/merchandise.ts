import { EventModelApi, Event, UserVisibleError } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020Character, AddedImplant, MetaRace } from '@sr2020/interface/models/sr2020-character.model';
import { kAllImplants, ImplantSlot } from './implants_library';
import { sendNotificationAndHistoryRecord } from './util';
import { reduceEssenceDueToImplantInstall, createGapDueToImplantUninstall } from './essence';

export function consumeFood(api: EventModelApi<Sr2020Character>, data: {}, _: Event) {
  // TODO(https://trello.com/c/p5b8tVmS/235-голод-нужно-есть-в-x-часов-или-теряешь-хиты-еда-убирает-голод) Implement
  api.sendPubSubNotification('food_consumption', { ...data, characterId: Number(api.model.modelId) });
}
export function installImplant(api: EventModelApi<Sr2020Character>, data: { id: string }, _: Event) {
  const implant = kAllImplants.find((it) => it.id == data.id);
  if (!implant) {
    throw new UserVisibleError(`Импланта ${data.id} не существует`);
  }

  if (api.model.implants.filter((it) => it.slot == implant.slot).length >= maxImplantsPerSlot(implant.slot)) {
    throw new UserVisibleError(`Все слоты нужного типа заняты, сначала удалите имплант из одного из них.`);
  }

  const supportedRaces: MetaRace[] = ['meta-norm', 'meta-elf', 'meta-dwarf', 'meta-ork', 'meta-troll'];
  if (implant.grade == 'bio') {
    supportedRaces.push('meta-hmhvv');
  }

  if (!supportedRaces.includes(api.model.metarace)) {
    throw new UserVisibleError('Данный имплант нельзя установить представителю этой метарасы');
  }

  reduceEssenceDueToImplantInstall(api, implant);

  const addedImplant: AddedImplant = {
    id: implant.id,
    name: implant.name,
    description: implant.description,
    slot: implant.slot,
    grade: implant.grade,
    installDifficulty: implant.installDifficulty,
    essenceCost: implant.essenceCost,
    modifierIds: implant.modifiers.map((it) => api.addModifier(it).mID),
  };
  api.model.implants.push(addedImplant);
  sendNotificationAndHistoryRecord(api, 'Имплант установлен', `Установлен имплант ${addedImplant.name}`);
}

export function removeImplant(api: EventModelApi<Sr2020Character>, data: { id: string }, _: Event) {
  const implantIndex = api.model.implants.findIndex((it) => it.id == data.id);
  if (implantIndex == -1) {
    throw new UserVisibleError(`Импланта ${data.id} не установлено`);
  }

  const implant = api.model.implants[implantIndex];

  createGapDueToImplantUninstall(api, implant);

  sendNotificationAndHistoryRecord(api, 'Имплант удален', `Удален имплант ${implant.name}`);
  api.model.implants[implantIndex].modifierIds.forEach((id) => api.removeModifier(id));
  api.model.implants.splice(implantIndex, 1);
}

function maxImplantsPerSlot(slot: ImplantSlot) {
  if (slot == 'rcc') return 1;
  return 2;
}
