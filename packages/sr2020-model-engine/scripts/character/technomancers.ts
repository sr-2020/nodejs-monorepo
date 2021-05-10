import { Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { EventModelApi } from '@alice/alice-common/models/alice-model-engine';
import { duration } from 'moment';

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
  api.model.hacking.fading = Math.max(0, api.model.hacking.fading - api.model.hacking.fadingDecrease);
  addFadingDecreaseTimer(api.model);
}
