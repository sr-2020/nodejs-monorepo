import * as uuid from 'uuid';
import { cloneDeep, template } from 'lodash';
import { EffectModelApi, EventModelApi, UserVisibleError } from '@alice/alice-common/models/alice-model-engine';
import { Location } from '@alice/sr2020-common/models/location.model';
import { LocationMixin, Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { brasiliaEffect, recordSpellTrace, shiftSpellTraces } from '../location/events';
import { QrCode } from '@alice/sr2020-common/models/qr-code.model';
import { consume, create } from '../qr/events';
import { healthStateTransition } from './death_and_rebirth';
import {
  addHistoryRecord,
  addTemporaryModifier,
  addTemporaryModifierEvent,
  modifierFromEffect,
  removeModifier,
  sendNotificationAndHistoryRecord,
  validUntil,
} from './util';
import { increaseAuraMask, increaseCharisma, increaseMaxMeatHp, increaseResonance, multiplyAllDiscounts } from './basic_effects';
import { duration } from 'moment';
import { kAllReagents, kEmptyContent } from '../qr/reagents_library';
import { MerchandiseQrData, typedQrData } from '@alice/sr2020-model-engine/scripts/qr/datatypes';
import { temporaryAntiDumpshock } from '@alice/sr2020-model-engine/scripts/character/hackers';
import { generateAuraSubset, splitAuraByDashes } from '@alice/sr2020-model-engine/scripts/character/aura_utils';
import { ModifierWithAmount, TemporaryModifierWithAmount } from '@alice/sr2020-model-engine/scripts/character/typedefs';
import { addTemporaryActiveAbility, addTemporaryPassiveAbility } from '@alice/sr2020-model-engine/scripts/character/features';
import { earnKarma, kKarmaSpellCoefficient } from '@alice/sr2020-model-engine/scripts/character/karma';
import { getAllPassiveAbilities, getAllSpells } from '@alice/sr2020-model-engine/scripts/character/library_registrator';
import { markAsUsed } from '@alice/sr2020-model-engine/scripts/qr/focus';

type SpellData = LocationMixin & {
  id: string; // corresponds to Spell.id and AddedSpell.id
  power: number; // Magic power
  reagentIds: string[]; // Identifiers of reagents/blood QRs
  ritualMembersIds?: string[]; // Identifiers of other ritual participants
  ritualVictimIds?: string[]; // Blood ritual victims
  focusId?: string; // Identifier of focus QR
  targetCharacterId?: string; // Identifier of target character
};

interface MagicFeedback {
  feedback: number;
  duration: number;
  amount: number;
}

interface RitualStats {
  participants: number;
  victims: number;
  notes: string;
}

export function castSpell(api: EventModelApi<Sr2020Character>, data: SpellData) {
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

  const librarySpell = getAllSpells().get(data.id);
  if (!librarySpell) {
    throw new UserVisibleError('Несуществующий спелл!');
  }

  if (data.focusId) {
    api.sendOutboundEvent(QrCode, data.focusId, markAsUsed, {});
  }

  const ritualStats = getRitualStatsAndAffectVictims(api, data);
  addTemporaryBonusesDueToRitual(api, ritualStats);
  data.power += Math.ceil(Math.sqrt(ritualStats.participants));

  api.sendSelfEvent(librarySpell.eventType, data);
  // Reagents
  const totalContent = cloneDeep(kEmptyContent);
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

  const sphereToReagent = {
    healing: totalContent.pisces,
    fighting: totalContent.sagittarius,
    protection: totalContent.leo,
    aura: totalContent.libra,
    astral: totalContent.aquarius,
    stats: totalContent.scorpio,
  };

  const metaraceToReagent = {
    'meta-elf': totalContent.virgo,
    'meta-troll': totalContent.taurus,
    'meta-ork': totalContent.aries,
    'meta-dwarf': totalContent.cancer,
    'meta-norm': totalContent.gemini,
    'meta-vampire': totalContent.capricorn,
    'meta-ghoul': totalContent.capricorn,
  };

  const feedback = calculateMagicFeedback({
    power: data.power,
    sphereReagents: sphereToReagent[librarySpell.sphere],
    metaTypeReagents: metaraceToReagent[api.workModel.metarace],
    inAstral: api.workModel.currentBody == 'astral',
    ritualParticipants: ritualStats.participants,
    bloodRitualParticipants: ritualStats.victims,
    manaLevel: data.location.manaLevel,
    ophiuchusUsed: totalContent.ophiuchus > 0,
    feedbackAmountMultiplier: api.workModel.magicStats.feedbackMultiplier,
    feedbackDurationMultiplier: 1.0 / api.workModel.magicStats.recoverySpeedMultiplier,
  });

  applyMagicFeedback(api, feedback);
  saveSpellTrace(api, data, spell.humanReadableName, Math.round(feedback.feedback));

  addHistoryRecord(
    api,
    'Заклинание',
    spell.humanReadableName,
    `Заклинание ${spell.humanReadableName} успешно скастовано. Откат: снижение магии на ${feedback.amount} на ${feedback.duration} минут. ` +
      ritualStats.notes,
  );

  earnKarma(api, { amount: kKarmaSpellCoefficient * librarySpell.karmaCost, notify: false });

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

export function increaseResonanceByOne(api: EventModelApi<Sr2020Character>, _data: {}) {
  api.model.resonance++;
}

export function increaseResonanceSpell(api: EventModelApi<Sr2020Character>, data: { qrCode?: string }) {
  if (data.qrCode != undefined) {
    return createArtifact(api, data.qrCode, 'скастовать спелл-заглушку', increaseResonanceSpell.name, 3);
  }
  api.sendSelfEvent(increaseResonanceByOne, {});
  api.sendNotification('Скастован спелл', 'Ура! Вы скастовали спелл-заглушку');
}

//
// Healing spells
//
export function groundHealSpell(api: EventModelApi<Sr2020Character>, data: { power: number; location: { id: number; manaLevel: number } }) {
  api.sendNotification('Успех', 'Заклинание успешно применено');
  const d = duration(10 * data.power, 'minutes');
  addTemporaryActiveAbility(api, 'ground-heal-ability', d);
}

export function liveLongAndProsperSpell(api: EventModelApi<Sr2020Character>, data: SpellData) {
  api.sendNotification('Успех', 'Заклинание совершено');
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, liveLongAndProsper, data);
}

export function liveLongAndProsper(api: EventModelApi<Sr2020Character>, data: { power: number }) {
  const hpIncrease = data.power;
  const d = duration(10 * data.power, 'minutes');
  sendNotificationAndHistoryRecord(api, 'Лечение', `Максимальные и текущие хиты временно увеличены на ${hpIncrease}`);
  const m = modifierFromEffect(increaseMaxMeatHp, { amount: hpIncrease });
  addTemporaryModifier(api, m, d, 'Увеличение хитов');
}

export function keepYourselfSpell(api: EventModelApi<Sr2020Character>, data: SpellData) {
  const hpIncrease = data.power;
  const d = duration(10 * data.power, 'minutes');
  sendNotificationAndHistoryRecord(api, 'Лечение', `Максимальные и текущие хиты увеличены на ${hpIncrease} на ${d.asMinutes()} минут.`);
  const m = modifierFromEffect(increaseMaxMeatHp, { amount: hpIncrease });
  addTemporaryModifier(api, m, d, 'Увеличение хитов');
}

//
// Offensive spells
//

export function fireballSpell(api: EventModelApi<Sr2020Character>, data: SpellData) {
  api.sendNotification('Успех', 'Заклинание успешно применено');
  const d = duration(8 * data.power, 'minutes');
  const amount = Math.max(1, data.power - 3);
  addTemporaryPassiveAbility(api, 'fireball-able', d, { amount }, 'Возможность использовать огненные шары');
}

// время каста 2 минуты, у мага на время T появляется пассивная способность “кинуть N молний”.
// Снаряд выглядит как мягкий шар с длинным (не менее 2м) хвостом, и его попадание обрабатывается согласно правилам по боевке
// (тяжелое магическое оружие). N=Мощь-2 (но не меньше 1), T=Мощь*10 минут
export function fastChargeSpell(api: EventModelApi<Sr2020Character>, data: SpellData) {
  const d = duration(10 * data.power, 'minutes');
  const amount = Math.max(1, data.power - 2);
  sendNotificationAndHistoryRecord(api, 'Заклинание', `Fast Charge: ${amount} молний на ${d.asMinutes()} минут`);
  addTemporaryPassiveAbility(api, 'fast-charge-able', d, { amount }, 'Возможность использовать молнии');
}

//
// Defensive spells
//

//
// Investigation spells
//

// время каста 2 минуты. После активации заклинания в приложении выводятся текстом данные о заклинаниях, сотворенных в этой локации в
// последние 10+Мощь минут - список (название заклинания,  Мощь, Откат, (10+N)% ауры творца, пол и метарасу творца).
// N=Мощь*5, но не более 40
export function trackpointSpell(api: EventModelApi<Sr2020Character>, data: SpellData) {
  api.sendNotification('Успех', 'Заклинание успешно применено');
  const durationInSeconds = (10 + data.power) * 60;
  const auraPercentage = (10 + Math.min(40, data.power * 5)) * api.workModel.magicStats.auraReadingMultiplier;
  dumpSpellTraces(api, durationInSeconds, auraPercentage, data.location.id.toString());
}

// время каста 5 минут. После активации заклинания в приложении выводятся текстом данные о заклинаниях, сотворенных в этой локации в
// последние 60 минут - список (название заклинания,  Мощь, Откат, (20+N)% ауры творца, пол и метарасу творца). N=Мощь*10, но не более 60
export function trackBallSpell(api: EventModelApi<Sr2020Character>, data: SpellData) {
  api.sendNotification('Успех', 'Заклинание успешно применено');
  const durationInSeconds = 60 * 60;
  const auraPercentage = (20 + Math.min(60, data.power * 10)) * api.workModel.magicStats.auraReadingMultiplier;
  dumpSpellTraces(api, durationInSeconds, auraPercentage, data.location.id.toString());
}

function dumpSpellTraces(api: EventModelApi<Sr2020Character>, durationInSeconds: number, auraPercentage: number, locationId: string) {
  const location = api.aquired(Location, locationId);
  const spellTraces = location.spellTraces.filter((trace) => trace.timestamp >= api.model.timestamp - durationInSeconds * 1000);
  for (const spell of spellTraces) {
    spell.casterAura = splitAuraByDashes(generateAuraSubset(spell.casterAura, auraPercentage));
  }
  api.setTableResponse(spellTraces);
}

// время каста 5 минут. При активации заклинания в текущей локации у всех заклинаний с датой активации позже,
// чем (Текущий момент - T1 минут), дата активации в следе сдвигается в прошлое на T2 минут
// (то есть activation_moment = activation_moment - T2). T1=Мощь*5. T2=Мощь*4.
export function tempusFugitSpell(api: EventModelApi<Sr2020Character>, data: SpellData) {
  api.sendNotification('Успех', 'Заклинание успешно применено');
  api.sendOutboundEvent(Location, data.location.id.toString(), shiftSpellTraces, {
    maxLookupSeconds: data.power * 5 * 60,
    shiftTimeSeconds: data.power * 4 * 60,
  });
}

export function brasiliaSpell(api: EventModelApi<Sr2020Character>, data: SpellData) {
  api.sendNotification('Успех', 'Заклинание успешно применено');
  api.sendOutboundEvent(Location, data.location.id.toString(), brasiliaEffect, {
    durationMinutes: 8 * data.power,
  });
}

//
// Parameter-adjusting spells
//

export function shtoppingSpell(api: EventModelApi<Sr2020Character>, data: SpellData) {
  const d = duration(10 * data.power, 'minutes');
  const amount = 1 + Math.max(0.1, 0.05 * data.power);
  const m = modifierFromEffect(multiplyAllDiscounts, { amount });
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, addTemporaryModifierEvent, {
    modifier: m,
    durationInSeconds: d.asMinutes(),
    effectDescription: 'Увеличение цен всех товаров',
  });
}

