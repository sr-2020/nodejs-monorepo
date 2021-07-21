import { EffectModelApi, EventModelApi, Modifier, UserVisibleError } from '@alice/alice-common/models/alice-model-engine';
import { LocationMixin, Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { ActiveAbilityData } from '@alice/sr2020-common/models/common_definitions';
import { duration } from 'moment';
import { addFeatureToModel, removeFeatureFromModel } from '@alice/sr2020-model-engine/scripts/character/features';
import { sendNotificationAndHistoryRecord } from '@alice/sr2020-model-engine/scripts/character/util';
import { healthStateTransition } from '@alice/sr2020-model-engine/scripts/character/death_and_rebirth';
import { kCommonSpiritAbilityIds, Spirit } from '@alice/sr2020-model-engine/scripts/qr/spirits_library';
import { QrCode } from '@alice/sr2020-common/models/qr-code.model';
import { putBodyToStorage, removeBodyFromStorage } from '@alice/sr2020-model-engine/scripts/qr/body_storage';
import { freeSpirit, putSpiritInJar } from '@alice/sr2020-model-engine/scripts/qr/events';
import { BodyStorageQrData, SpiritJarQrData, typedQrData } from '@alice/sr2020-model-engine/scripts/qr/datatypes';

export const kSpiritTimerIds = ['spirit-timer-stage-0', 'spirit-timer-stage-1', 'spirit-timer-stage-2', 'spirit-timer-stage-3'];
const kInSpiritModifierId = 'in-the-spirit';

export function suitSpirit(api: EventModelApi<Sr2020Character>, data: Spirit & ActiveAbilityData) {
  const spiritJarId = data.qrCodeId;
  if (!spiritJarId || api.aquired(QrCode, spiritJarId).type != 'spirit_jar') {
    throw new UserVisibleError('Цель не является духохранилищем.');
  }

  const spiritJar = typedQrData<SpiritJarQrData>(api.aquired(QrCode, spiritJarId));

  const bodyStorageId = data.bodyStorageId;
  if (!bodyStorageId || api.aquired(QrCode, bodyStorageId).type != 'body_storage') {
    throw new UserVisibleError('Цель не является телохранилищем.');
  }
  api.sendOutboundEvent(QrCode, bodyStorageId, putBodyToStorage, {
    characterId: api.model.modelId,
    bodyType: api.model.currentBody,
    name: api.workModel.name,
    metarace: api.workModel.metarace,
  });
  api.sendOutboundEvent(QrCode, spiritJarId, freeSpirit, { reason: 'Дух используется.' });
  enterSpirit(api, { ...data, spiritId: spiritJar.spiritId, bodyStorageId });
}

export function enterSpirit(api: EventModelApi<Sr2020Character>, data: Spirit & { spiritId: string; bodyStorageId: string }) {
  if (api.workModel.currentBody != 'physical') {
    throw new UserVisibleError('Для входа в духа необходимо быть в мясном теле.');
  }

  data.abilityIds = [...data.abilityIds, ...kCommonSpiritAbilityIds];
  for (const id of data.abilityIds) {
    addFeatureToModel(api.model, id);
  }

  api.addModifier(createSpiritModifier(data));
}

export function exitSpirit(api: EventModelApi<Sr2020Character>, data: LocationMixin) {
  if (api.workModel.currentBody != 'ectoplasm') {
    throw new UserVisibleError('Для выхода из духа необходимо быть подключенным к нему.');
  }

  for (const timerId of kSpiritTimerIds) api.removeTimer(timerId);

  const m = findInSpiritModifier(api);
  for (const abilityId of m.abilityIds) {
    removeFeatureFromModel(api.model, abilityId);
  }

  // Not calling directly as we need to remove modifier and recalculate max HP first.
  api.sendSelfEvent(applyPostSpiritDamange, { amount: m.postSpiritDamage, location: data.location });
  api.removeModifier(m.mID);
}

export function dispirit(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  const spiritJarId = data.qrCodeId;
  const bodyStorageId = data.bodyStorageId;
  if (!bodyStorageId || api.aquired(QrCode, bodyStorageId).type != 'body_storage') {
    throw new UserVisibleError('Цель не является телохранилищем.');
  }
  const storage = typedQrData<BodyStorageQrData>(api.aquired(QrCode, bodyStorageId));
  if (!(storage?.body?.characterId == api.model.modelId)) {
    throw new UserVisibleError('Данная ячейка телохранилище не содержит ваше тело.');
  }
  api.sendOutboundEvent(QrCode, bodyStorageId, removeBodyFromStorage, {});

  if (spiritJarId) {
    api.sendOutboundEvent(QrCode, spiritJarId, putSpiritInJar, { spiritId: findInSpiritModifier(api).spiritId });
  }
  exitSpirit(api, data);
}

export function zeroSpiritAbilities(api: EventModelApi<Sr2020Character>, data: never) {
  const m = findInSpiritModifier(api);
  if (!m) {
    throw new UserVisibleError('Персонаж не в духе.');
  }
  for (const abilityId of m.abilityIds) {
    if (!kCommonSpiritAbilityIds.includes(abilityId)) {
      removeFeatureFromModel(api.model, abilityId);
    }
  }
  m.abilityIds = kCommonSpiritAbilityIds;
  sendNotificationAndHistoryRecord(
    api,
    'Эктоплазма разрушается',
    'Вам нужно срочно вернуться в мясное тело, иначе через 10 минут наступит клиническая смерть',
  );
  api.setTimer(kSpiritTimerIds[3], 'Клиническая смерть, если не успеете вернуться в мясное тело', duration(10, 'minutes'), '_', {});
}

export function emergencySpiritExit(api: EventModelApi<Sr2020Character>, data: unknown) {
  const bodyStorageId = findInSpiritModifier(api).bodyStorageId;
  api.sendOutboundEvent(QrCode, bodyStorageId, removeBodyFromStorage, {});
  exitSpirit(api, { location: undefined });
}

export function applyPostSpiritDamange(api: EventModelApi<Sr2020Character>, data: { amount: number } & LocationMixin) {
  if (data.amount <= 0) {
    sendNotificationAndHistoryRecord(api, 'Выход из духа', 'Вы вышли из духа, все в порядке.');
  } else if (data.amount < api.workModel.maxHp) {
    sendNotificationAndHistoryRecord(api, 'Выход из духа', `При выходе из духа вы потеряли ${data.amount} хитов.`);
  } else {
    sendNotificationAndHistoryRecord(api, 'Выход из духа', `При выходе из духа вы потеряли ${data.amount} хитов, что привело к тяжрану.`);
    healthStateTransition(api, 'wounded', data.location);
  }
}

type InTheSpiritModifier = Modifier &
  Spirit & {
    bodyStorageId: string;
    postSpiritDamage: number;
    stage: number;
    spiritId: string;
  };

function createSpiritModifier(spirit: Spirit & { spiritId: string; bodyStorageId: string }): InTheSpiritModifier {
  return {
    mID: kInSpiritModifierId,
    priority: Modifier.kDefaultPriority,
    enabled: true,
    effects: [
      {
        type: 'functional',
        handler: inTheSpirit.name,
        enabled: true,
      },
    ],
    ...spirit,
    postSpiritDamage: 0,
    stage: 0,
  };
}

function findInSpiritModifier(api: EventModelApi<Sr2020Character>) {
  const m = api.getModifierById(kInSpiritModifierId);
  if (!m) {
    throw new UserVisibleError('Для выхода из духа необходимо быть в нем.');
  }
  return m as InTheSpiritModifier;
}

export function inTheSpirit(api: EffectModelApi<Sr2020Character>, m: InTheSpiritModifier) {
  api.model.currentBody = 'ectoplasm';
  api.model.name = m.name;
  api.model.maxHp = m.hp;
  api.model.activeAbilities = api.model.activeAbilities.filter((ability) => m.abilityIds.includes(ability.id));

  api.model.screens.billing = false;
  api.model.screens.spellbook = false;
  api.model.screens.implants = false;
  api.model.screens.ethics = false;
  api.model.screens.karma = false;
}

export function spiritTimeout(api: EventModelApi<Sr2020Character>, data: {}) {
  sendNotificationAndHistoryRecord(
    api,
    'Превышено максимальное время пребывания в духе',
    'Необходимо срочно вернуться в мясное тело во избежание урона.',
  );

  spiritEmergencyExit(api, data);
}

export function spiritEmergencyExit(api: EventModelApi<Sr2020Character>, data: {}) {
  const m = findInSpiritModifier(api);
  if (m.stage != 0) return; // Emergency exit already triggered
  m.postSpiritDamage += 1;

  const timerDescription = 'Увеличение штрафа за слишком долгое пребывание в духе после разрушения';
  api.setTimer(kSpiritTimerIds[1], timerDescription, duration(10, 'minutes'), spiritReturnTimeoutTick1, {});
  api.setTimer(kSpiritTimerIds[2], timerDescription, duration(30, 'minutes'), spiritReturnTimeoutTick2, {});
}

export function spiritReturnTimeoutTick1(api: EventModelApi<Sr2020Character>, data: {}) {
  findInSpiritModifier(api).postSpiritDamage += 1;
}

export function spiritReturnTimeoutTick2(api: EventModelApi<Sr2020Character>, data: {}) {
  findInSpiritModifier(api).postSpiritDamage += 2;
}

export function hungerWhileInSpirit(api: EventModelApi<Sr2020Character>, data: {}) {
  findInSpiritModifier(api).postSpiritDamage += 10;
}
