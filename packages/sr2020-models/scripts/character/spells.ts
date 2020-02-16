import { Event, Modifier, EventModelApi, EffectModelApi } from '@sr2020/interface/models/alice-model-engine';
import { Location } from '@sr2020/interface/models/location.model';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { reduceManaDensity, recordSpellTrace } from '../location/events';
import { QrCode } from '@sr2020/interface/models/qr-code.model';
import { create } from '../qr/events';
import { revive } from './death_and_rebirth';
import { sendNotificationAndHistoryRecord, addHistoryRecord, addTemporaryModifier, modifierFromEffect } from './util';
import { AllActiveAbilities } from './abilities';
import { MAX_POSSIBLE_HP, AURA_LENGTH } from './consts';
import Chance = require('chance');
const chance = new Chance();

const kUnknowAuraCharacter = '?';

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
  if (data.locationId == undefined) data.locationId = '0';
  if (data.targetCharacterId != undefined) {
    addHistoryRecord(api, 'Заклинание', 'Light Heal: на цель');
    api.sendNotification('Успех', 'Заклинание совершено');
    api.sendOutboundEvent(Sr2020Character, data.targetCharacterId.toString(), lightHeal, data);
  } else {
    addHistoryRecord(api, 'Заклинание', 'Light Heal: на себя');
    api.sendSelfEvent(lightHeal, data);
  }
  magicFeedbackAndSpellTrace(api, 'Light heal', data.power, data.locationId, event);
}

export function lightHeal(api: EventModelApi<Sr2020Character>, data: { power: number }, event: Event) {
  const hpRestored = data.power;
  sendNotificationAndHistoryRecord(api, 'Лечение', `Восстановлено хитов: ${hpRestored}`);
}

export const GROUND_HEAL_MODIFIER_NAME = 'ground-heal-modifier';

export function groundHealSpell(api: EventModelApi<Sr2020Character>, data: { power: number; locationId: string }, event: Event) {
  if (data.locationId == undefined) data.locationId = '0';
  sendNotificationAndHistoryRecord(api, 'Заклинание', 'Ground Heal: на себя');
  const durationInSeconds = 10 * data.power * 60;
  const m = modifierFromEffect(groundHealEffect, { name: GROUND_HEAL_MODIFIER_NAME });
  addTemporaryModifier(api, m, durationInSeconds);
  magicFeedbackAndSpellTrace(api, 'Ground heal', data.power, data.locationId, event);
}

export function groundHealEffect(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.activeAbilities.push(AllActiveAbilities.find((a) => (a.humanReadableName = 'Ground Heal'))!);
}

export function liveLongAndProsperSpell(
  api: EventModelApi<Sr2020Character>,
  data: { targetCharacterId?: number; power: number; locationId: string },
  event: Event,
) {
  if (data.locationId == undefined) data.locationId = '0';
  if (data.targetCharacterId != undefined) {
    addHistoryRecord(api, 'Заклинание', 'Live Long and Prosper: на цель');
    api.sendNotification('Успех', 'Заклинание совершено');
    api.sendOutboundEvent(Sr2020Character, data.targetCharacterId.toString(), liveLongAndProsper, data);
  } else {
    addHistoryRecord(api, 'Заклинание', 'Live Long and Prosper: на себя');
    api.sendSelfEvent(liveLongAndProsper, data);
  }
  magicFeedbackAndSpellTrace(api, 'Live long and prosper', data.power, data.locationId, event);
}

export function liveLongAndProsper(api: EventModelApi<Sr2020Character>, data: { power: number }, event: Event) {
  const hpIncrease = Math.round(Math.sqrt(data.power));
  const durationInSeconds = Math.round(Math.sqrt(data.power)) * 60;
  sendNotificationAndHistoryRecord(api, 'Лечение', `Максимальные и текущие хиты временно увеличены на ${hpIncrease}`);
  const m = modifierFromEffect(maxHpIncreaseEffect, { amount: hpIncrease });
  addTemporaryModifier(api, m, durationInSeconds);
}

