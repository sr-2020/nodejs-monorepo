import { EventModelApi, UserVisibleError } from '@alice/interface/models/alice-model-engine';
import { LocationMixin, Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { MerchandiseQrData } from '@alice/sr2020-model-engine/scripts/qr/datatypes';
import { sendNotificationAndHistoryRecord } from '@alice/sr2020-model-engine/scripts/character/util';
import { healthStateTransition } from '@alice/sr2020-model-engine/scripts/character/death_and_rebirth';
import { hungerWhileInDone } from '@alice/sr2020-model-engine/scripts/character/rigger';
import { getHungerTimerDuration, isHmhvv, resetHunger } from '@alice/sr2020-model-engine/scripts/character/common_helpers';
import { kHungerTimerName, kHungerTimerStage2Description } from '@alice/sr2020-model-engine/scripts/character/consts';

export function consumeFood(api: EventModelApi<Sr2020Character>, data: MerchandiseQrData & LocationMixin) {
  if (data.id == 'food') {
    if (isHmhvv(api.model)) throw new UserVisibleError('Вы не можете употреблять такую еду');
    resetHunger(api.model);
    api.sendPubSubNotification('food_consumption', { ...data, characterId: Number(api.model.modelId) });
  } else if (data.id == 'cow-meat') {
    if (api.workModel.metarace != 'meta-ghoul') throw new UserVisibleError('Вы не можете употреблять такую еду');
    api.model.essenceDetails.gap = Math.max(0, api.model.essenceDetails.gap - 100);
  } else if (data.id == 'cow-blood') {
    if (api.workModel.metarace != 'meta-vampire') throw new UserVisibleError('Вы не можете употреблять такую еду');
    api.model.essenceDetails.gap = Math.max(0, api.model.essenceDetails.gap - 100);
  } else {
    throw new UserVisibleError('Неподдерживаемая еда!');
  }
  sendNotificationAndHistoryRecord(api, 'Питание', 'Вы поели и утолили голод.');
}

export function hungerStage1(api: EventModelApi<Sr2020Character>, data: {}) {
  api.setTimer(kHungerTimerName, kHungerTimerStage2Description, getHungerTimerDuration(api.workModel), hungerStage2, {});
  if (api.workModel.healthState != 'healthy') return;
  switch (api.workModel.currentBody) {
    case 'physical': {
      sendNotificationAndHistoryRecord(api, 'Голод', 'Вы потеряли сознание от голода. Тяжелое ранение.');
      healthStateTransition(api, 'wounded', undefined);
      break;
    }
    case 'drone': {
      sendNotificationAndHistoryRecord(api, 'Голод', 'Вы очень голодны. После выхода из дрона вы упадете в тяжран.');
      hungerWhileInDone(api, {});
      break;
    }
    case 'astral': {
      // TODO(aeremin): Handle this (similar to drone case?)
    }
  }
}

export function hungerStage2(api: EventModelApi<Sr2020Character>, data: {}) {
  if (api.workModel.healthState == 'biologically_dead' || api.workModel.healthState == 'clinically_dead') return;

  switch (api.workModel.currentBody) {
    case 'physical': {
      sendNotificationAndHistoryRecord(api, 'Голод', 'Клиническая смерть от голода.');
      healthStateTransition(api, 'clinically_dead', undefined);
      break;
    }
    case 'drone': {
      sendNotificationAndHistoryRecord(api, 'Голод', 'Вы очень голодны. После выхода из дрона вы упадете в тяжран.');
      hungerWhileInDone(api, {});
      break;
    }
    case 'astral': {
      // TODO(aeremin): Handle this (similar to drone case?)
    }
  }
}
