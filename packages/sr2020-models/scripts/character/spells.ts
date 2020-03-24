import { Event, Modifier, EventModelApi, EffectModelApi, UserVisibleError } from '@sr2020/interface/models/alice-model-engine';
import { Location } from '@sr2020/interface/models/location.model';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { reduceManaDensity, recordSpellTrace, shiftSpellTraces, brasiliaEffect } from '../location/events';
import { QrCode } from '@sr2020/interface/models/qr-code.model';
import { create } from '../qr/events';
import { revive } from './death_and_rebirth';
import {
  sendNotificationAndHistoryRecord,
  addHistoryRecord,
  addTemporaryModifier,
  modifierFromEffect,
  validUntil,
  addTemporaryModifierEvent,
} from './util';
import { MAX_POSSIBLE_HP, AURA_LENGTH } from './consts';
import Chance = require('chance');
import { kAllActiveAbilities } from './active_abilities_library';
import { increaseAllDiscounts, increaseCharisma, increaseAuraMask, increaseResonance } from './basic_effects';
const chance = new Chance();

const kUnknowAuraCharacter = '*';

interface SpellData {
  id: string; // corresponds to Spell.id and AddedSpell.id
  power: number; // Magic power
  locationId: string; // Current location
  reagentIds: string[]; // Identifiers of reagents/blood QRs
  ritualMembersIds?: string[]; // Identifiers of other ritual participants
  focusId?: string; // Identifier of focus QR
  targetCharacterId?: string; // Identifier of target character
}

export function castSpell(api: EventModelApi<Sr2020Character>, data: SpellData, event: Event) {
  const spell = api.workModel.spells.find((s) => s.id == data.id);
  if (!spell) {
    throw new UserVisibleError('Нельзя скастовать спелл, которого у вас нет!');
  }

  let ritualPowerBonus = 0;
  let ritualFeedbackReduction = 0;

  if (data.ritualMembersIds?.length) {
    if (!api.workModel.passiveAbilities.some((a) => a.id == 'ritual-magic' || a.id == 'orthodox-ritual-magic')) {
      throw new UserVisibleError('Нет навыков разрешающих проводить ритуалы!');
    }

    const ritualParticipantIds = new Set<string>([...data.ritualMembersIds]);
    let totalParticipans = 0;
    for (const participantId of ritualParticipantIds) {
      const participant = api.aquired('Character', participantId) as Sr2020Character;
      totalParticipans += participant.passiveAbilities.some((a) => a.id == 'agnus-dei') ? 3 : 1;
    }

    const ritualBonus = Math.floor(Math.sqrt(totalParticipans));
    ritualPowerBonus = ritualBonus;
    if (api.workModel.passiveAbilities.some((a) => 'orthodox-ritual-magic')) {
      ritualFeedbackReduction = ritualBonus;
    }
  }

  data.power += ritualPowerBonus;
  api.sendSelfEvent(spell.eventType, data);

  const feedback = applyAndGetMagicFeedback(api, data.power, ritualFeedbackReduction);
  saveSpellTrace(api, data, spell.humanReadableName, feedback, event);
}

function createArtifact(api: EventModelApi<Sr2020Character>, qrCode: number, whatItDoes: string, eventType: string, usesLeft = 1) {
  api.sendOutboundEvent(QrCode, qrCode.toString(), create, {
    type: 'artifact',
    description: `Этот артефакт позволяет ${whatItDoes} даже не будучи магом!`,
    eventType,
    usesLeft,
  });
  api.sendNotification('Успех', 'Артефакт зачарован!');
}

export function increaseResonanceByOne(api: EventModelApi<Sr2020Character>, _data: {}, _event: Event) {
  api.model.resonance++;
}

export function increaseResonanceSpell(api: EventModelApi<Sr2020Character>, data: { qrCode?: number }, _event: Event) {
  if (data.qrCode != undefined) {
    return createArtifact(api, data.qrCode, 'скастовать спелл-заглушку', increaseResonanceSpell.name, 3);
  }
  api.sendSelfEvent(increaseResonanceByOne, {});
  api.sendNotification('Скастован спелл', 'Ура! Вы скастовали спелл-заглушку');
}