export function taxFreeSpell(api: EventModelApi<Sr2020Character>, data: SpellData) {
  const d = duration(10 * data.power, 'minutes');
  const amount = 1 - Math.min(0.9, 0.05 * data.power);
  const m = modifierFromEffect(multiplyAllDiscounts, { amount });
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, addTemporaryModifierEvent, {
    modifier: m,
    durationInSeconds: d.asSeconds(),
    effectDescription: 'Уменьшение цен всех товаров',
  });
}

export function frogSkinSpell(api: EventModelApi<Sr2020Character>, data: SpellData) {
  const d = duration(10 * data.power, 'minutes');
  const amount = -Math.max(1, data.power - 1);
  const m = modifierFromEffect(increaseCharisma, { amount });
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, addTemporaryModifierEvent, {
    modifier: m,
    durationInSeconds: d.asSeconds(),
    effectDescription: 'Уменьшение харизмы',
  });
}

export function charmSpell(api: EventModelApi<Sr2020Character>, data: SpellData) {
  const d = duration(10 * data.power, 'minutes');
  const amount = Math.max(1, data.power - 2);
  const m = modifierFromEffect(increaseCharisma, { amount });
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, addTemporaryModifierEvent, {
    modifier: m,
    durationInSeconds: d.asSeconds(),
    effectDescription: 'Увеличение харизмы',
  });
}

