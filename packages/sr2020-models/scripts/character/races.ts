import { MetaRace, Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { EventModelApi, Event } from '@sr2020/interface/models/alice-model-engine';

export function setRace(api: EventModelApi<Sr2020Character>, data: { race: MetaRace }, _: Event) {
  api.model.metarace = data.race;
}
