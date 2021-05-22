import { EffectModelApi, Event, EventModelApi, Modifier, UserVisibleError } from '@alice/alice-common/models/alice-model-engine';
import { Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { addHistoryRecord, addTemporaryModifier, modifierFromEffect, sendNotificationAndHistoryRecord } from './util';
import { absoluteDeath, clinicalDeath, reviveOnTarget } from './death_and_rebirth';
import { duration } from 'moment';
import { QrCode } from '@alice/sr2020-common/models/qr-code.model';
import { getAllActiveAbilities } from './library_registrator';
import { MerchandiseQrData, SpriteQrData, typedQrData } from '@alice/sr2020-model-engine/scripts/qr/datatypes';
import { addFeatureToModel, addTemporaryPassiveAbility } from '@alice/sr2020-model-engine/scripts/character/features';
import { generateRandomAuraMask, kUnknowAuraCharacter } from '@alice/sr2020-model-engine/scripts/character/aura_utils';
import { earnKarma, kKarmaActiveAbilityCoefficient } from '@alice/sr2020-model-engine/scripts/character/karma';
import { removeImplant } from '@alice/sr2020-model-engine/scripts/character/merchandise';
import { createMerchandise } from '@alice/sr2020-model-engine/scripts/qr/merchandise';
import { consume } from '@alice/sr2020-model-engine/scripts/qr/events';
import * as Chance from 'chance';
import { kActiveAbilitiesDisabledTimer, kIWillSurviveModifierId } from '@alice/sr2020-model-engine/scripts/character/consts';
import { ActiveAbilityData, FullTargetedAbilityData } from '@alice/sr2020-common/models/common_definitions';
import { dumpshock } from '@alice/sr2020-model-engine/scripts/character/hackers';

const chance = new Chance();

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

  if (api.getTimer(kActiveAbilitiesDisabledTimer)) {
    throw new UserVisibleError('Сейчас вы не можете пользоваться активными способностями!');
  }

  if (data.id != 'ghoul-feast' && data.id != 'vampire-feast') {
    const minEssenceToUse = Math.max(
      libraryAbility.minimalEssence,
      api.workModel.metarace == 'meta-vampire' || api.workModel.metarace == 'meta-ghoul' ? 1 : 0,
    );
    if (100 * minEssenceToUse > api.workModel.essence) {
      throw new UserVisibleError('Недостаточно эссенции для применения данной способности!');
    }
  }

  // Second `find` as we must change the value in (base) model, not in workModel.
  // (and the ability to use should be taken from workModel as there are temporary abilities.
  const maybeAbility = api.model.activeAbilities.find((a) => a.id == data.id);
  // This is needed to support the case when the ability is temporary and as such only present in workModel.
  // This will lead to maybeAbility being undefined. But it's fine: such abilities are one-time-use anyway, so no need to
  // set cooldown.
  if (maybeAbility) {
    maybeAbility.cooldownUntil = Math.floor(api.model.timestamp + ability.cooldownMinutes * 60 * 1000);
  } else {
    const mods = api.getModifiersByName(`add-active-ability-${ability.id}`);
    if (mods.length) {
      // We remove the first one as it's the "oldest" one.
      api.removeModifier(mods[0].mID);
    }
  }

  api.model.hacking.fading += libraryAbility.fadingPrice;
  if (api.model.hacking.fading > 100 * api.workModel.resonance) {
    dumpshock(api, {});
    return;
  } else if (api.model.hacking.fading == 100 * api.workModel.resonance) {
    dumpshock(api, {});
  }

  api.sendSelfEvent(libraryAbility.eventType, { ...ability, ...data });

  earnKarma(api, { amount: kKarmaActiveAbilityCoefficient * libraryAbility.karmaCost, notify: false });

  addHistoryRecord(api, 'Способность', ability.humanReadableName, `Способность ${ability.humanReadableName} успешно применена`);

  api.sendPubSubNotification('ability_used', {
    ...data,
    ...injectedTargetsData(api, data),
    characterId: api.model.modelId,
    name: ability.humanReadableName,
  });
}

function removeInternalFields(entity: Sr2020Character | QrCode) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { timestamp, modifiers, timers, ...rest } = entity;
  return rest;
}

function getQrTarget(api: EventModelApi<Sr2020Character>, id: string | undefined) {
  if (!id) return undefined;
  return removeInternalFields(api.aquired(QrCode, id));
}

function getCharacterTarget(api: EventModelApi<Sr2020Character>, id: string | undefined) {
  if (!id) return undefined;
  return removeInternalFields(api.aquired(Sr2020Character, id));
}

function injectedTargetsData(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  return {
    targetCharacter: getCharacterTarget(api, data.targetCharacterId),
    qrCode: getQrTarget(api, data.qrCodeId),
    pill: getQrTarget(api, data.pillId),
    locus: getQrTarget(api, data.locusId),
    drone: getQrTarget(api, data.droneId),
    bodyStorage: getQrTarget(api, data.bodyStorageId),
  };
}

export function oneTimeRevive(api: EventModelApi<Sr2020Character>, data: FullTargetedAbilityData, _: Event) {
  sendNotificationAndHistoryRecord(
    api,
    'Навык',
    'Применен Ground Heal',
    'Вы применили навык полученный благодаря заклинанию Ground Heal. Заклинание перестало действовать',
  );

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
  addTemporaryModifier(
    api,
    { mID: kIWillSurviveModifierId, enabled: true, effects: [], priority: Modifier.kDefaultPriority },
    d,
    'Действие способности I will survive',
  );
}