export function nothingSpecialSpell(api: EventModelApi<Sr2020Character>, data: SpellData) {
  const d = duration(120, 'minutes');
  const amount = 2 * data.power;
  const m = modifierFromEffect(increaseAuraMask, { amount });
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, addTemporaryModifierEvent, {
    modifier: m,
    durationInSeconds: d.asSeconds(),
    effectDescription: 'Увеличение маски ауры',
  });
}

export function odusSpell(api: EventModelApi<Sr2020Character>, data: SpellData) {
  const d = duration(10 * data.power, 'minutes');
  const amount = -Math.max(1, data.power - 1);
  const m = modifierFromEffect(increaseResonance, { amount });
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, addTemporaryModifierEvent, {
    modifier: m,
    durationInSeconds: d.asSeconds(),
    effectDescription: 'Уменьшение резонанса',
  });
}

//
// Helper functons
//

export function forgetAllSpells(api: EventModelApi<Sr2020Character>, data: {}) {
  api.model.spells = [];
}

function applyMagicFeedback(api: EventModelApi<Sr2020Character>, feedback: MagicFeedback) {
  const m = modifierFromEffect(magicFeedbackEffect, { amount: feedback.amount });
  api.addModifier(m);
  api.setTimer(
    'feedback-recovery-' + uuid.v4(),
    `Окончание магического отката на ${feedback.amount}`,
    duration(feedback.duration, 'minutes'),
    removeModifier,
    {
      mID: m.mID,
    },
  );
}

