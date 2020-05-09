import { EventModelApi, UserVisibleError, Event, Modifier, EffectModelApi } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020Character, AddedActiveAbility, Targetable } from '@sr2020/interface/models/sr2020-character.model';
import { sendNotificationAndHistoryRecord, addHistoryRecord, addTemporaryModifier, modifierFromEffect, validUntil } from './util';
import { reviveOnTarget, absoluteDeath } from './death_and_rebirth';
import { duration } from 'moment';
import { QrCode } from '@sr2020/interface/models/qr-code.model';
import { create } from '../qr/events';
import { getAllActiveAbilities } from './library_registrator';
import { MerchandiseQrData, typedQrData } from '@sr2020/sr2020-models/scripts/qr/datatypes';

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

export function useAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData, event: Event) {
  const ability = api.workModel.activeAbilities.find((s) => s.id == data.id);
  if (!ability) {
    throw new UserVisibleError('Нельзя использовать способность, которой у вас нет!');
  }

  const libraryAbility = getAllActiveAbilities().get(data.id);
  if (!libraryAbility) {
    throw new UserVisibleError('Несуществующая способность!');
  }

  if (ability.cooldownUntil > event.timestamp) {
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
    maybeAbility.cooldownUntil = event.timestamp + ability.cooldownMinutes * 60 * 1000 * api.workModel.cooldownCoefficient;
  }

  api.sendSelfEvent(libraryAbility.eventType, { ...ability, ...data });

  addHistoryRecord(api, 'Способность', ability.humanReadableName, `Способность ${ability.humanReadableName} успешно применена`);

  api.sendPubSubNotification('ability_used', { ...data, characterId: api.model.modelId, name: ability.humanReadableName });
}

export function oneTimeRevive(api: EventModelApi<Sr2020Character>, data: FullTargetedAbilityData, event: Event) {
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

  reviveOnTarget(api, data, event);
}

export function dummyAbility(api: EventModelApi<Sr2020Character>, data: void, event: Event) {
  api.sendNotification('Способность еще не реализована :(', 'Приходите завтра. Или послезавтра?');
}

// Adept abilities

export function hammerOfJustice(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData, _: Event) {
  const manaLevel = data.location.manaLevel;
  const d = duration(10 + 3 * manaLevel, 'minutes');
  const m = modifierFromEffect(hammerOfJusticeEffect, { validUntil: validUntil(api, d) });
  addTemporaryModifier(api, m, d);
}

export function hammerOfJusticeEffect(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.passiveAbilities.push({
    id: 'hammer-of-justice-effect',
    name: 'Hammer of Justice',
    description: 'Одноручное оружие считается тяжёлым.',
    validUntil: m.validUntil,
  });
}

export function arrowgant(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData, _: Event) {
  const manaLevel = data.location.manaLevel;
  const d = duration(5 + 1 * manaLevel, 'minutes');
  const m = modifierFromEffect(arrowgantEffect, { validUntil: validUntil(api, d) });
  addTemporaryModifier(api, m, d);
}

export function arrowgantEffect(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.passiveAbilities.push({
    id: 'arrowgant-effect',
    name: 'Arrowgant',
    description: 'Защита от дистанционных атак (только от нерфов).',
    validUntil: m.validUntil,
  });
}

export function trollton(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData, _: Event) {
  const manaLevel = data.location.manaLevel;
  const d = duration(5 + 2 * manaLevel, 'minutes');
  const m = modifierFromEffect(trolltonEffect, { validUntil: validUntil(api, d) });
  addTemporaryModifier(api, m, d);
}

export function trolltonEffect(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.passiveAbilities.push({
    id: 'trollton-effect',
    name: 'Trollton',
    description: 'У вас тяжелая броня.',
    validUntil: m.validUntil,
  });
}

export function iWillSurvive(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData, _: Event) {
  const manaLevel = data.location.manaLevel;
  const d = duration(5 + 2 * manaLevel, 'minutes');
  addTemporaryModifier(api, { mID: kIWillSurviveModifierId, enabled: true, effects: [] }, d);
}

export function copyPasteQr(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData, _: Event) {
  const from = api.aquired(QrCode, data.pillId!);
  const to = api.aquired(QrCode, data.qrCode!);
  api.sendOutboundEvent(QrCode, to.modelId, create, from);
}

export function absoluteDeathAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData, _: Event) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, absoluteDeath, {});
}

export function alloHomorusAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData, _: Event) {
  api.sendNotification('Взлом', 'Вы можете приступить к взлому замка в соответствии с правилами по взлому');
}

export function cloudMemoryAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData, _: Event) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, cloudMemoryEnable, {});
}

export function cloudMemoryEnable(api: EventModelApi<Sr2020Character>, data: {}, _: Event) {
  const d = duration(6, 'hours');
  const m = modifierFromEffect(cloudMemoryEffect, { validUntil: validUntil(api, d) });
  api.sendNotification('Облачная память', 'Получена временная пассивная способность "Облачная память"');
  addTemporaryModifier(api, m, d);
}

export function cloudMemoryEffect(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.passiveAbilities.push({
    id: 'cloud-memory-temporary',
    name: 'Облачная память',
    description: 'Вы не забываете события произошедшие с вами непосредственно перед КС',
    validUntil: m.validUntil,
  });
}

// Гешефтмахерские способности

export function howMuchItCosts(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData, _: Event) {
  const item = api.aquired(QrCode, data.qrCode!);
  sendNotificationAndHistoryRecord(
    api,
    'Цена товара',
    `Базовая цена этого товара составляет ${typedQrData<MerchandiseQrData>(item).basePrice}`,
  );
}

export function howMuchTheRent(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData, _: Event) {
  const item = api.aquired(QrCode, data.qrCode!);
  sendNotificationAndHistoryRecord(
    api,
    'Рента',
    `Рентный платеж за этот товара составляет ${typedQrData<MerchandiseQrData>(item).rentPrice}`,
  );
}

export function whoNeedsIt(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData, _: Event) {
  const item = api.aquired(QrCode, data.qrCode!);
  const description = typedQrData<MerchandiseQrData>(item).gmDescription;
  if (description.length > 0) {
    sendNotificationAndHistoryRecord(api, 'Информация', description);
  } else {
    api.sendNotification('Информация', 'Этот товар ничем не примечателен.');
  }
}
