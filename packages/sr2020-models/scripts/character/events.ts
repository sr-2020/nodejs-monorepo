import { Event } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020CharacterApi } from '@sr2020/interface/models/sr2020-character.model';
import { Location } from '@sr2020/interface/models/location.model';

function dummySpell(api: Sr2020CharacterApi, _data: void, _event: Event) {
  api.model.spellsCasted++;
}

function densityDrainSpell(api: Sr2020CharacterApi, data: { locationId: string; amount: number }, _: Event) {
  api.model.spellsCasted++;
  api.sendOutboundEvent(Location, data.locationId, 'reduce-mana-density', { amount: data.amount });
}

module.exports = () => {
  return {
    dummySpell,
    densityDrainSpell,
  };
};