// Everything that can affect feedback
interface FeedbackInputs {
  power: number;
  sphereReagents: number;
  metaTypeReagents: number;
  ritualParticipants: number;
  bloodRitualParticipants: number;
  manaLevel: number;
  inAstral: boolean;
  feedbackAmountMultiplier: number;
  feedbackDurationMultiplier: number;
  ophiuchusUsed: boolean;
}

export function calculateMagicFeedback(inputs: FeedbackInputs): MagicFeedback {
  let feedback = Math.log(10 * inputs.power);
  if (inputs.sphereReagents < Math.max(3, 1.5 * inputs.power)) feedback *= 1.5;
  if (inputs.metaTypeReagents < Math.max(2, inputs.power)) feedback *= 1.5;
  if (inputs.ritualParticipants > 0) feedback /= 2 + inputs.ritualParticipants;
  if (inputs.bloodRitualParticipants > 0) feedback /= 6 + inputs.bloodRitualParticipants;
  feedback *= inputs.feedbackAmountMultiplier;
  if (inputs.manaLevel >= 4) feedback *= 1.2;
  if (inputs.inAstral) feedback /= 5;
  feedback = Math.round(feedback * 100) / 100;

  let amount = feedback * 1.8;
  if (!inputs.ophiuchusUsed) amount += 1;
  amount /= 4;
  amount = Math.round(amount);

  let feedbackDuration = feedback * 10;
  feedbackDuration *= inputs.feedbackDurationMultiplier;
  feedbackDuration += 1;
  feedbackDuration = Math.round(feedbackDuration);

  return { amount, feedback, duration: feedbackDuration };
}

