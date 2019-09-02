import { Event, Modifier } from '@sr2020/interface/models/alice-model-engine';
import { Location } from '@sr2020/interface/models/location.model';
import { Spell, Sr2020CharacterApi, Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { reduceManaDensity } from '../location/events';
import { QrCode } from '@sr2020/interface/models/qr-code.model';
import { create } from '../qr/events';
import { revive } from './death_and_rebirth';
import { sendNotificationAndHistoryRecord, addHistoryRecord, addTemporaryModifier, modifierFromEffect } from './util';
import { AllActiveAbilities } from './abilities';
import { MAX_POSSIBLE_HP } from './consts';

const AllSpells: Spell[] = [
  {
    humanReadableName: 'Заглушка',
    description: 'Спелл-заглушка, просто увеличивает число скастованных спеллов. Может быть наложен на артефакт.',
    eventType: dummySpell.name,
    canTargetSelf: true,
    canTargetItem: true,
    canTargetLocation: false,
    canTargetSingleTarget: false,
  },
  {
    humanReadableName: 'Плотность пополам!',
    description: 'Уменьшает плотность маны в локации вдвое. Может быть наложен на артефакт.',
    eventType: densityHalveSpell.name,
    canTargetSelf: false,
    canTargetItem: true,
    canTargetLocation: true,
    canTargetSingleTarget: false,
  },
  {
    humanReadableName: 'Исцеление',
    description: 'Восстанавливает все хиты.',
    eventType: fullHealSpell.name,
    canTargetSelf: true,
    canTargetItem: true,
    canTargetLocation: false,
    canTargetSingleTarget: true,
  },
  {
    humanReadableName: 'Light Heal',
    description: 'Восстанавливает текущие хиты.',
    eventType: lightHealSpell.name,
    canTargetSelf: true,
    canTargetItem: false,
    canTargetLocation: false,
    canTargetSingleTarget: true,
  },
  {
    humanReadableName: 'Ground Heal',
    description: 'Дает временную одноразовую способность поднять одну цель из КС/тяжрана в полные хиты',
    eventType: groundHealSpell.name,
    canTargetSelf: true,
    canTargetItem: false,
    canTargetLocation: false,
    canTargetSingleTarget: false,
  },
  {
    humanReadableName: 'Fireball',
    description: 'Дает временную возможность кинуть несколько огненных шаров',
    eventType: fireballSpell.name,
    canTargetSelf: true,
    canTargetItem: false,
    canTargetLocation: false,
    canTargetSingleTarget: false,
  },
  {
    humanReadableName: 'Field of denial',
    description: 'Дает частичную защиту от тяжелого оружия',
    eventType: fieldOfDenialSpell.name,
    canTargetSelf: true,
    canTargetItem: false,
    canTargetLocation: false,
    canTargetSingleTarget: false,
  },
  {
    humanReadableName: 'Live long and prosper',
    description: 'Увеличивает текущие и максимальные хиты',
    eventType: liveLongAndProsperSpell.name,
    canTargetSelf: true,
    canTargetItem: false,
    canTargetLocation: false,
    canTargetSingleTarget: true,
  },
];

function createArtifact(api: Sr2020CharacterApi, qrCode: number, whatItDoes: string, eventType: string, usesLeft: number = 1) {
  api.sendOutboundEvent(QrCode, qrCode.toString(), create, {
    type: 'artifact',
    description: `Этот артефакт позволяет ${whatItDoes} даже не будучи магом!`,
    eventType,
    usesLeft,
  });
  api.sendNotification('Успех', 'Артефакт зачарован!');
}

export function increaseSpellsCasted(api: Sr2020CharacterApi, _data: {}, _event: Event) {
  api.model.spellsCasted++;
}

export function dummySpell(api: Sr2020CharacterApi, data: { qrCode?: number }, _event: Event) {
  if (data.qrCode != undefined) {
    return createArtifact(api, data.qrCode, 'скастовать спелл-заглушку', dummySpell.name, 3);
  }
  api.sendSelfEvent(increaseSpellsCasted, {});
  api.sendNotification('Скастован спелл', 'Ура! Вы скастовали спелл-заглушку');
}

export function densityDrainSpell(api: Sr2020CharacterApi, data: { locationId: string; amount: number }, _: Event) {
  api.model.spellsCasted++;
  api.sendOutboundEvent(Location, data.locationId, reduceManaDensity, { amount: data.amount });
}

export function densityHalveSpell(api: Sr2020CharacterApi, data: { locationId: string; qrCode?: number }, _: Event) {
  if (data.qrCode != undefined) {
    return createArtifact(api, data.qrCode, 'поделить плотность маны пополам', densityHalveSpell.name, 3);
  }
  api.model.spellsCasted++;
  const location = api.aquired('Location', data.locationId) as Location;
  api.sendOutboundEvent(Location, data.locationId, reduceManaDensity, { amount: location.manaDensity / 2 });
}

export function fullHealSpell(api: Sr2020CharacterApi, data: { qrCode?: number; targetCharacterId?: number }, event: Event) {
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
export function lightHealSpell(api: Sr2020CharacterApi, data: { targetCharacterId?: number; power: number }, event: Event) {
  if (data.targetCharacterId != undefined) {
    addHistoryRecord(api, 'Заклинание', 'Light Heal: на цель');
    api.sendNotification('Успех', 'Заклинание совершено');
    api.sendOutboundEvent(Sr2020Character, data.targetCharacterId.toString(), lightHeal, data);
  } else {
    addHistoryRecord(api, 'Заклинание', 'Light Heal: на себя');
    api.sendSelfEvent(lightHeal, data);
  }
  magicFeedback(api, data.power, event);
}

export function lightHeal(api: Sr2020CharacterApi, data: { power: number }, event: Event) {
  const hpRestored = data.power;
  sendNotificationAndHistoryRecord(api, 'Лечение', `Восстановлено хитов: ${hpRestored}`);
}

export const GROUND_HEAL_MODIFIER_NAME = 'ground-heal-modifier';

export function groundHealSpell(api: Sr2020CharacterApi, data: { power: number }, event: Event) {
  sendNotificationAndHistoryRecord(api, 'Заклинание', 'Ground Heal: на себя');
  const durationInSeconds = 10 * data.power * 60;
  const m = modifierFromEffect(groundHealEffect, { name: GROUND_HEAL_MODIFIER_NAME });
  addTemporaryModifier(api, m, durationInSeconds);
  magicFeedback(api, data.power, event);
}

export function groundHealEffect(api: Sr2020CharacterApi, m: Modifier) {
  api.model.activeAbilities.push(AllActiveAbilities.find((a) => (a.humanReadableName = 'Ground Heal'))!!);
}

export function liveLongAndProsperSpell(api: Sr2020CharacterApi, data: { targetCharacterId?: number; power: number }, event: Event) {
  if (data.targetCharacterId != undefined) {
    addHistoryRecord(api, 'Заклинание', 'Live Long and Prosper: на цель');
    api.sendNotification('Успех', 'Заклинание совершено');
    api.sendOutboundEvent(Sr2020Character, data.targetCharacterId.toString(), liveLongAndProsper, data);
  } else {
    addHistoryRecord(api, 'Заклинание', 'Live Long and Prosper: на себя');
    api.sendSelfEvent(liveLongAndProsper, data);
  }
  magicFeedback(api, data.power, event);
}

export function liveLongAndProsper(api: Sr2020CharacterApi, data: { power: number }, event: Event) {
  const hpIncrease = Math.round(Math.sqrt(data.power));
  const durationInSeconds = Math.round(Math.sqrt(data.power)) * 60;
  sendNotificationAndHistoryRecord(api, 'Лечение', `Максимальные и текущие хиты временно увеличены на ${hpIncrease}`);
  const m = modifierFromEffect(maxHpIncreaseEffect, { amount: hpIncrease });
  addTemporaryModifier(api, m, durationInSeconds);
}

export function maxHpIncreaseEffect(api: Sr2020CharacterApi, m: Modifier) {
  api.model.maxHp += m.amount;
  api.model.maxHp = Math.min(api.model.maxHp, MAX_POSSIBLE_HP);
}

//
// Offensive spells
//

export function fireballSpell(api: Sr2020CharacterApi, data: { power: number }, event: Event) {
  sendNotificationAndHistoryRecord(api, 'Заклинание', 'Fireball: на себя');
  const durationInSeconds = (data.power * 60) / 2;
  const amount = Math.floor(data.power / 2);
  const m = modifierFromEffect(fireballEffect, { amount, durationInSeconds });
  addTemporaryModifier(api, m, durationInSeconds);
  magicFeedback(api, data.power, event);
}

export function fireballEffect(api: Sr2020CharacterApi, m: Modifier) {
  api.model.passiveAbilities.push({
    humanReadableName: 'Fireball',
    description: `Можете кинуть ${m.amount} огненных шаров в течение ${m.durationInSeconds / 60} минут.`,
  });
}

//
// Defensive spells
//

export function fieldOfDenialSpell(api: Sr2020CharacterApi, data: { power: number }, event: Event) {
  sendNotificationAndHistoryRecord(api, 'Заклинание', 'Field of denial: на себя');
  const durationInSeconds = 40 * 60;
  const m = modifierFromEffect(fieldOfDenialEffect);
  addTemporaryModifier(api, m, durationInSeconds);
  magicFeedback(api, data.power, event);
}

export function fieldOfDenialEffect(api: Sr2020CharacterApi, m: Modifier) {
  api.model.passiveAbilities.push({
    humanReadableName: 'Field of denial',
    description: `Попадание в зонтик тяжелым оружием игнорируется.`,
  });
}

//
// Events for learning and forgetting spells
//
export function learnSpell(api: Sr2020CharacterApi, data: { spellName: string }, _: Event) {
  const spell = AllSpells.find((s) => s.eventType == data.spellName);
  if (!spell) {
    throw Error('learnSpell: Unknown spellName');
  }
  api.model.spells.push(spell);
}

export function forgetSpell(api: Sr2020CharacterApi, data: { spellName: string }, _: Event) {
  api.model.spells = api.model.spells.filter((s) => s.eventType != data.spellName);
}

export function forgetAllSpells(api: Sr2020CharacterApi, data: {}, _: Event) {
  api.model.spells = [];
}

// Magic feedback implementation
function magicFeedback(api: Sr2020CharacterApi, power: number, event: Event) {
  const feedbackTimeSeconds = Math.floor((power + 1) / 2) * 60;
  const feedbackAmount = Math.floor((power + 1) / 2);

  const m = modifierFromEffect(magicFeedbackEffect, { amount: feedbackAmount });
  addTemporaryModifier(api, m, feedbackTimeSeconds);
}

export function magicFeedbackEffect(api: Sr2020CharacterApi, m: Modifier) {
  api.model.magic -= m.amount;
}