export function maxHpIncreaseEffect(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.maxHp += m.amount;
  api.model.maxHp = Math.min(api.model.maxHp, MAX_POSSIBLE_HP);
}

//
// Offensive spells
//

export function fireballSpell(api: EventModelApi<Sr2020Character>, data: { power: number; locationId: string }, event: Event) {
  if (data.locationId == undefined) data.locationId = '0';
  sendNotificationAndHistoryRecord(api, 'Заклинание', 'Fireball: на себя');
  const durationInSeconds = (data.power * 60) / 2;
  const amount = Math.floor(data.power / 2);
  const m = modifierFromEffect(fireballEffect, { amount, durationInSeconds });
  addTemporaryModifier(api, m, durationInSeconds);
  magicFeedbackAndSpellTrace(api, 'Fireball', data.power, data.locationId, event);
}

export function fireballEffect(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.passiveAbilities.push({
    id: 'fireball-able',
    name: 'Fireball',
    description: `Можете кинуть ${m.amount} огненных шаров в течение ${m.durationInSeconds / 60} минут.`,
  });
}

//
// Defensive spells
//

export function fieldOfDenialSpell(api: EventModelApi<Sr2020Character>, data: { power: number; locationId: string }, event: Event) {
  if (data.locationId == undefined) data.locationId = '0';
  sendNotificationAndHistoryRecord(api, 'Заклинание', 'Field of denial: на себя');
  const durationInSeconds = 40 * 60;
  const m = modifierFromEffect(fieldOfDenialEffect);
  addTemporaryModifier(api, m, durationInSeconds);
  magicFeedbackAndSpellTrace(api, 'Field of denial', data.power, data.locationId, event);
}

export function fieldOfDenialEffect(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.passiveAbilities.push({
    id: 'field-of-denial-able',
    name: 'Field of denial',
    description: `Попадание в зонтик тяжелым оружием игнорируется.`,
  });
}

//
// Investigation spells
//

export function trackpointSpell(api: EventModelApi<Sr2020Character>, data: { power: number; locationId: string }, event: Event) {
  if (data.locationId == undefined) data.locationId = '0';
  sendNotificationAndHistoryRecord(api, 'Заклинание', 'Trackpoint: на себя');
  const durationInSeconds = (10 + data.power) * 60;
  const symbolsRead = Math.floor((AURA_LENGTH * (10 + Math.min(40, data.power * 5)) * api.workModel.auraReadingMultiplier) / 100);
  const location = api.aquired('Location', data.locationId) as Location;
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
  magicFeedbackAndSpellTrace(api, 'Trackpoint', data.power, data.locationId, event);
}

export function forgetAllSpells(api: EventModelApi<Sr2020Character>, data: {}, _: Event) {
  api.model.spells = [];
}

// Magic feedback implementation
function magicFeedbackAndSpellTrace(
  api: EventModelApi<Sr2020Character>,
  spellName: string,
  power: number,
  locationId: string,
  event: Event,
) {
  const feedbackTimeSeconds = Math.floor((power + 1) / 2) * 60;
  const feedbackAmount = Math.floor((power + 1) / 2);

  const m = modifierFromEffect(magicFeedbackEffect, { amount: feedbackAmount });
  addTemporaryModifier(api, m, feedbackTimeSeconds);

  const positions = Array.from(Array(AURA_LENGTH).keys());
  const picked = chance.pickset(positions, api.workModel.auraMarkMultiplier * AURA_LENGTH);
  const casterAura = positions.map((i) => (picked.includes(i) ? api.workModel.magicAura[i] : kUnknowAuraCharacter)).join('');

  api.sendOutboundEvent(Location, locationId, recordSpellTrace, {
    spellName,
    timestamp: event.timestamp,
    casterAura,
    power,
    magicFeedback: feedbackAmount,
  });
}

export function magicFeedbackEffect(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.magic -= m.amount;
}