export function getRitualStatsAndAffectVictims(api: EventModelApi<Sr2020Character>, data: SpellData): RitualStats {
  let participants = 0;

  if (data.ritualMembersIds?.length) {
    if (!api.workModel.passiveAbilities.some((a) => a.id == 'ritual-magic' || a.id == 'orthodox-ritual-magic')) {
      throw new UserVisibleError('Нет навыков разрешающих проводить ритуалы!');
    }

    const ritualParticipantIds = new Set<string>([...data.ritualMembersIds]);
    for (const participantId of ritualParticipantIds) {
      const participant = api.aquired(Sr2020Character, participantId);
      if (participant.healthState != 'wounded' && participant.healthState != 'healthy') {
        throw new UserVisibleError('Участники ритуала должны быть живы!');
      }

      participants += participant.passiveAbilities.some((a) => a.id == 'agnus-dei') ? 3 : 1;
    }
  }

  let victims = 0;
  let victimWithInsufficientEssence = 0;
  if (data.ritualVictimIds?.length) {
    if (!api.workModel.passiveAbilities.some((a) => a.id == 'bathory-charger')) {
      throw new UserVisibleError('Нет навыков разрешающих проводить кровавые ритуалы!');
    }

    const ritualVictimIds = new Set<string>([...data.ritualVictimIds]);
    for (const victimId of ritualVictimIds) {
      const victim = api.aquired(Sr2020Character, victimId);
      if (victim.healthState != 'wounded') {
        throw new UserVisibleError('Все жертвы ритуала должны быть в тяжране!');
      }

      if (victim.essence < 100) {
        ++victimWithInsufficientEssence;
        continue;
      }

      ++victims;
      api.sendOutboundEvent(Sr2020Character, victimId, affectRitualVictim, data);
    }
  }
  // жертв, у которых не хватает эссенса для использования в ритуале: N
  const notes =
    victimWithInsufficientEssence > 0
      ? `Жертв, у которых не хватает эссенса для использования в ритуале: ${victimWithInsufficientEssence}`
      : '';
  return {
    participants,
    victims,
    notes,
  };
}

export function affectRitualVictim(api: EventModelApi<Sr2020Character>, data: LocationMixin) {
  healthStateTransition(api, 'clinically_dead', data.location);
  api.model.essenceDetails.gap += Math.min(100, api.workModel.essence);
}

export function addTemporaryBonusesDueToRitual(api: EventModelApi<Sr2020Character>, ritualStats: RitualStats) {
  if (ritualStats.victims == 0) return;

  const d = duration(5 * ritualStats.victims, 'minutes');
  addTemporaryModifier(
    api,
    modifierFromEffect(bloodRitualEffect, { validUntil: validUntil(api, d), amount: ritualStats.victims }),
    d,
    'Бонус от кровавого ритуала',
  );
}

export function bloodRitualEffect(api: EffectModelApi<Sr2020Character>, m: TemporaryModifierWithAmount) {
  const powerBonus = Math.floor(Math.sqrt(m.amount));

  const magicInTheBloodAbility = getAllPassiveAbilities().get('magic-in-the-blood')!;
  api.model.passiveAbilities.push({
    id: magicInTheBloodAbility.id,
    humanReadableName: magicInTheBloodAbility.humanReadableName,
    description: template(magicInTheBloodAbility.description)({ amount: powerBonus }),
    validUntil: m.validUntil,
  });
  api.model.magicStats.maxPowerBonus += powerBonus;

  const feedbackDivider = 1.0 / (6 + m.amount);
  const bloodyTideAbility = getAllPassiveAbilities().get('bloody-tide')!;
  api.model.passiveAbilities.push({
    id: bloodyTideAbility.id,
    humanReadableName: bloodyTideAbility.humanReadableName,
    description: bloodyTideAbility.description,
    validUntil: m.validUntil,
  });
  api.model.magicStats.feedbackMultiplier *= feedbackDivider;
}

