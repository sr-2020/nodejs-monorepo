import { EventModelApi, UserVisibleError, Event, Modifier, EffectModelApi } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020Character, AddedActiveAbility, Targetable } from '@sr2020/interface/models/sr2020-character.model';
import { sendNotificationAndHistoryRecord, addHistoryRecord, addTemporaryModifier, modifierFromEffect } from './util';
import { reviveOnTarget, absoluteDeath } from './death_and_rebirth';
import { duration } from 'moment';
import { QrCode } from '@sr2020/interface/models/qr-code.model';
import { create } from '../qr/events';
import { getAllActiveAbilities } from './library_registrator';
import { MerchandiseQrData, typedQrData } from '@sr2020/sr2020-models/scripts/qr/datatypes';
import { addFeatureToModel, addTemporaryPassiveAbility } from '@sr2020/sr2020-models/scripts/character/features';
import { generateRandomAuraMask, kUnknowAuraCharacter } from '@sr2020/sr2020-models/scripts/character/aura_utils';

export const kIWillSurviveModifierId = 'i-will-survive-modifier';

export type ActiveAbilityData = Partial<Targetable> & {
  id: string; // corresponds to ActiveAbility.id and AddedActiveAbility.id
  location: {
    id: number;
    manaLevel: number;
  };
};

export type FullActiveAbilityData = ActiveAbilityData & AddedActiveAbility;

export type FullTargetedAbilityData = FullActiveAbilityData & { targetCharacterId: string };

export function useAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  const ability = api.workModel.activeAbilities.find((s) => s.id == data.id);
  if (!ability) {
    throw new UserVisibleError('Нельзя использовать способность, которой у вас нет!');
  }

  const libraryAbility = getAllActiveAbilities().get(data.id);
  if (!libraryAbility) {
    throw new UserVisibleError('Несуществующая способность!');
  }

  if (ability.cooldownUntil > api.model.timestamp) {
    throw new UserVisibleError('Способность еще на кулдауне!');
  }

  if (100 * libraryAbility.minimalEssence > api.workModel.essence) {
    throw new UserVisibleError('Недостаточно эссенции для применения данной способности!');
  }

  // Second `find` as we must change the value in (base) model, not in workModel.
  // (and the ability to use should be taken from workModel as there are temporary abilities.
  const maybeAbility = api.model.activeAbilities.find((a) => a.id == data.id);
  // This is needed to support the case when the ability is temporary and as such only present in workModel.
  // This will lead to maybeAbility being undefined. But it's fine: such abilities are one-time-use anyway, so no need to
  // set cooldown.
  if (maybeAbility) {
    maybeAbility.cooldownUntil = api.model.timestamp + ability.cooldownMinutes * 60 * 1000 * api.workModel.cooldownCoefficient;
  }

  api.sendSelfEvent(libraryAbility.eventType, { ...ability, ...data });

  addHistoryRecord(api, 'Способность', ability.humanReadableName, `Способность ${ability.humanReadableName} успешно применена`);

  api.sendPubSubNotification('ability_used', { ...data, characterId: api.model.modelId, name: ability.humanReadableName });
}

export function oneTimeRevive(api: EventModelApi<Sr2020Character>, data: FullTargetedAbilityData, _: Event) {
  sendNotificationAndHistoryRecord(
    api,
    'Навык',
    'Применен Ground Heal',
    'Вы применили навык полученный благодаря заклинанию Ground Heal. Заклинание перестало действовать',
  );

  const mods = api.getModifiersByName('ground-heal-modifier');
  if (mods.length) {
    // We remove the first one as it's the "oldest" one.
    api.removeModifier(mods[0].mID);
  }

  reviveOnTarget(api, data);
}

export function dummyAbility(api: EventModelApi<Sr2020Character>, data: void) {
  api.sendNotification('Способность еще не реализована :(', 'Приходите завтра. Или послезавтра?');
}

// Adept abilities

export function hammerOfJustice(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  const manaLevel = data.location.manaLevel;
  const d = duration(10 + 3 * manaLevel, 'minutes');
  addTemporaryPassiveAbility(api, 'hammer-of-justice-effect', d);
}

export function arrowgant(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  const manaLevel = data.location.manaLevel;
  const d = duration(5 + 1 * manaLevel, 'minutes');
  addTemporaryPassiveAbility(api, 'arrowgant-effect', d);
}