export function densityDrainSpell(api: EventModelApi<Sr2020Character>, data: { locationId: string; amount: number }, _: Event) {
  api.sendOutboundEvent(Location, data.locationId, reduceManaDensity, { amount: data.amount });
}

export function densityHalveSpell(api: EventModelApi<Sr2020Character>, data: { locationId: string; qrCode?: number }, _: Event) {
  if (data.qrCode != undefined) {
    return createArtifact(api, data.qrCode, 'поделить плотность маны пополам', densityHalveSpell.name, 3);
  }
  const location = api.aquired('Location', data.locationId) as Location;
  api.sendOutboundEvent(Location, data.locationId, reduceManaDensity, { amount: location.manaDensity / 2 });
}

export function fullHealSpell(api: EventModelApi<Sr2020Character>, data: { qrCode?: number; targetCharacterId?: number }, event: Event) {
  if (data.qrCode != undefined) {
    addHistoryRecord(api, 'Заклинание', 'Лечение: на артефакт');
    return createArtifact(api, data.qrCode, 'восстановить все хиты', fullHealSpell.name);
  }

  if (data.targetCharacterId != undefined) {
    addHistoryRecord(api, 'Заклинание', 'Лечение: на цель');
    api.sendOutboundEvent(Sr2020Character, data.targetCharacterId.toString(), fullHealSpell, {});
    return;
  }

  addHistoryRecord(api, 'Заклинание', 'Лечение: на себя');
  revive(api, data, event);
}

//
// Healing spells
//
export function lightHealSpell(
  api: EventModelApi<Sr2020Character>,
  data: { targetCharacterId?: number; power: number; locationId: string },
  event: Event,
) {
  if (data.targetCharacterId != undefined) {
    addHistoryRecord(api, 'Заклинание', 'Light Heal: на цель');
    api.sendNotification('Успех', 'Заклинание совершено');
    api.sendOutboundEvent(Sr2020Character, data.targetCharacterId.toString(), lightHeal, data);
  } else {
    addHistoryRecord(api, 'Заклинание', 'Light Heal: на себя');
    api.sendSelfEvent(lightHeal, data);
  }
}

export function lightHeal(api: EventModelApi<Sr2020Character>, data: { power: number }, event: Event) {
  const hpRestored = data.power;
  sendNotificationAndHistoryRecord(api, 'Лечение', `Восстановлено хитов: ${hpRestored}`);
}

export function groundHealSpell(api: EventModelApi<Sr2020Character>, data: { power: number; locationId: string }, event: Event) {
  sendNotificationAndHistoryRecord(api, 'Заклинание', 'Ground Heal: на себя');
  const durationInSeconds = 10 * data.power * 60;
  const m = modifierFromEffect(groundHealEffect, {
    name: 'ground-heal-modifier',
    validUntil: validUntil(api, durationInSeconds),
  });
  addTemporaryModifier(api, m, durationInSeconds);
}

export function groundHealEffect(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  const ability = kAllActiveAbilities.get('ground-heal-ability')!;
  api.model.activeAbilities.push({
    ...ability,
    validUntil: m.validUntil,
  });
}

export function liveLongAndProsperSpell(api: EventModelApi<Sr2020Character>, data: SpellData, event: Event) {
  addHistoryRecord(api, 'Заклинание', 'Live Long and Prosper: на цель');
  api.sendNotification('Успех', 'Заклинание совершено');
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, liveLongAndProsper, data);
}

export function liveLongAndProsper(api: EventModelApi<Sr2020Character>, data: { power: number }, event: Event) {
  const hpIncrease = data.power;
  const durationInSeconds = 10 * data.power * 60;
  sendNotificationAndHistoryRecord(api, 'Лечение', `Максимальные и текущие хиты временно увеличены на ${hpIncrease}`);
  const m = modifierFromEffect(maxHpIncreaseEffect, { amount: hpIncrease });
  addTemporaryModifier(api, m, durationInSeconds);
}

export function maxHpIncreaseEffect(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.maxHp += m.amount;
  api.model.maxHp = Math.min(api.model.maxHp, MAX_POSSIBLE_HP);
}

