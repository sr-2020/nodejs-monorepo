import uuid = require('uuid');
import { Event, Modifier, EventModelApi, EffectModelApi, UserVisibleError } from '@sr2020/interface/models/alice-model-engine';
import { Location } from '@sr2020/interface/models/location.model';
import { Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { reduceManaDensity, recordSpellTrace, shiftSpellTraces, brasiliaEffect } from '../location/events';
import { QrCode } from '@sr2020/interface/models/qr-code.model';
import { create, consume } from '../qr/events';
import { revive } from './death_and_rebirth';
import {
  sendNotificationAndHistoryRecord,
  addHistoryRecord,
  addTemporaryModifier,
  modifierFromEffect,
  validUntil,
  addTemporaryModifierEvent,
  removeModifier,
} from './util';
import { AURA_LENGTH } from './consts';
import Chance = require('chance');
import { getAllActiveAbilities } from './library_registrator';
import { multiplyAllDiscounts, increaseCharisma, increaseAuraMask, increaseResonance, increaseMaxMeatHp } from './basic_effects';
import { duration, Duration } from 'moment';
import { kAllSpells, Spell } from './spells_library';
import { kEmptyContent, kAllReagents } from '../qr/reagents_library';
import { MerchandiseQrData, typedQrData } from '@sr2020/sr2020-models/scripts/qr/datatypes';
import { temporaryAntiDumpshock } from '@sr2020/sr2020-models/scripts/character/hackers';
const chance = new Chance();

const kUnknowAuraCharacter = '*';

interface SpellData {
  id: string; // corresponds to Spell.id and AddedSpell.id
  power: number; // Magic power
  location: {
    // Current location
    id: number;
    manaLevel: number;
  };
  reagentIds: string[]; // Identifiers of reagents/blood QRs
  ritualMembersIds?: string[]; // Identifiers of other ritual participants
  focusId?: string; // Identifier of focus QR
  targetCharacterId?: string; // Identifier of target character
}

interface MagicFeedback {
  feedback: number;
  duration: Duration;
  amount: number;
}

export function castSpell(api: EventModelApi<Sr2020Character>, data: SpellData, event: Event) {
  if (api.workModel.currentBody != 'physical' && api.workModel.currentBody != 'astral') {
    throw new UserVisibleError('Применять заклинания можно только в физическом или астральном теле.');
  }

  if (data.power <= 0) {
    throw new UserVisibleError('Мощь должна быть положительной!');
  }

  const spell = api.workModel.spells.find((s) => s.id == data.id);
  if (!spell) {
    throw new UserVisibleError('Нельзя скастовать спелл, которого у вас нет!');
  }

  const librarySpell = kAllSpells.get(data.id);
  if (!librarySpell) {
    throw new UserVisibleError('Несуществующий спелл!');
  }

  let ritualPowerBonus = 0;
  let ritualFeedbackReduction = 0;
  let totalParticipans = 0;

  if (data.ritualMembersIds?.length) {
    if (!api.workModel.passiveAbilities.some((a) => a.id == 'ritual-magic' || a.id == 'orthodox-ritual-magic')) {
      throw new UserVisibleError('Нет навыков разрешающих проводить ритуалы!');
    }

    const ritualParticipantIds = new Set<string>([...data.ritualMembersIds]);
    for (const participantId of ritualParticipantIds) {
      const participant = api.aquired(Sr2020Character, participantId);
      totalParticipans += participant.passiveAbilities.some((a) => a.id == 'agnus-dei') ? 3 : 1;
    }

    const ritualBonus = Math.floor(Math.sqrt(totalParticipans));
    ritualPowerBonus = ritualBonus;
    if (api.workModel.passiveAbilities.some((a) => a.id == 'orthodox-ritual-magic')) {
      ritualFeedbackReduction = ritualBonus;
    }
  }

  data.power += ritualPowerBonus;
  api.sendSelfEvent(librarySpell.eventType, data);
  // Reagents
  const totalContent = kEmptyContent;
  for (const id of new Set(data.reagentIds)) {
    const reagentReference = api.aquired(QrCode, id);
    if (reagentReference?.type != 'reagent') throw new UserVisibleError('Использование не-реагента в качестве реагента!');

    const reagent = kAllReagents.find((it) => it.id == typedQrData<MerchandiseQrData>(reagentReference).id);
    if (!reagent) throw new UserVisibleError('Такого реагента не существует!');

    for (const element in reagent.content) {
      totalContent[element] += reagent.content[element];
    }
    api.sendOutboundEvent(QrCode, id, consume, {});
  }

  let reagentFeedbackIncrease = 0;
  const powerMultiplier = Math.ceil(data.power / 2);

  if (librarySpell.sphere == 'healing' && totalContent.pisces < 3 * powerMultiplier) reagentFeedbackIncrease += 3;
  if (librarySpell.sphere == 'fighting' && totalContent.sagittarius < 3 * powerMultiplier) reagentFeedbackIncrease += 3;
  if (librarySpell.sphere == 'protection' && totalContent.leo < 3 * powerMultiplier) reagentFeedbackIncrease += 3;
  if (librarySpell.sphere == 'aura' && totalContent.libra < 3 * powerMultiplier) reagentFeedbackIncrease += 3;
  if (librarySpell.sphere == 'astral' && totalContent.aquarius < 3 * powerMultiplier) reagentFeedbackIncrease += 3;
  if (librarySpell.sphere == 'stats' && totalContent.scorpio < 3 * powerMultiplier) reagentFeedbackIncrease += 3;

  if (api.workModel.metarace == 'meta-elf' && totalContent.virgo < 2 * powerMultiplier) reagentFeedbackIncrease += 2;
  if (api.workModel.metarace == 'meta-troll' && totalContent.taurus < 2 * powerMultiplier) reagentFeedbackIncrease += 2;
  if (api.workModel.metarace == 'meta-ork' && totalContent.aries < 2 * powerMultiplier) reagentFeedbackIncrease += 2;
  if (api.workModel.metarace == 'meta-dwarf' && totalContent.cancer < 2 * powerMultiplier) reagentFeedbackIncrease += 2;
  if (api.workModel.metarace == 'meta-norm' && totalContent.gemini < 2 * powerMultiplier) reagentFeedbackIncrease += 2;
  if ((api.workModel.metarace == 'meta-hmhvv1' || api.workModel.metarace == 'meta-hmhvv3') && totalContent.capricorn < 2 * powerMultiplier)
    reagentFeedbackIncrease += 2;

  const canHaveZeroFeedback = totalParticipans >= 300 || totalContent.ophiuchus >= powerMultiplier;

  const feedback = applyAndGetMagicFeedback(
    api,
    data,
    librarySpell,
    reagentFeedbackIncrease - ritualFeedbackReduction,
    canHaveZeroFeedback,
  );
  saveSpellTrace(api, data, spell.humanReadableName, Math.round(feedback.feedback), event);

  addHistoryRecord(
    api,
    'Заклинание',
    spell.humanReadableName,
    `Заклинание ${spell.humanReadableName} успешно скастовано. Откат: снижение магии на ${
      feedback.amount
    } на ${feedback.duration.asMinutes()} минут.`,
  );

  api.sendPubSubNotification('spell_cast', { ...data, characterId: api.model.modelId, name: spell.humanReadableName });
}

function createArtifact(api: EventModelApi<Sr2020Character>, qrCode: string, whatItDoes: string, eventType: string, usesLeft = 1) {
  api.sendOutboundEvent(QrCode, qrCode, create, {
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

export function increaseResonanceSpell(api: EventModelApi<Sr2020Character>, data: { qrCode?: string }, _event: Event) {
  if (data.qrCode != undefined) {
    return createArtifact(api, data.qrCode, 'скастовать спелл-заглушку', increaseResonanceSpell.name, 3);
  }
  api.sendSelfEvent(increaseResonanceByOne, {});
  api.sendNotification('Скастован спелл', 'Ура! Вы скастовали спелл-заглушку');
}

export function densityDrainSpell(api: EventModelApi<Sr2020Character>, data: { location: { id: number }; amount: number }, _: Event) {
  api.sendOutboundEvent(Location, data.location.id.toString(), reduceManaDensity, { amount: data.amount });
}

export function densityHalveSpell(api: EventModelApi<Sr2020Character>, data: { location: { id: number }; qrCode?: string }, _: Event) {
  if (data.qrCode != undefined) {
    return createArtifact(api, data.qrCode, 'поделить плотность маны пополам', densityHalveSpell.name, 3);
  }
  const location = api.aquired(Location, data.location.id.toString());
  api.sendOutboundEvent(Location, data.location.id.toString(), reduceManaDensity, { amount: location.manaDensity / 2 });
}

export function fullHealSpell(api: EventModelApi<Sr2020Character>, data: { qrCode?: string; targetCharacterId?: number }, event: Event) {
  if (data.qrCode != undefined) {
    return createArtifact(api, data.qrCode, 'восстановить все хиты', fullHealSpell.name);
  }

  if (data.targetCharacterId != undefined) {
    api.sendOutboundEvent(Sr2020Character, data.targetCharacterId.toString(), fullHealSpell, {});
    return;
  }

  revive(api, data, event);
}

//
// Healing spells
//
export function lightHealSpell(
  api: EventModelApi<Sr2020Character>,
  data: { targetCharacterId?: number; power: number; location: { id: number; manaLevel: number } },
  event: Event,
) {
  if (data.targetCharacterId != undefined) {
    api.sendNotification('Успех', 'Заклинание совершено');
    api.sendOutboundEvent(Sr2020Character, data.targetCharacterId.toString(), lightHeal, data);
  } else {
    api.sendSelfEvent(lightHeal, data);
  }
}

export function lightHeal(api: EventModelApi<Sr2020Character>, data: { power: number }, event: Event) {
  const hpRestored = data.power;
  sendNotificationAndHistoryRecord(api, 'Лечение', `Восстановлено хитов: ${hpRestored}`);
}

export function groundHealSpell(
  api: EventModelApi<Sr2020Character>,
  data: { power: number; location: { id: number; manaLevel: number } },
  event: Event,
) {
  api.sendNotification('Успех', 'Заклинание успешно применено');
  const d = duration(10 * data.power, 'minutes');
  const m = modifierFromEffect(groundHealEffect, {
    name: 'ground-heal-modifier',
    validUntil: validUntil(api, d),
  });
  addTemporaryModifier(api, m, d);
}

export function groundHealEffect(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  const ability = getAllActiveAbilities().get('ground-heal-ability')!;
  api.model.activeAbilities.push({
    id: ability.id,
    humanReadableName: ability.humanReadableName,
    description: ability.description,
    target: ability.target,
    targetsSignature: ability.targetsSignature,
    cooldownMinutes: ability.cooldownMinutes,
    cooldownUntil: 0,
    validUntil: m.validUntil,
  });
}

export function liveLongAndProsperSpell(api: EventModelApi<Sr2020Character>, data: SpellData, event: Event) {
  api.sendNotification('Успех', 'Заклинание совершено');
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, liveLongAndProsper, data);
}

export function liveLongAndProsper(api: EventModelApi<Sr2020Character>, data: { power: number }, event: Event) {
  const hpIncrease = data.power;
  const d = duration(10 * data.power, 'minutes');
  sendNotificationAndHistoryRecord(api, 'Лечение', `Максимальные и текущие хиты временно увеличены на ${hpIncrease}`);
  const m = modifierFromEffect(increaseMaxMeatHp, { amount: hpIncrease });
  addTemporaryModifier(api, m, d);
}

export function keepYourselfSpell(api: EventModelApi<Sr2020Character>, data: SpellData, event: Event) {
  const hpIncrease = data.power;
  const d = duration(10 * data.power, 'minutes');
  sendNotificationAndHistoryRecord(api, 'Лечение', `Максимальные и текущие хиты увеличены на ${hpIncrease} на ${d.asMinutes()} минут.`);
  const m = modifierFromEffect(increaseMaxMeatHp, { amount: hpIncrease });
  addTemporaryModifier(api, m, d);
}

//
// Offensive spells
//

export function fireballSpell(api: EventModelApi<Sr2020Character>, data: SpellData, event: Event) {
  api.sendNotification('Успех', 'Заклинание успешно применено');
  const d = duration(8 * data.power, 'minutes');
  const amount = Math.max(1, data.power - 3);
  const m = modifierFromEffect(fireballEffect, { amount, validUntil: validUntil(api, d) });
  addTemporaryModifier(api, m, d);
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
  const d = duration(10 * data.power, 'minutes');
  const amount = Math.max(1, data.power - 2);
  sendNotificationAndHistoryRecord(api, 'Заклинание', `Fast Charge: ${amount} молний на ${d.asMinutes()} минут`);
  const m = modifierFromEffect(fastChargeEffect, { amount, validUntil: validUntil(api, d) });
  addTemporaryModifier(api, m, d);
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

export function fieldOfDenialSpell(
  api: EventModelApi<Sr2020Character>,
  data: { power: number; location: { id: number; manaLevel: number } },
  event: Event,
) {
  api.sendNotification('Успех', 'Заклинание успешно применено');
  const d = duration(40, 'minutes');
  const m = modifierFromEffect(fieldOfDenialEffect, { validUntil: validUntil(api, d) });
  addTemporaryModifier(api, m, d);
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
  api.sendNotification('Успех', 'Заклинание успешно применено');
  const durationInSeconds = (10 + data.power) * 60;
  const auraPercentage = (10 + Math.min(40, data.power * 5)) * api.workModel.magicStats.auraReadingMultiplier;
  dumpSpellTraces(api, durationInSeconds, auraPercentage, data.location.id.toString(), event);
}

// время каста 5 минут. После активации заклинания в приложении выводятся текстом данные о заклинаниях, сотворенных в этой локации в
// последние 60 минут - список (название заклинания,  Мощь, Откат, (20+N)% ауры творца, пол и метарасу творца). N=Мощь*10, но не более 60
export function trackBallSpell(api: EventModelApi<Sr2020Character>, data: SpellData, event: Event) {
  api.sendNotification('Успех', 'Заклинание успешно применено');
  const durationInSeconds = 60 * 60;
  const auraPercentage = (20 + Math.min(60, data.power * 10)) * api.workModel.magicStats.auraReadingMultiplier;
  dumpSpellTraces(api, durationInSeconds, auraPercentage, data.location.id.toString(), event);
}

function generateAuraSubset(fullAura: string, percentage: number): string {
  const symbolsRead = Math.min(AURA_LENGTH, Math.floor((AURA_LENGTH * percentage) / 100));
  const positions = Array.from(Array(AURA_LENGTH).keys());
  const picked = chance.pickset(positions, symbolsRead);
  return positions.map((i) => (picked.includes(i) ? fullAura[i] : kUnknowAuraCharacter)).join('');
}

function splitAuraByDashes(aura: string): string {
  return aura.substr(0, 4) + '-' + aura.substr(4, 4) + '-' + aura.substr(8, 4) + '-' + aura.substr(12, 4) + '-' + aura.substr(16, 4);
}

function dumpSpellTraces(
  api: EventModelApi<Sr2020Character>,
  durationInSeconds: number,
  auraPercentage: number,
  locationId: string,
  event: Event,
) {
  const location = api.aquired(Location, locationId);
  const spellTraces = location.spellTraces.filter((trace) => trace.timestamp >= event.timestamp - durationInSeconds * 1000);
  for (const spell of spellTraces) {
    spell.casterAura = splitAuraByDashes(generateAuraSubset(spell.casterAura, auraPercentage));
  }
  api.setTableResponse(spellTraces);
}

// время каста 5 минут. При активации заклинания в текущей локации у всех заклинаний с датой активации позже,
// чем (Текущий момент - T1 минут), дата активации в следе сдвигается в прошлое на T2 минут
// (то есть activation_moment = activation_moment - T2). T1=Мощь*5. T2=Мощь*4.
export function tempusFugitSpell(api: EventModelApi<Sr2020Character>, data: SpellData, event: Event) {
  api.sendNotification('Успех', 'Заклинание успешно применено');
  api.sendOutboundEvent(Location, data.location.id.toString(), shiftSpellTraces, {
    maxLookupSeconds: data.power * 5 * 60,
    shiftTimeSeconds: data.power * 4 * 60,
  });
}

export function brasiliaSpell(api: EventModelApi<Sr2020Character>, data: SpellData, event: Event) {
  api.sendNotification('Успех', 'Заклинание успешно применено');
  api.sendOutboundEvent(Location, data.location.id.toString(), brasiliaEffect, {
    durationMinutes: 8 * data.power,
  });
}

//
// Parameter-adjusting spells
//

export function shtoppingSpell(api: EventModelApi<Sr2020Character>, data: SpellData, event: Event) {
  const d = duration(10 * data.power, 'minutes');
  const amount = 1 + Math.max(0.1, 0.05 * data.power);
  const m = modifierFromEffect(multiplyAllDiscounts, { amount });
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, addTemporaryModifierEvent, {
    modifier: m,
    durationInSeconds: d.asMinutes(),
  });
}

export function taxFreeSpell(api: EventModelApi<Sr2020Character>, data: SpellData, event: Event) {
  const d = duration(10 * data.power, 'minutes');
  const amount = 1 - Math.min(0.9, 0.05 * data.power);
  const m = modifierFromEffect(multiplyAllDiscounts, { amount });
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, addTemporaryModifierEvent, {
    modifier: m,
    durationInSeconds: d.asSeconds(),
  });
}

export function frogSkinSpell(api: EventModelApi<Sr2020Character>, data: SpellData, event: Event) {
  const d = duration(10 * data.power, 'minutes');
  const amount = -Math.max(1, data.power - 1);
  const m = modifierFromEffect(increaseCharisma, { amount });
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, addTemporaryModifierEvent, {
    modifier: m,
    durationInSeconds: d.asSeconds(),
  });
}

export function charmSpell(api: EventModelApi<Sr2020Character>, data: SpellData, event: Event) {
  const d = duration(10 * data.power, 'minutes');
  const amount = Math.max(1, data.power - 2);
  const m = modifierFromEffect(increaseCharisma, { amount });
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, addTemporaryModifierEvent, {
    modifier: m,
    durationInSeconds: d.asSeconds(),
  });
}

