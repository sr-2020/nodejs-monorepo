import { EventModelApi, Event, UserVisibleError } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020Character, AddedImplant } from '@sr2020/interface/models/sr2020-character.model';
import { kAllImplants } from './implants_library';

export function consumeFood(api: EventModelApi<Sr2020Character>, data: {}, _: Event) {
  // TODO(https://trello.com/c/p5b8tVmS/235-голод-нужно-есть-в-x-часов-или-теряешь-хиты-еда-убирает-голод) Implement
  api.sendPubSubNotification('food_consumption', { ...data, characterId: Number(api.model.modelId) });
}

export function installImplant(api: EventModelApi<Sr2020Character>, data: { id: string }, _: Event) {
  const implant = kAllImplants.find((it) => it.id == data.id);
  if (!implant) {
    throw new UserVisibleError(`Импланта ${data.id} не существует`);
  }

  const addedImplant: AddedImplant = {
    id: implant.id,
    name: implant.name,
    description: implant.description,
    slot: implant.slot,
    grade: implant.grade,
    modifierIds: implant.modifiers.map((it) => api.addModifier(it).mID),
  };
  api.model.implants.push(addedImplant);
}

export function removeImplant(api: EventModelApi<Sr2020Character>, data: { id: string }, _: Event) {
  const implantIndex = api.model.implants.findIndex((it) => it.id == data.id);
  if (implantIndex == -1) {
    throw new UserVisibleError(`Импланта ${data.id} не установлено`);
  }

  api.model.implants[implantIndex].modifierIds.forEach((id) => api.removeModifier(id));
  api.model.implants.splice(implantIndex);
}