export function keepYourselfSpell(api: EventModelApi<Sr2020Character>, data: SpellData, event: Event) {
  const hpIncrease = data.power;
  const durationInMinutes = 10 * data.power;
  const durationInSeconds = 60 * durationInMinutes;
  sendNotificationAndHistoryRecord(api, 'Лечение', `Максимальные и текущие хиты увеличены на ${hpIncrease} на ${durationInMinutes} минут.`);
  const m = modifierFromEffect(maxHpIncreaseEffect, { amount: hpIncrease });
  addTemporaryModifier(api, m, durationInSeconds);
}

//
// Offensive spells
//

export function fireballSpell(api: EventModelApi<Sr2020Character>, data: SpellData, event: Event) {
  sendNotificationAndHistoryRecord(api, 'Заклинание', 'Fireball: на себя');
  const durationInSeconds = 8 * data.power * 60;
  const amount = Math.max(1, data.power - 3);
  const m = modifierFromEffect(fireballEffect, { amount, validUntil: validUntil(api, durationInSeconds) });
  addTemporaryModifier(api, m, durationInSeconds);
}

export function fireballEffect(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.passiveAbilities.push({
    id: 'fireball-able',
    name: 'Fireball',
    description: `Можете кинуть ${m.amount} огненных шаров.`,
    validUntil: m.validUntil,
  });
}

// время каста 2 минуты, у мага на время T появляется пассивная способность “кинуть N молний”.
// Снаряд выглядит как мягкий шар с длинным (не менее 2м) хвостом, и его попадание обрабатывается согласно правилам по боевке
// (тяжелое магическое оружие). N=Мощь-2 (но не меньше 1), T=Мощь*10 минут
export function fastChargeSpell(api: EventModelApi<Sr2020Character>, data: SpellData, event: Event) {
  const durationInMinutes = 10 * data.power;
  const durationInSeconds = 60 * durationInMinutes;
  const amount = Math.max(1, data.power - 2);
  sendNotificationAndHistoryRecord(api, 'Заклинание', `Fast Charge: ${amount} молний на ${durationInMinutes} минут`);
  const m = modifierFromEffect(fastChargeEffect, { amount, validUntil: validUntil(api, durationInSeconds) });
  addTemporaryModifier(api, m, durationInSeconds);
}

export function fastChargeEffect(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.passiveAbilities.push({
    id: 'fast-charge-able',
    name: 'Fast Charge',
    description: `Можете кинуть ${m.amount} молний.`,
    validUntil: m.validUntil,
  });
}

//
// Defensive spells
//

export function fieldOfDenialSpell(api: EventModelApi<Sr2020Character>, data: { power: number; locationId: string }, event: Event) {
  sendNotificationAndHistoryRecord(api, 'Заклинание', 'Field of denial: на себя');
  const durationInSeconds = 40 * 60;
  const m = modifierFromEffect(fieldOfDenialEffect, { validUntil: validUntil(api, durationInSeconds) });
  addTemporaryModifier(api, m, durationInSeconds);
}

export function fieldOfDenialEffect(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.passiveAbilities.push({
    id: 'field-of-denial-able',
    name: 'Field of denial',
    description: `Попадание в зонтик тяжелым оружием игнорируется.`,
    validUntil: m.validUntil,
  });
}

//
// Investigation spells
//

// время каста 2 минуты. После активации заклинания в приложении выводятся текстом данные о заклинаниях, сотворенных в этой локации в
// последние 10+Мощь минут - список (название заклинания,  Мощь, Откат, (10+N)% ауры творца, пол и метарасу творца).
// N=Мощь*5, но не более 40
export function trackpointSpell(api: EventModelApi<Sr2020Character>, data: SpellData, event: Event) {
  sendNotificationAndHistoryRecord(api, 'Заклинание', 'Trackpoint: на себя');
  const durationInSeconds = (10 + data.power) * 60;
  const symbolsRead = Math.min(
    AURA_LENGTH,
    Math.floor((AURA_LENGTH * (10 + Math.min(40, data.power * 5)) * api.workModel.magicStats.auraReadingMultiplier) / 100),
  );
  dumpSpellTraces(api, durationInSeconds, symbolsRead, data.locationId, event);
}