// Magic feedback implementation
function saveSpellTrace(api: EventModelApi<Sr2020Character>, data: SpellData, spellName: string, feedbackAmount: number) {
  api.sendOutboundEvent(Location, data.location.id.toString(), recordSpellTrace, {
    spellName,
    timestamp: api.model.timestamp,
    casterAura: generateAuraSubset(api.workModel.magicStats.aura, api.workModel.magicStats.auraMarkMultiplier * 100),
    metarace: api.workModel.metarace,
    power: data.power,
    magicFeedback: feedbackAmount,
  });
}

export function magicFeedbackEffect(api: EffectModelApi<Sr2020Character>, m: ModifierWithAmount) {
  api.model.magic -= m.amount;
}

export function readCharacterAuraSpell(api: EventModelApi<Sr2020Character>, data: SpellData) {
  const target = api.aquired(Sr2020Character, data.targetCharacterId!);
  const auraPercentage = 90 * api.workModel.magicStats.auraReadingMultiplier;
  sendNotificationAndHistoryRecord(
    api,
    'Результат чтения ауры персонажа',
    splitAuraByDashes(generateAuraSubset(target.magicStats.aura, auraPercentage)),
  );
}

export function readLocationAuraSpell(api: EventModelApi<Sr2020Character>, data: SpellData) {
  const target = api.aquired(Location, data.location.id.toString());
  const auraPercentage = 100 * api.workModel.magicStats.auraReadingMultiplier;
  sendNotificationAndHistoryRecord(
    api,
    'Результат чтения ауры локации',
    splitAuraByDashes(generateAuraSubset(target.aura, auraPercentage)),
  );
}

export function dumptyHumptySpell(api: EventModelApi<Sr2020Character>, data: SpellData) {
  const durationInMinutes = 10 * data.power;
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, temporaryAntiDumpshock, { durationInMinutes });
}

export function dummySpell(api: EventModelApi<Sr2020Character>, data: never) {
  api.sendNotification('Спелл еще не реализован :(', 'Приходите завтра. Или послезавтра?');
}

export function spiritsRelatedSpell(api: EventModelApi<Sr2020Character>, data: never) {
  // TODO(https://trello.com/c/XHT0b9Oj/155-реализовать-заклинания-работающие-с-духами)
  api.sendNotification('Спелл еще не реализован :(', 'Спелл связан с духами которых пока что нет.');
}

export function dummyAreaSpell(api: EventModelApi<Sr2020Character>, data: never) {
  // TODO(https://trello.com/c/hIHZn9De/154-реализовать-заклинания-бьющие-по-всем-в-текущей-локации)
  api.sendNotification('Спелл еще не реализован :(', 'Площадные заклинания не реализованы.');
}

export function teaseLesserMindSpell(api: EventModelApi<Sr2020Character>, data: SpellData) {
  addTemporaryActiveAbility(api, 'take-no-harm', duration(10 * data.power, 'minutes'));
}

export function enlargeMyPencilSpell(api: EventModelApi<Sr2020Character>, data: SpellData) {
  addTemporaryActiveAbility(api, 'pencil-large', duration(20 * data.power, 'minutes'));
}

export function enlargeYourPencilSpell(api: EventModelApi<Sr2020Character>, data: SpellData) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId!, enlargeMyPencilSpell, data);
}

export function stoneSkinSpell(api: EventModelApi<Sr2020Character>, data: SpellData) {
  addTemporaryActiveAbility(api, 'skin-stone', duration(20 * data.power, 'minutes'));
}

// Location-attack spells

export function avalancheSpell(api: EventModelApi<Sr2020Character>, data: SpellData) {
  addTemporaryPassiveAbility(api, 'avalanche-able', duration(3, 'minutes'), { amount: Math.ceil(data.power / 2) });
}

export function birdsSpell(api: EventModelApi<Sr2020Character>, data: SpellData) {
  addTemporaryPassiveAbility(api, 'birds-able', duration(3 * data.power, 'minutes'), { amount: 3 * data.power });
}

export function cacophonySpell(api: EventModelApi<Sr2020Character>, data: SpellData) {
  addTemporaryPassiveAbility(api, 'cacophony-able', duration(5 * data.power, 'minutes'), { amount: 5 * data.power });
}

// For cases when no IT action is needed
export function doNothingSpell(api: EventModelApi<Sr2020Character>, data: SpellData) {}