export function trollton(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  const manaLevel = data.location.manaLevel;
  const d = duration(5 + 2 * manaLevel, 'minutes');
  addTemporaryPassiveAbility(api, 'trollton-effect', d);
}

export function iWillSurvive(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  const manaLevel = data.location.manaLevel;
  const d = duration(5 + 2 * manaLevel, 'minutes');
  addTemporaryModifier(api, { mID: kIWillSurviveModifierId, enabled: true, effects: [] }, d);
}

export function copyPasteQr(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  const from = api.aquired(QrCode, data.pillId!);
  const to = api.aquired(QrCode, data.qrCode!);
  api.sendOutboundEvent(QrCode, to.modelId, create, from);
}

export function absoluteDeathAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, absoluteDeath, {});
}

export function alloHomorusAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  api.sendNotification('Взлом', 'Вы можете приступить к взлому замка в соответствии с правилами по взлому');
}

export function cloudMemoryAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, cloudMemoryEnable, {});
}

export function cloudMemoryEnable(api: EventModelApi<Sr2020Character>, data: {}) {
  const d = duration(6, 'hours');
  addTemporaryPassiveAbility(api, 'cloud-memory-temporary', d);
  api.sendNotification('Облачная память', 'Получена временная пассивная способность "Облачная память"');
}

// Гешефтмахерские способности

function getMerchandiseData(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData): MerchandiseQrData {
  if (!data.qrCode) throw new UserVisibleError('Нет данных о QR-коде');
  const item = api.aquired(QrCode, data.qrCode);
  return typedQrData<MerchandiseQrData>(item);
}

export function howMuchItCosts(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  sendNotificationAndHistoryRecord(api, 'Цена товара', `Базовая цена этого товара составляет ${getMerchandiseData(api, data).basePrice}`);
}

export function howMuchTheRent(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  sendNotificationAndHistoryRecord(api, 'Рента', `Рентный платеж за этот товара составляет ${getMerchandiseData(api, data).rentPrice}`);
}

export function whoNeedsIt(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  const description = getMerchandiseData(api, data).gmDescription;
  if (description.length > 0) {
    sendNotificationAndHistoryRecord(api, 'Информация', description);
  } else {
    api.sendNotification('Информация', 'Этот товар ничем не примечателен.');
  }
}

export function letMePay(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  transferRentFromTo(api, getMerchandiseData(api, data).dealId, api.model.modelId);
}

export function letHimPay(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  if (!data.targetCharacterId) throw new UserVisibleError('Нет целевого персонажа');
  transferRentFromTo(api, getMerchandiseData(api, data).dealId, data.targetCharacterId);
}

export function reRent(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  transferRentFromTo(api, getMerchandiseData(api, data).dealId, undefined);
}

function transferRentFromTo(api: EventModelApi<Sr2020Character>, dealId: string, toCharacterId?: string) {
  api.sendPubSubNotification('change_rent', {
    dealId,
    toCharacterId,
  });
}

export function investigateScoring(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, temporaryAddMyScoring, {});
}

export function temporaryAddMyScoring(api: EventModelApi<Sr2020Character>, data: {}) {
  api.sendNotification('Скоринг', 'В течение пяти минут на странице экономики отображаются подробности вашего скоринга');
  addTemporaryModifier(api, modifierFromEffect(addMyScoringEffect, {}), duration(5, 'minutes'));
}

export function addMyScoringEffect(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  addFeatureToModel(api.model, 'mу-scoring');
}

/**
 * Silentium est aurum implementation pieces
 */
export function changeAuraAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, changeAuraEvent, {});
}

export function changeAuraEvent(api: EventModelApi<Sr2020Character>, data: {}) {
  addTemporaryModifier(api, modifierFromEffect(changeAuraEffect, { mask: generateRandomAuraMask(20) }), duration(1, 'hour'));
}

export function changeAuraEffect(api: EffectModelApi<Sr2020Character>, m: Modifier & { mask: string }) {
  const mask: string = m.mask;
  const auraChars: string[] = [];
  for (let i = 0; i < mask.length; ++i) {
    if (mask[i] != kUnknowAuraCharacter) {
      auraChars.push(mask[i]);
    } else {
      auraChars.push(api.model.magicStats.aura[i]);
    }
  }

  api.model.magicStats.aura = auraChars.join('');
}
