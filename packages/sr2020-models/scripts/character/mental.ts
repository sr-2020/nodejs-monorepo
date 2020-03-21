import { Sr2020Character, AddedActiveAbility } from '@sr2020/interface/models/sr2020-character.model';
import { EventModelApi, Event, UserVisibleError } from '@sr2020/interface/models/alice-model-engine';
import Chance = require('chance');
import { QrCode } from '@sr2020/interface/models/qr-code.model';
import { MentalQrData, writeMentalAbility } from '../qr/events';
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
  if (character.charisma == 0) {
    return xByDy(2, 8) + 4 + character.mentalDefenceBonus;
  } else {
    return character.charisma + xByDy(character.charisma, 8) + character.mentalDefenceBonus;
  }
}

export function useMentalAbility(api: EventModelApi<Sr2020Character>, data: AddedActiveAbility, event: Event) {
  const code: MentalQrData = {
    attack: mentalAttack(api.workModel),
    attackerId: api.model.modelId,
    name: data.humanReadableName,
    description: data.description,
    eventType: scannedMentalAbility.name,
  };
  api.sendOutboundEvent(QrCode, api.model.mentalQrId.toString(), writeMentalAbility, code);
}

export function scannedMentalAbility(api: EventModelApi<Sr2020Character>, data: MentalQrData, event: Event) {
  if (mentalDefence(api.workModel) >= data.attack) {
    api.sendOutboundEvent(Sr2020Character, data.attackerId, yourAbilityResult, { success: false });
    api.sendNotification('Успех!', 'Вы заблокировали ментальную атаку.');
  } else {
    api.sendOutboundEvent(Sr2020Character, data.attackerId, yourAbilityResult, { success: true });
    api.sendNotification('Провал!', 'Ментальная атака подействовала, выполняйте написанное.');
  }
}

export function scannedConsumedMentalAbility(api: EventModelApi<Sr2020Character>, data: never, event: Event) {
  throw new UserVisibleError('Действие этой способности уже закончилось');
}

export function yourAbilityResult(api: EventModelApi<Sr2020Character>, data: { success: boolean }, event: Event) {
  if (data.success) {
    api.sendNotification('Успех!', 'Ваша способность подействовала.');
  } else {
    api.sendNotification('Провал!', 'Цель защитилась от вашего воздействия.');
  }
}
