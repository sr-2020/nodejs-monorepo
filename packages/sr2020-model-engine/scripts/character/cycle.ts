import { EventModelApi } from '@alice/interface/models/alice-model-engine';
import { Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { resetKarmaCycleLimit } from '@alice/sr2020-model-engine/scripts/character/karma';

export function newLargeCycle(api: EventModelApi<Sr2020Character>, data: {}) {
  resetKarmaCycleLimit(api, data);
}
