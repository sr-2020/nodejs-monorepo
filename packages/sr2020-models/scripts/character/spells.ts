import { Event } from '@sr2020/interface/models/alice-model-engine';
import { Location } from '@sr2020/interface/models/location.model';
import { Spell, Sr2020CharacterApi, Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { reduceManaDensity } from '../location/events';
import { QrCode } from '@sr2020/interface/models/qr-code.model';
import { create } from '../qr/events';
import { revive } from './death_and_rebirth';

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
    return createArtifact(api, data.qrCode, 'восстановить все хиты', fullHealSpell.name);
  }

  if (data.targetCharacterId != undefined) {
    api.sendOutboundEvent(Sr2020Character, data.targetCharacterId.toString(), fullHealSpell, {});
    return;
  }

  if (api.model.healthState == 'healthy') {
    api.sendNotification('Лечение', 'Хиты полностью восстановлены');
  } else {
    revive(api, data, event);
  }
}

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