export function absoluteDeathAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, absoluteDeath, data);
}

export function finishHimAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  const target = api.aquired(Sr2020Character, data.targetCharacterId!);
  if (target.healthState != 'wounded') throw new UserVisibleError('Жертва не находится в тяжране.');
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!.toString(), clinicalDeath, { location: data.location });
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
  if (!data.qrCodeId) throw new UserVisibleError('Нет данных о QR-коде');
  const item = api.aquired(QrCode, data.qrCodeId);
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
  addTemporaryModifier(api, modifierFromEffect(addMyScoringEffect, {}), duration(5, 'minutes'), 'Изменение скоринга');
}

export function addMyScoringEffect(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  addFeatureToModel(api.model, 'my-scoring');
}

/**
 * Silentium est aurum implementation pieces
 */
export function changeAuraAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, changeAuraEvent, {});
}

export function changeAuraEvent(api: EventModelApi<Sr2020Character>, data: {}) {
  addTemporaryModifier(
    api,
    modifierFromEffect(changeAuraEffect, { mask: generateRandomAuraMask(20) }),
    duration(1, 'hour'),
    'Изменение ауры',
  );
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

export function takeNoHarmAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  addTemporaryPassiveAbility(api, 'magic-shield', duration(5, 'minutes'));
}

export function pencilLargeAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  addTemporaryPassiveAbility(api, 'pencil', duration(5, 'minutes'));
}

export function skinStoneAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  addTemporaryPassiveAbility(api, 'stone-skin-result', duration(5, 'minutes'));
}

export function tincasmAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  addTemporaryPassiveAbility(api, 'tincasm-able', duration(10, 'minutes'));
}

enum ImplantToExtract {
  kSimplest,
  kMostComplex,
}

export function repomanAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  repomanGeneric(api, data, ImplantToExtract.kSimplest);
}

export function repomanBlackAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  repomanGeneric(api, data, ImplantToExtract.kMostComplex);
}

export function repomanGeneric(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData, chooseStrategy: ImplantToExtract) {
  const maxDifficulty = api.workModel.rigging.repomanBonus + api.workModel.intelligence;
  const victim = api.aquired(Sr2020Character, data.targetCharacterId!);
  if (chance.natural({ min: 1, max: 100 }) <= victim.implantsRemovalResistance) {
    api.sendNotification('Неудача', 'Организм жертвы сопротивляется вырезанию импланта.');
    return;
  }

  const potentialImplants = victim.implants.filter((implant) => implant.installDifficulty <= maxDifficulty);
  if (potentialImplants.length == 0) {
    api.sendNotification('Неудача', 'Импланты жертвы слишком сложны, вы не можете их вырезать.');
    return;
  }
  const implant = potentialImplants.sort((i1, i2) => {
    const diff = i1.installDifficulty - i2.installDifficulty;
    return chooseStrategy == ImplantToExtract.kSimplest ? diff : -diff;
  })[0];

  api.sendNotification('Имплант вырезан', `Имплант ${implant.name} вырезан успешно.`);
  api.sendOutboundEvent(Sr2020Character, victim.modelId, removeImplant, {
    id: implant.id,
    installer: api.model.modelId,
    abilityId: data.id,
  });
  api.sendOutboundEvent(QrCode, data.qrCodeId!, createMerchandise, {
    id: implant.id,
    name: implant.name,
    description: implant.description,
    basePrice: implant.basePrice,
    rentPrice: implant.rentPrice,
    gmDescription: implant.gmDescription,
    dealId: implant.dealId,
    lifestyle: implant.lifestyle,
    additionalData: {},
  });
}

export function biomonitorScanAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  const target = api.aquired(Sr2020Character, data.targetCharacterId!);

  const latestLogs = target.chemoConsumptionRecords.filter(
    (record) => record.timestamp >= api.model.timestamp - duration(4, 'hours').asMilliseconds(),
  );
  api.setTableResponse(latestLogs.map((record) => ({ timestamp: record.timestamp, spellName: record.chemoName })));
}

export function activateSoft(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  api.sendOutboundEvent(QrCode, data.qrCodeId!, consume, { noClear: false });
}

export function useSpriteAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  const sprite = typedQrData<SpriteQrData>(api.aquired(QrCode, data.qrCodeId!));
  const canUse = api.workModel.passiveAbilities.some((ability) => `$sprite-{ability.id}` == sprite.id);
  if (!canUse) {
    throw new UserVisibleError('Вы не умеете работать со спрайтами этого типа!');
  }
  api.sendNotification('Успех', `Вы успешно скомпилировали спрайт.`);
  api.sendOutboundEvent(QrCode, data.qrCodeId!, consume, {});
}

// For cases when no IT action is needed
export function noItActionAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  const ability = api.workModel.activeAbilities.find((s) => s.id == data.id);
  api.sendNotification('Успех', `Способность ${ability.humanReadableName} успешно применена)`);
}

// Ability implemented by some other service via pubsub listening
export function externalAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {}

export function marauderAbility(api: EventModelApi<Sr2020Character>, data: ActiveAbilityData) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, clinicalDeath, data);
}
