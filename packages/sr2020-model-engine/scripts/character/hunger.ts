import { EventModelApi, UserVisibleError } from '@alice/alice-common/models/alice-model-engine';
import { LocationMixin, Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { MerchandiseQrData } from '@alice/sr2020-model-engine/scripts/qr/datatypes';
import { sendNotificationAndHistoryRecord } from '@alice/sr2020-model-engine/scripts/character/util';
import { healthStateTransition } from '@alice/sr2020-model-engine/scripts/character/death_and_rebirth';
import { isHmhvv } from '@alice/sr2020-model-engine/scripts/character/common_helpers';
import {
  kHmhvvHungerPeriod,
  kHmhvvHungerTimer,
  kHmhvvHungerTimerDescription,
  kHungerReminderTimerDescription,
  kHungerReminderTimerName,
  kHungerReminderTimerOffset,
  kHungerTimerDuration,
  kHungerTimerName,
  kHungerTimerStage1Description,
  kHungerTimerStage2Description,
} from '@alice/sr2020-model-engine/scripts/character/consts';
import { hungerTick } from '@alice/sr2020-model-engine/scripts/character/races';
import { duration } from 'moment';
import { hungerWhileInSpirit } from '@alice/sr2020-model-engine/scripts/character/spirits';
import { hungerWhileInDrone } from '@alice/sr2020-model-engine/scripts/character/rigger';
import { hungerWhileInVr } from '@alice/sr2020-model-engine/scripts/character/vr';

export function consumeFood(api: EventModelApi<Sr2020Character>, data: MerchandiseQrData & LocationMixin) {
  if (api.model.metarace == 'meta-digital') throw new UserVisibleError('Вы не испытываете потребности в пище.');

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

export function hungerReminder(api: EventModelApi<Sr2020Character>, data: {}) {
  api.sendNotification('Голод', 'Вы голодны, нужно поесть в течение часа.');
}

export function hungerStage1(api: EventModelApi<Sr2020Character>, data: {}) {
  api.setTimer(kHungerTimerName, kHungerTimerStage2Description, getHungerTimerDuration(api.workModel), hungerStage2, {});
  api.setTimer(
    kHungerReminderTimerName,
    kHungerReminderTimerDescription,
    getHungerReminderTimerDuration(api.workModel),
    hungerReminder,
    {},
  );

  if (api.workModel.healthState != 'healthy') return;
  switch (api.workModel.currentBody) {
    case 'physical': {
      sendNotificationAndHistoryRecord(api, 'Голод', 'Вы потеряли сознание от голода. Тяжелое ранение.');
      healthStateTransition(api, 'wounded', undefined);
      break;
    }
    case 'drone': {
      sendNotificationAndHistoryRecord(api, 'Голод', 'Вы очень голодны. После выхода из дрона вы упадете в тяжран.');
      hungerWhileInDrone(api, {});
      break;
    }
    case 'ectoplasm': {
      sendNotificationAndHistoryRecord(api, 'Голод', 'Вы очень голодны. После выхода из духа вы упадете в тяжран.');
      hungerWhileInSpirit(api, {});
      break;
    }
    case 'vr': {
      sendNotificationAndHistoryRecord(api, 'Голод', 'Вы очень голодны. После выхода из VR вы упадете в тяжран.');
      hungerWhileInVr(api, {});
      break;
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
      api.setTimer(kHungerTimerName, kHungerTimerStage2Description, duration(1, 'hour'), hungerStage2, {});
      hungerWhileInDrone(api, {});
      break;
    }
    case 'ectoplasm': {
      sendNotificationAndHistoryRecord(api, 'Голод', 'Вы очень голодны. После выхода из духа вы упадете в тяжран.');
      api.setTimer(kHungerTimerName, kHungerTimerStage2Description, duration(1, 'hour'), hungerStage2, {});
      hungerWhileInSpirit(api, {});
      break;
    }
    case 'vr': {
      sendNotificationAndHistoryRecord(api, 'Голод', 'Вы очень голодны. После выхода из VR вы упадете в тяжран.');
      api.setTimer(kHungerTimerName, kHungerTimerStage2Description, duration(1, 'hour'), hungerStage2, {});
      hungerWhileInVr(api, {});
      break;
    }
  }
}

export function removeHunger(model: Sr2020Character) {
  model.timers = model.timers.filter((timer) => ![kHungerTimerName, kHungerReminderTimerName].includes(timer.name));
}

export function resetHunger(model: Sr2020Character) {
  removeHunger(model);
  model.timers.push({
    name: kHungerTimerName,
    description: kHungerTimerStage1Description,
    miliseconds: getHungerTimerDuration(model).asMilliseconds(),
    eventType: hungerStage1.name,
    data: {},
  });
  model.timers.push({
    name: kHungerReminderTimerName,
    description: kHungerReminderTimerDescription,
    miliseconds: getHungerReminderTimerDuration(model).asMilliseconds(),
    eventType: hungerReminder.name,
    data: {},
  });
}

export function removeHmhvvHunger(model: Sr2020Character) {
  model.timers = model.timers.filter((timer) => timer.name != kHmhvvHungerTimer);
}

export function resetHmhvvHunger(model: Sr2020Character) {
  removeHmhvvHunger(model);
  model.timers.push({
    name: kHmhvvHungerTimer,
    description: kHmhvvHungerTimerDescription,
    miliseconds: kHmhvvHungerPeriod.asMilliseconds(),
    eventType: hungerTick.name,
    data: {},
  });
}

export function getHungerTimerDuration(model: Sr2020Character) {
  const eatsMoreOften = !!model.passiveAbilities.find((ability) => ability.id == 'feed-tamagochi');
  return duration(kHungerTimerDuration * (eatsMoreOften ? 0.5 : 1), 'milliseconds');
}

export function getHungerReminderTimerDuration(model: Sr2020Character) {
  return duration(getHungerTimerDuration(model).asMilliseconds() - kHungerReminderTimerOffset.asMilliseconds(), 'milliseconds');
}

export function restartAllHungers(model: Sr2020Character) {
  removeHmhvvHunger(model);
  removeHunger(model);

  if (model.metarace == 'meta-digital') return;

  if (isHmhvv(model)) {
    resetHmhvvHunger(model);
  } else {
    resetHunger(model);
  }
}

export function stopAllHungersEvent(api: EventModelApi<Sr2020Character>, data: never) {
  removeHmhvvHunger(api.model);
  removeHunger(api.model);
}

export function restartAllHungersEvent(api: EventModelApi<Sr2020Character>, data: never) {
  restartAllHungers(api.model);
}
