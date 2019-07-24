import { Event } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020CharacterApi } from '@sr2020/interface/models/sr2020-character.model';
import { Location } from '@sr2020/interface/models/location.model';

function dummySpell(api: Sr2020CharacterApi, _data: void, _event: Event) {
  api.model.spellsCasted++;
  api.sendNotification('Скастован спелл', 'Ура! Вы скастовали спелл-заглушку');
}

function densityDrainSpell(api: Sr2020CharacterApi, data: { locationId: string; amount: number }, _: Event) {
  api.model.spellsCasted++;
  api.sendOutboundEvent(Location, data.locationId, 'reduce-mana-density', { amount: data.amount });
}

function densityHalveSpell(api: Sr2020CharacterApi, data: { locationId: string }, _: Event) {
  api.model.spellsCasted++;
  const location = api.aquired('Location', data.locationId) as Location;
  api.sendOutboundEvent(Location, data.locationId, 'reduce-mana-density', { amount: location.manaDensity / 2 });
}

module.exports = () => {
  return {
    dummySpell,
    densityDrainSpell,
    densityHalveSpell,
  };
};
