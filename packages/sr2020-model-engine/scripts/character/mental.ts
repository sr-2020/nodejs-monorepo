import { AddedActiveAbility, Sr2020Character } from '@sr2020/sr2020-common/models/sr2020-character.model';
import { EventModelApi, UserVisibleError } from '@sr2020/interface/models/alice-model-engine';
import { QrCode } from '@sr2020/sr2020-common/models/qr-code.model';
import { MentalAbilityData, writeMentalAbility } from '../qr/events';
import { FullActiveAbilityData, FullTargetedAbilityData } from './active_abilities';
import { addTemporaryModifier, modifierFromEffect } from './util';
import { increaseMentalProtection } from './basic_effects';
import { duration } from 'moment';
import { MentalQrData } from '@sr2020/sr2020-model-engine/scripts/qr/datatypes';
import Chance = require('chance');

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

export function useMentalAbility(api: EventModelApi<Sr2020Character>, data: AddedActiveAbility) {
  const code: MentalAbilityData = {
    attack: mentalAttack(api.workModel),
    attackerId: api.model.modelId,
    name: data.humanReadableName,
    description: data.description,
    eventType: scannedMentalAbility.name,
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
    api.sendNotification('Провал!', 'Ментальная атака подействовала, выполняйте написанное.');
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
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId, adjustMentalProtectionEvent, { amount: 8, durationMinutes: 24 * 60 });
}

export function reduceTheMentalProtectionAbility(api: EventModelApi<Sr2020Character>, data: FullTargetedAbilityData) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId, adjustMentalProtectionEvent, { amount: -8, durationMinutes: 24 * 60 });
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
