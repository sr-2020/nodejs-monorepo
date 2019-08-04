import { Event } from '@sr2020/interface/models/alice-model-engine';
import { Location } from '@sr2020/interface/models/location.model';
import { Spell, Sr2020CharacterApi } from '@sr2020/interface/models/sr2020-character.model';
import { reduceManaDensity } from '../location/events';
import { QrCode } from '@sr2020/interface/models/qr-code.model';
import { create } from '../qr/events';

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
];

export function increaseSpellsCasted(api: Sr2020CharacterApi, _data: {}, _event: Event) {
  api.model.spellsCasted++;
}

export function dummySpell(api: Sr2020CharacterApi, data: { qrCode?: number }, _event: Event) {
  if (data.qrCode != undefined) {
    api.sendOutboundEvent(QrCode, data.qrCode.toString(), create, {
      type: 'artifact',
      description: 'Этот артефакт позволяет скастовать спелл-заглушку даже не будучи магом!',
      eventType: dummySpell.name,
      usesLeft: 3,
    });
    api.sendNotification('Успех', 'Артефакт зачарован!');
    return;
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
    console.log('densityHalveSpell');
    api.sendOutboundEvent(QrCode, data.qrCode.toString(), create, {
      type: 'artifact',
      description: 'Этот артефакт позволяет поделить плотность маны пополам даже не будучи магом!',
      eventType: densityHalveSpell.name,
      usesLeft: 3,
    });
    api.sendNotification('Успех', 'Артефакт зачарован!');
    return;
  }
  api.model.spellsCasted++;
  const location = api.aquired('Location', data.locationId) as Location;
  api.sendOutboundEvent(Location, data.locationId, reduceManaDensity, { amount: location.manaDensity / 2 });
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