export function nothingSpecialSpell(api: EventModelApi<Sr2020Character>, data: SpellData, event: Event) {
  const d = duration(120, 'minutes');
  const amount = 2 * data.power;
  const m = modifierFromEffect(increaseAuraMask, { amount });
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, addTemporaryModifierEvent, {
    modifier: m,
    durationInSeconds: d.asSeconds(),
  });
}

export function odusSpell(api: EventModelApi<Sr2020Character>, data: SpellData, event: Event) {
  const d = duration(10 * data.power, 'minutes');
  const amount = -Math.max(1, data.power - 1);
  const m = modifierFromEffect(increaseResonance, { amount });
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, addTemporaryModifierEvent, {
    modifier: m,
    durationInSeconds: d.asSeconds(),
  });
}

//
// Helper functons
//

export function forgetAllSpells(api: EventModelApi<Sr2020Character>, data: {}, _: Event) {
  api.model.spells = [];
}

function applyAndGetMagicFeedback(
  api: EventModelApi<Sr2020Character>,
  data: { power: number; location: { manaLevel: number } },
  spell: Spell,
  adjustment: number,
  canHaveZeroFeedback: boolean,
): MagicFeedback {
  // TODO(aeremin) Fix use of api.model.magicFeedbackReduction
  const feedback = Math.max(
    0,
    (5 * data.power + adjustment) * (api.workModel.currentBody == 'astral' ? 0.25 : 1) * (data.location.manaLevel < 4 ? 1.5 : 1),
  );

  const feedbackDuration = duration(
    Math.max(1, Math.ceil(Math.pow(2, Math.min(14, feedback)) / api.workModel.magicStats.recoverySpeed)),
    'minutes',
  );
  const feedbackAmount = Math.max(Math.ceil(Math.sqrt(feedback) * api.workModel.magicStats.feedbackReduction), canHaveZeroFeedback ? 0 : 1);

  const m = modifierFromEffect(magicFeedbackEffect, { amount: feedbackAmount });

  api.addModifier(m);
  api.setTimer('feedback-recovery-' + uuid.v4(), feedbackDuration, removeModifier, { mID: m.mID });

  return { amount: feedbackAmount, feedback, duration: feedbackDuration };
}