// время каста 5 минут. После активации заклинания в приложении выводятся текстом данные о заклинаниях, сотворенных в этой локации в
// последние 60 минут - список (название заклинания,  Мощь, Откат, (20+N)% ауры творца, пол и метарасу творца). N=Мощь*10, но не более 60
export function trackBallSpell(api: EventModelApi<Sr2020Character>, data: SpellData, event: Event) {
  sendNotificationAndHistoryRecord(api, 'Заклинание', 'Trackball: на себя');
  const durationInSeconds = 60 * 60;
  const symbolsRead = Math.min(
    AURA_LENGTH,
    Math.floor((AURA_LENGTH * (20 + Math.min(60, data.power * 10)) * api.workModel.magicStats.auraReadingMultiplier) / 100),
  );
  dumpSpellTraces(api, durationInSeconds, symbolsRead, data.locationId, event);
}

function dumpSpellTraces(
  api: EventModelApi<Sr2020Character>,
  durationInSeconds: number,
  symbolsRead: number,
  locationId: string,
  event: Event,
) {
  const location = api.aquired('Location', locationId) as Location;
  const spellTraces = location.spellTraces.filter((trace) => trace.timestamp >= event.timestamp - durationInSeconds * 1000);
  const positions = Array.from(Array(AURA_LENGTH).keys());
  for (const spell of spellTraces) {
    const picked = chance.pickset(positions, symbolsRead);
    const chars: string[] = [];
    for (let i = 0; i < AURA_LENGTH; ++i) {
      if (i > 0 && i % 4 == 0) chars.push('-');
      chars.push(picked.includes(i) ? spell.casterAura[i] : kUnknowAuraCharacter);
    }
    spell.casterAura = chars.join('');
  }
  api.setTableResponse(spellTraces);
}

// время каста 5 минут. При активации заклинания в текущей локации у всех заклинаний с датой активации позже,
// чем (Текущий момент - T1 минут), дата активации в следе сдвигается в прошлое на T2 минут
// (то есть activation_moment = activation_moment - T2). T1=Мощь*5. T2=Мощь*4.
export function tempusFugitSpell(api: EventModelApi<Sr2020Character>, data: SpellData, event: Event) {
  sendNotificationAndHistoryRecord(api, 'Заклинание', 'Tempus Fugit');
  api.sendOutboundEvent(Location, data.locationId, shiftSpellTraces, {
    maxLookupSeconds: data.power * 5 * 60,
    shiftTimeSeconds: data.power * 4 * 60,
  });
}

export function brasiliaSpell(api: EventModelApi<Sr2020Character>, data: SpellData, event: Event) {
  sendNotificationAndHistoryRecord(api, 'Заклинание', 'Brasilia');
  api.sendOutboundEvent(Location, data.locationId, brasiliaEffect, {
    durationMinutes: 8 * data.power,
  });
}

//
// Parameter-adjusting spells
//

export function shtoppingSpell(api: EventModelApi<Sr2020Character>, data: SpellData, event: Event) {
  const durationInSeconds = 10 * data.power * 60;
  const amount = -Math.max(10, 10 * data.power);
  const m = modifierFromEffect(increaseAllDiscounts, { amount });
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, addTemporaryModifierEvent, {
    modifier: m,
    durationInSeconds,
  });
}

export function taxFreeSpell(api: EventModelApi<Sr2020Character>, data: SpellData, event: Event) {
  const durationInSeconds = 10 * data.power * 60;
  const amount = Math.min(90, 10 * data.power);
  const m = modifierFromEffect(increaseAllDiscounts, { amount });
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, addTemporaryModifierEvent, {
    modifier: m,
    durationInSeconds,
  });
}

export function frogSkinSpell(api: EventModelApi<Sr2020Character>, data: SpellData, event: Event) {
  const durationInSeconds = 10 * data.power * 60;
  const amount = -Math.max(1, data.power - 1);
  const m = modifierFromEffect(increaseCharisma, { amount });
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, addTemporaryModifierEvent, {
    modifier: m,
    durationInSeconds,
  });
}

