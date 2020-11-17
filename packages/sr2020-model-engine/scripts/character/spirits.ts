import { EffectModelApi, EventModelApi, Modifier, UserVisibleError } from '@sr2020/interface/models/alice-model-engine';
import { LocationMixin, Sr2020Character } from '@sr2020/sr2020-common/models/sr2020-character.model';
import { ActiveAbilityData } from '@sr2020/sr2020-model-engine/scripts/character/active_abilities';
import { BodyStorageQrData, SpiritQrData, typedQrData } from '@sr2020/sr2020-model-engine/scripts/qr/datatypes';
import { QrCode } from '@sr2020/sr2020-common/models/qr-code.model';
import { duration } from 'moment';
import { putBodyToStorage, removeBodyFromStorage } from '@sr2020/sr2020-model-engine/scripts/qr/body_storage';
import { removeFeatureFromModel } from '@sr2020/sr2020-model-engine/scripts/character/features';
import { sendNotificationAndHistoryRecord } from '@sr2020/sr2020-model-engine/scripts/character/util';
import { healthStateTransition } from '@sr2020/sr2020-model-engine/scripts/character/death_and_rebirth';
import { kSpiritAbilityIds } from '@sr2020/sr2020-model-engine/scripts/qr/spirits_library';
import { startUsingDroneOrSpirit, stopUsingDroneOrSpirit } from '@sr2020/sr2020-model-engine/scripts/qr/drones';

const kSpiritTimerIds = ['spirit-timer-stage-0', 'spirit-timer-stage-1', 'spirit-timer-stage-2'];
const kInSpiritModifierId = 'in-the-spirit';

export function enterSpirit(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  if (api.workModel.currentBody != 'physical') {
    throw new UserVisibleError('Для входа в духа необходимо быть в мясном теле.');
  }

  const spirit = typedQrData<SpiritQrData>(api.aquired(QrCode, data.droneId!));

  if (spirit.inUse) {
    throw new UserVisibleError('Этот дух в настоящий момент уже используется.');
  }

  const timeInSpirit = duration(15, 'minutes');
  api.setTimer(kSpiritTimerIds[0], 'Выход из духа', timeInSpirit, spiritTimeout, {});

  api.sendOutboundEvent(QrCode, data.bodyStorageId!, putBodyToStorage, {
    characterId: api.model.modelId,
    bodyType: api.workModel.currentBody,
  });

  api.sendOutboundEvent(QrCode, data.droneId!, startUsingDroneOrSpirit, {});

  //api.model.activeAbilities = api.model.activeAbilities.concat(drone.activeAbilities);
  //for (const passiveAbility of spirit.passiveAbilities) {
  //  addFeatureToModel(api.model, passiveAbility.id);
  //}

  api.addModifier(createSpiritModifier(spirit, data.droneId!));
}

export function exitSpirit(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  if (api.workModel.currentBody != 'ectoplasm') {
    throw new UserVisibleError('Для выхода из духа необходимо быть подключенным к нему.');
  }

  const storage = typedQrData<BodyStorageQrData>(api.aquired(QrCode, data.bodyStorageId!));
  if (!(storage?.body?.characterId == api.model.modelId)) {
    throw new UserVisibleError('Данная ячейка телохранилище не содержит ваше тело.');
  }
  api.sendOutboundEvent(QrCode, data.bodyStorageId!, removeBodyFromStorage, {});

  for (const timerId of kSpiritTimerIds) api.removeTimer(timerId);

  const m = findInSpiritModifier(api);
  api.sendOutboundEvent(QrCode, m.spiritQrId, stopUsingDroneOrSpirit, {
    activeAbilities: api.workModel.activeAbilities.filter((ability) => kSpiritAbilityIds.has(ability.id)),
  });

  for (const abilityId of kSpiritAbilityIds) {
    removeFeatureFromModel(api.model, abilityId);
  }

  // Not calling directly as we need to remove modifier and recalculate max HP first.
  api.sendSelfEvent(applyPostSpiritDamange, { amount: m.postSpiritDamage, location: data.location });
  api.removeModifier(m.mID);
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

type InTheSpiritModifier = Modifier & { hp: number; spiritQrId: string; postSpiritDamage: number; stage: number };

function createSpiritModifier(spirit: SpiritQrData, spiritQrId: string): InTheSpiritModifier {
  return {
    mID: kInSpiritModifierId,
    enabled: true,
    effects: [
      {
        type: 'functional',
        handler: inTheSpirit.name,
        enabled: true,
      },
    ],
    hp: 2,
    spiritQrId,
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
  api.model.maxHp = m.hp;
  api.model.activeAbilities = api.model.activeAbilities.filter((ability) => kSpiritAbilityIds.has(ability.id));
  //  What to do with the passive ones?

  api.model.screens.billing = false;
  api.model.screens.spellbook = false;
  api.model.screens.implants = false;
  api.model.screens.ethics = false;
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