// Magic feedback implementation
function saveSpellTrace(api: EventModelApi<Sr2020Character>, data: SpellData, spellName: string, feedbackAmount: number, event: Event) {
  api.sendOutboundEvent(Location, data.location.id.toString(), recordSpellTrace, {
    spellName,
    timestamp: event.timestamp,
    casterAura: generateAuraSubset(api.workModel.magicStats.aura, api.workModel.magicStats.auraMarkMultiplier * 100),
    metarace: api.workModel.metarace,
    power: data.power,
    magicFeedback: feedbackAmount,
  });
}

export function magicFeedbackEffect(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.magic -= m.amount;
}

export function readCharacterAuraSpell(api: EventModelApi<Sr2020Character>, data: SpellData, event: Event) {
  const target = api.aquired(Sr2020Character, data.targetCharacterId!);
  const auraPercentage = 90 * api.workModel.magicStats.auraReadingMultiplier;
  sendNotificationAndHistoryRecord(
    api,
    'Результат чтения ауры персонажа',
    splitAuraByDashes(generateAuraSubset(target.magicStats.aura, auraPercentage)),
  );
}

export function readLocationAuraSpell(api: EventModelApi<Sr2020Character>, data: SpellData, event: Event) {
  const target = api.aquired(Location, data.location.id.toString());
  const auraPercentage = 100 * api.workModel.magicStats.auraReadingMultiplier;
  sendNotificationAndHistoryRecord(
    api,
    'Результат чтения ауры локации',
    splitAuraByDashes(generateAuraSubset(target.aura, auraPercentage)),
  );
}

export function dumptyHumptySpell(api: EventModelApi<Sr2020Character>, data: SpellData, _: Event) {
  const durationInMinutes = 10 * data.power;
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, temporaryAntiDumpshock, { durationInMinutes });
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