export function charmSpell(api: EventModelApi<Sr2020Character>, data: SpellData, event: Event) {
  const durationInSeconds = 10 * data.power * 60;
  const amount = Math.max(1, data.power - 2);
  const m = modifierFromEffect(increaseCharisma, { amount });
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, addTemporaryModifierEvent, {
    modifier: m,
    durationInSeconds,
  });
}

export function nothingSpecialSpell(api: EventModelApi<Sr2020Character>, data: SpellData, event: Event) {
  const durationInSeconds = 120 * 60;
  const amount = 2 * data.power;
  const m = modifierFromEffect(increaseAuraMask, { amount });
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, addTemporaryModifierEvent, {
    modifier: m,
    durationInSeconds,
  });
}

export function odusSpell(api: EventModelApi<Sr2020Character>, data: SpellData, event: Event) {
  const durationInSeconds = 10 * data.power * 60;
  const amount = -Math.max(1, data.power - 1);
  const m = modifierFromEffect(increaseResonance, { amount });
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, addTemporaryModifierEvent, {
    modifier: m,
    durationInSeconds,
  });
}

//
// Helper functons
//

export function forgetAllSpells(api: EventModelApi<Sr2020Character>, data: {}, _: Event) {
  api.model.spells = [];
}

function applyAndGetMagicFeedback(api: EventModelApi<Sr2020Character>, power: number, reduction: number) {
  // TODO(https://trello.com/c/9nnYn7DH/115-предоставить-исправленную-формулу-вычисления-восстановления-отката):
  // * Use proper formulas
  // * Use reduction
  // * Use api.model.magicFeedbackReduction
  const feedbackTimeSeconds = Math.floor((power + 1) / 2) * 60;
  const feedbackAmount = Math.floor((power + 1) / 2);

  const m = modifierFromEffect(magicFeedbackEffect, { amount: feedbackAmount });
  addTemporaryModifier(api, m, feedbackTimeSeconds);

  return feedbackAmount;
}

// Magic feedback implementation
function saveSpellTrace(api: EventModelApi<Sr2020Character>, data: SpellData, spellName: string, feedbackAmount: number, event: Event) {
  const positions = Array.from(Array(AURA_LENGTH).keys());
  const picked = chance.pickset(positions, api.workModel.magicStats.auraMarkMultiplier * AURA_LENGTH);
  const casterAura = positions.map((i) => (picked.includes(i) ? api.workModel.magicStats.aura[i] : kUnknowAuraCharacter)).join('');

  api.sendOutboundEvent(Location, data.locationId, recordSpellTrace, {
    spellName,
    timestamp: event.timestamp,
    casterAura,
    gender: api.workModel.gender,
    metarace: api.workModel.metarace,
    power: data.power,
    magicFeedback: feedbackAmount,
  });
}

export function magicFeedbackEffect(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.magic -= m.amount;
}

export function dummySpell(api: EventModelApi<Sr2020Character>, data: never, _event: Event) {
  api.sendNotification('Спелл еще не реализован :(', 'Приходите завтра. Или послезавтра?');
}

export function spiritsRelatedSpell(api: EventModelApi<Sr2020Character>, data: never, _event: Event) {
  // TODO(https://trello.com/c/XHT0b9Oj/155-реализовать-заклинания-работающие-с-духами)
  api.sendNotification('Спелл еще не реализован :(', 'Спелл связан с духами которых пока что нет.');
}

export function dummyAreaSpell(api: EventModelApi<Sr2020Character>, data: never, _event: Event) {
  // TODO(https://trello.com/c/hIHZn9De/154-реализовать-заклинания-бьющие-по-всем-в-текущей-локации)
  api.sendNotification('Спелл еще не реализован :(', 'Площадные заклинания не реализованы.');
}

export function dummyManaControlSpell(api: EventModelApi<Sr2020Character>, data: never, _event: Event) {
  // TODO(https://trello.com/c/j2mrFQSU/156-реализовать-заклинания-работающие-с-плотностью-маны)
  api.sendNotification('Спелл еще не реализован :(', 'Заклинания влияющие на уровень маны не реализованы.');
}
