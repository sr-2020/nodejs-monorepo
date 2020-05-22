import { EventModelApi } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { MerchandiseQrData } from '@sr2020/sr2020-models/scripts/qr/datatypes';
import { duration } from 'moment';
import { sendNotificationAndHistoryRecord } from '@sr2020/sr2020-models/scripts/character/util';
import { healthStateTransition } from '@sr2020/sr2020-models/scripts/character/death_and_rebirth';

const kHungerTimerName = 'normal-hunger';
const kHungerTimerDuration = duration(6, 'hours');
const kHungerTimerStage1Description = 'Голодный обморок';
const kHungerTimerStage2Description = 'Смерть от голода';

export function resetHungerEvent(api: EventModelApi<Sr2020Character>, data: {}) {
  resetHunger(api.model);
}

export function resetHunger(model: Sr2020Character) {
  model.timers = model.timers.filter((timer) => timer.name != kHungerTimerName);
  model.timers.push({
    name: kHungerTimerName,
    description: kHungerTimerStage1Description,
    miliseconds: kHungerTimerDuration.asMilliseconds(),
    eventType: hungerStage1.name,
    data: {},
  });
}

export function consumeFood(api: EventModelApi<Sr2020Character>, data: MerchandiseQrData) {
  resetHunger(api.model);
  api.sendPubSubNotification('food_consumption', { ...data, characterId: Number(api.model.modelId) });
}

export function hungerStage1(api: EventModelApi<Sr2020Character>, data: {}) {
  api.setTimer(kHungerTimerName, kHungerTimerStage2Description, kHungerTimerDuration, hungerStage2, {});
  if (api.workModel.healthState != 'healthy') return;
  sendNotificationAndHistoryRecord(api, 'Голод', 'Вы потеряли сознание от голода. Тяжелое ранение.');
  healthStateTransition(api, 'wounded');
}

export function hungerStage2(api: EventModelApi<Sr2020Character>, data: {}) {
  if (api.workModel.healthState == 'biologically_dead' || api.workModel.healthState == 'clinically_dead') return;
  sendNotificationAndHistoryRecord(api, 'Голод', 'Клиническая смерть от голода.');
  healthStateTransition(api, 'clinically_dead');
}
