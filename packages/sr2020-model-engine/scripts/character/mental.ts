import { AddedActiveAbility, Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { EventModelApi, UserVisibleError } from '@alice/interface/models/alice-model-engine';
import { QrCode } from '@alice/sr2020-common/models/qr-code.model';
import { MentalAbilityData, writeMentalAbility } from '../qr/events';
import { FullActiveAbilityData, FullTargetedAbilityData, kActiveAbilitiesDisabledTimer } from './active_abilities';
import { addTemporaryModifier, modifierFromEffect, sendNotificationAndHistoryRecord } from './util';
import { increaseMentalProtection } from './basic_effects';
import { duration } from 'moment';
import { MentalQrData } from '@alice/sr2020-model-engine/scripts/qr/datatypes';
import * as Chance from 'chance';

const chance = new Chance();

// Returns a result of the roll of X dices DY
function xByDy(x: number, y: number): number {
  let result = 0;
  for (let i = 0; i < x; ++i) result += chance.natural({ min: 1, max: y });
  return result;
}

function mentalAttack(character: Sr2020Character) {
  return xByDy(character.charisma, 8) + character.mentalAttackBonus;
}

function mentalDefence(character: Sr2020Character) {
  return 3 + xByDy(character.charisma, 8) + character.mentalDefenceBonus;
}

export function paralysis1Ability(api: EventModelApi<Sr2020Character>, data: AddedActiveAbility) {
  useMentalAbility(api, 'Ты не можешь двигаться 10 минут или пока тебе не нанесён физический урон (-1хит).');
}

export function paralysis2Ability(api: EventModelApi<Sr2020Character>, data: AddedActiveAbility) {
  useMentalAbility(api, 'Ты не можешь двигаться 10 минут. Не можешь пользоваться активными абилками.');
}

export function paralysis3Ability(api: EventModelApi<Sr2020Character>, data: AddedActiveAbility) {
  useMentalAbility(api, 'Ты не можешь двигаться и произносить звуки 10 минут. Не можешь пользоваться активными абилками.');
}

export function flyYouFoolAbility(api: EventModelApi<Sr2020Character>, data: AddedActiveAbility) {
  useMentalAbility(
    api,
    'Ты очень боишься и стараешься убежать как можно дальше от менталиста. Ты не можешь пользоваться своими способностями в течении 10 минут. Через 10 минут эффект проходит.',
    true,
  );
}

export function scornHimAbility(api: EventModelApi<Sr2020Character>, data: AddedActiveAbility) {
  useMentalAbility(
    api,
    'Ты стараешься сделать агрессивное, но не смертельное действие к выбранному персонажу.  (оскорбить, плюнуть на одежду, выразить презрение убеждениям )',
  );
}

export function killHimAbility(api: EventModelApi<Sr2020Character>, data: AddedActiveAbility) {
  useMentalAbility(
    api,
    'Ты активно стараешься убить персонажа, на которого указывает менталист. Выбираешь наиболее быстрый способ, не задумываясь о последствиях.  Если цель убита - эффект воздействия прекращается. Пока цель жива - ты стараешься её убить.',
  );
}

export function billionerWalkAbility(api: EventModelApi<Sr2020Character>, data: AddedActiveAbility) {
  useMentalAbility(api, 'Ты переводишь на счет менталиста половину денег со своего счета.');
}

export function danilaINeedHelpAbility(api: EventModelApi<Sr2020Character>, data: AddedActiveAbility) {
  useMentalAbility(api, 'Ты оказываешь услугу, даже если это грозит тебе средними проблемами (потеря дохода за 1 экономический цикл).');
}

export function reallyNeedItAbility(api: EventModelApi<Sr2020Character>, data: AddedActiveAbility) {
  useMentalAbility(
    api,
    'Ты даришь менталисту 1 игровой предмет по выбору менталиста.  Предмет должен быть отчуждаем (например, нельзя попросить подарить установленный имплант)',
  );
}

export function lukeIAmYourFatherAbility(api: EventModelApi<Sr2020Character>, data: AddedActiveAbility) {
  useMentalAbility(api, 'Ты выполняешь любую просьбу (кроме самоубийства). Выполнение услуги не должно занимать больше 30 минут.');
}

export function tellMeTheTruthAbility(api: EventModelApi<Sr2020Character>, data: AddedActiveAbility) {
  useMentalAbility(api, 'Ты честно отвечаешь на 3 вопроса.');
}

export function lieToMeAbility(api: EventModelApi<Sr2020Character>, data: AddedActiveAbility) {
  useMentalAbility(api, 'Тебе говорят маркер. Если в течение следующих 15 минут ты лжешь - ты выполняешь этот маркер.');
}

export function oblivionAbility(api: EventModelApi<Sr2020Character>, data: AddedActiveAbility) {
  useMentalAbility(
    api,
    'Ты забыл события последней сцены. Это работает только если тебе не был нанесён урон в течение сцены (снят хотя бы 1 хит). Если тебе был нанесён урон, ты говоришь об этом менталисту',
  );
}

export function fullOblivionAbility(api: EventModelApi<Sr2020Character>, data: AddedActiveAbility) {
  useMentalAbility(api, 'Ты забываешь события последней сцены, даже если тебе был нанесён физический урон.');
}

function useMentalAbility(api: EventModelApi<Sr2020Character>, description: string, disablesAbilities: boolean = false) {
  const code: MentalAbilityData = {
    attack: mentalAttack(api.workModel),
    attackerId: api.model.modelId,
    name: 'Способность менталиста',
    description,
    eventType: scannedMentalAbility.name,
    disablesAbilities,
  };
  api.sendOutboundEvent(QrCode, api.model.mentalQrId.toString(), writeMentalAbility, code);
}

export function scannedMentalAbility(api: EventModelApi<Sr2020Character>, data: MentalQrData) {
  if (api.workModel.currentBody != 'physical') {
    api.sendOutboundEvent(Sr2020Character, data.attackerId, yourAbilityResult, { success: false });
    api.sendNotification('Успех!', 'Ментальные способности не действуют на ваше тело.');
  }

  if (mentalDefence(api.workModel) >= data.attack) {
    api.sendOutboundEvent(Sr2020Character, data.attackerId, yourAbilityResult, { success: false });
    api.sendNotification('Головная боль', 'У вас болит голова, но, наверное, это скоро пройдет.');
  } else {
    api.sendOutboundEvent(Sr2020Character, data.attackerId, yourAbilityResult, { success: true });
    sendNotificationAndHistoryRecord(api, 'Ментальное воздействие', data.textOnDefenceFailure);
    if (data.disablesAbilities) {
      api.setTimer(kActiveAbilitiesDisabledTimer, 'Снова можно пользоваться активными способностями', duration(10, 'minutes'), '_', {});
    }
  }
}

export function scannedConsumedMentalAbility(api: EventModelApi<Sr2020Character>, data: never) {
  throw new UserVisibleError('Действие этой способности уже закончилось');
}

export function yourAbilityResult(api: EventModelApi<Sr2020Character>, data: { success: boolean }) {
  if (data.success) {
    api.sendNotification('Успех!', 'Ваша способность подействовала.');
  } else {
    api.sendNotification('Провал!', 'Цель защитилась от вашего воздействия.');
  }
}

export function increaseTheMentalProtectionAbility(api: EventModelApi<Sr2020Character>, data: FullTargetedAbilityData) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId, adjustMentalProtectionEvent, { amount: 8, durationMinutes: 12 * 60 });
}

export function reduceTheMentalProtectionAbility(api: EventModelApi<Sr2020Character>, data: FullTargetedAbilityData) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId, adjustMentalProtectionEvent, { amount: -8, durationMinutes: 6 * 60 });
}

export function iDontTrustAnybody(api: EventModelApi<Sr2020Character>, _data: FullActiveAbilityData) {
  api.sendSelfEvent(adjustMentalProtectionEvent, { amount: 8, durationMinutes: 30 });
}

export function youDontTrustAnybody(api: EventModelApi<Sr2020Character>, data: FullTargetedAbilityData) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId, adjustMentalProtectionEvent, { amount: 8, durationMinutes: 30 });
}

export function adjustMentalProtectionEvent(api: EventModelApi<Sr2020Character>, data: { amount: number; durationMinutes: number }) {
  addTemporaryModifier(
    api,
    modifierFromEffect(increaseMentalProtection, { amount: data.amount }),
    duration(data.durationMinutes, 'minutes'),
    'Изменение ментальной защиты',
  );
}
