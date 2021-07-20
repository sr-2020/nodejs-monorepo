import { Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { EventModelApi } from '@alice/alice-common/models/alice-model-engine';
import { duration } from 'moment';
import { FullTargetedAbilityData } from '@alice/sr2020-common/models/common_definitions';
import { absoluteDeathUnchecked, clinicalDeathUnchecked } from '@alice/sr2020-model-engine/scripts/character/death_and_rebirth';

export const kFadingDecreaseTimerName = 'decrease-current-fading';
const kFadingDecreaseTimerPeriod = duration(1, 'minute');

export function addFadingDecreaseTimer(model: Sr2020Character) {
  model.timers.push({
    name: kFadingDecreaseTimerName,
    description: 'Уменьшение фейдинга (при наличии абилок)',
    miliseconds: kFadingDecreaseTimerPeriod.asMilliseconds(),
    eventType: decreaseCurrentFading.name,
    data: {},
  });
}

export function decreaseCurrentFading(api: EventModelApi<Sr2020Character>, data: {}) {
  api.model.hacking.fading = Math.max(0, api.model.hacking.fading - api.workModel.hacking.fadingDecrease);
  addFadingDecreaseTimer(api.model);
}

export function clinicalDeathRedRoom(api: EventModelApi<Sr2020Character>, data: FullTargetedAbilityData) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId, clinicalDeathUnchecked, { location: data.location });
}

export function absoluteDeathRedRoom(api: EventModelApi<Sr2020Character>, data: FullTargetedAbilityData) {
  api.sendOutboundEvent(Sr2020Character, data.targetCharacterId, absoluteDeathUnchecked, { location: data.location });
}
