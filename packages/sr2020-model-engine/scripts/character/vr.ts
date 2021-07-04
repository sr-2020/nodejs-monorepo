import { EffectModelApi, EventModelApi, Modifier, UserVisibleError } from '@alice/alice-common/models/alice-model-engine';
import { LocationMixin, Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { QrCode } from '@alice/sr2020-common/models/qr-code.model';
import { healthStateTransition } from './death_and_rebirth';
import { BodyStorageQrData, typedQrData } from '@alice/sr2020-model-engine/scripts/qr/datatypes';
import { ActiveAbilityData } from '@alice/sr2020-common/models/common_definitions';
import { duration } from 'moment';
import { putBodyToStorage, removeBodyFromStorage } from '@alice/sr2020-model-engine/scripts/qr/body_storage';
import { sendNotificationAndHistoryRecord } from '@alice/sr2020-model-engine/scripts/character/util';
import { addFeatureToModel } from '@alice/sr2020-model-engine/scripts/character/features';

const kInVrModifierId = 'in-vr';

const kVrTimerIds = ['vr-timer-first-notice', 'vr-timer-last-notice', 'vr-timer-too-late', 'vr-timer-way-too-late'];

export function enterVr(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  if (api.workModel.currentBody != 'physical') {
    throw new UserVisibleError('Для входа в VR необходимо быть в мясном теле.');
  }

  const timeInVr = duration(api.workModel.maxTimeInVr, 'minutes');
  api.setTimer(
    kVrTimerIds[0],
    'Оповещение о необходимости выйти из VR в течение 20 минут',
    duration(api.workModel.maxTimeInVr - 20, 'minutes'),
    vrFirstNotice,
    {},
  );
  api.setTimer(
    kVrTimerIds[1],
    'Оповещение о необходимости выйти из VR в течение 10 минут',
    duration(api.workModel.maxTimeInVr - 10, 'minutes'),
    vrSecondNotice,
    {},
  );
  api.setTimer(kVrTimerIds[2], 'Падение в тяжран при выходе из VR', duration(api.workModel.maxTimeInVr, 'minutes'), vrWoundOnExit, {});
  api.setTimer(
    kVrTimerIds[3],
    'Падение в КС при выходе из VR',
    duration(api.workModel.maxTimeInVr + 20, 'minutes'),
    vrClinicalDeathOnExit,
    {},
  );

  api.sendOutboundEvent(QrCode, data.bodyStorageId!, putBodyToStorage, {
    characterId: api.model.modelId,
    bodyType: api.workModel.currentBody,
    name: api.workModel.name,
    metarace: api.workModel.metarace,
  });

  api.addModifier(createVrModifier());
}

export function exitVr(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  if (api.workModel.currentBody != 'vr') {
    throw new UserVisibleError('Для выхода из VR нужно быть в VR!');
  }

  const storage = typedQrData<BodyStorageQrData>(api.aquired(QrCode, data.bodyStorageId!));
  if (!(storage?.body?.characterId == api.model.modelId)) {
    throw new UserVisibleError('Данная ячейка телохранилище не содержит ваше тело.');
  }
  api.sendOutboundEvent(QrCode, data.bodyStorageId!, removeBodyFromStorage, {});

  for (const timerId of kVrTimerIds) api.removeTimer(timerId);

  const m = findInVrModifier(api);

  // Not calling directly as we need to remove modifier and recalculate max HP first.
  // api.sendSelfEvent(applyPostVrDamange, { amount: m.postDroneDamage, location: data.location });
  // TODO(aeremin) Wound/Clinical death if needed
  api.sendSelfEvent(applyPostVrDamange, { amount: m.stage, location: data.location });
  api.removeModifier(m.mID);
}

export function applyPostVrDamange(api: EventModelApi<Sr2020Character>, data: { amount: number } & LocationMixin) {
  if (data.amount <= 0) {
    sendNotificationAndHistoryRecord(api, 'Выход из VR', 'Вы вышли из VR, все в порядке.');
  } else if (data.amount < api.workModel.maxHp) {
    sendNotificationAndHistoryRecord(api, 'Выход из VR', 'Вы превысили максимальное время в VR, что привело к тяжрану.');
    healthStateTransition(api, 'wounded', data.location);
  } else {
    sendNotificationAndHistoryRecord(api, 'Выход из VR', 'Вы сильно превысили максимальное время в VR, что привело к КС.');
    healthStateTransition(api, 'clinically_dead', data.location);
  }
}

type InVrModifier = Modifier & {
  stage: number;
};

function createVrModifier(): InVrModifier {
  return {
    mID: kInVrModifierId,
    priority: Modifier.kPriorityLater,
    enabled: true,
    effects: [
      {
        type: 'functional',
        handler: inVr.name,
        enabled: true,
      },
    ],
    stage: 0,
  };
}

function findInVrModifier(api: EventModelApi<Sr2020Character>) {
  const m = api.getModifierById(kInVrModifierId);
  if (!m) {
    throw new UserVisibleError('Для выхода из VR необходимо быть в нем.');
  }
  return m as InVrModifier;
}

export function inVr(api: EffectModelApi<Sr2020Character>, m: InVrModifier) {
  api.model.currentBody = 'vr';
  api.model.screens.spellbook = false;
  api.model.screens.implants = false;
  api.model.screens.ethics = false;
  addFeatureToModel(api.model, 'exit-vr');
  api.model.activeAbilities = api.model.activeAbilities.filter((it) => it.id != 'enter-vr' && it.id != 'compile-coldsim');
}

export function vrFirstNotice(api: EventModelApi<Sr2020Character>, data: {}) {
  api.sendNotification('Внимание!', 'Осталось 20 минут в VR.');
}

export function vrSecondNotice(api: EventModelApi<Sr2020Character>, data: {}) {
  api.sendNotification('Внимание!', 'Осталось 10 минут в VR.');
}

export function vrWoundOnExit(api: EventModelApi<Sr2020Character>, data: {}) {
  sendNotificationAndHistoryRecord(api, 'Превышено максимальное время пребывания в VR', 'При выходе вы упадете в тяжран');

  findInVrModifier(api).stage = Math.max(findInVrModifier(api).stage, 1);
}

export function vrClinicalDeathOnExit(api: EventModelApi<Sr2020Character>, data: {}) {
  sendNotificationAndHistoryRecord(api, 'Превышено максимальное время пребывания в VR', 'При выходе вы упадете в КС');
  findInVrModifier(api).stage = Math.max(findInVrModifier(api).stage, 2);
}

export function hungerWhileInVr(api: EventModelApi<Sr2020Character>, data: {}) {
  findInVrModifier(api).stage = Math.max(findInVrModifier(api).stage, 1);
}
