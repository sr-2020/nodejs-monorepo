import { EventModelApi, Event } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';

export function consumeFood(api: EventModelApi<Sr2020Character>, data: {}, _: Event) {
  // TODO(https://trello.com/c/p5b8tVmS/235-голод-нужно-есть-в-x-часов-или-теряешь-хиты-еда-убирает-голод) Implement
  api.sendPubSubNotification('food_consumption', { ...data, characterId: Number(api.model.modelId) });
}

export function installImplant(api: EventModelApi<Sr2020Character>, data: {}, _: Event) {
  // TODO(https://trello.com/c/Q3Hpk4xw/213-реализовать-импланты-в-приложении-просто-тестовые-как-установку-так-и-наличие) Implement
}
