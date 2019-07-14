import { Event } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020CharacterApi } from '@sr2020/interface/models/sr2020-character.model';

function dummySpell(api: Sr2020CharacterApi, data: any, _: Event) {
  api.model.spellsCasted++;
}

module.exports = () => {
  return {
    dummySpell,
  };
};
