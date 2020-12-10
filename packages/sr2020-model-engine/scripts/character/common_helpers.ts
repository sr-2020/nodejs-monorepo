import { MetaRace, Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { kHungerTimerDuration, kHungerTimerName, kHungerTimerStage1Description } from '@alice/sr2020-model-engine/scripts/character/consts';
import { duration } from 'moment';

export function isHmhvv(model: Sr2020Character) {
  const hmhvvRaces: MetaRace[] = ['meta-vampire', 'meta-ghoul'];
  return hmhvvRaces.includes(model.metarace);
}

export function removeHunger(model: Sr2020Character) {
  model.timers = model.timers.filter((timer) => timer.name != kHungerTimerName);
}

export function resetHunger(model: Sr2020Character) {
  removeHunger(model);
  model.timers.push({
    name: kHungerTimerName,
    description: kHungerTimerStage1Description,
    miliseconds: getHungerTimerDuration(model).asMilliseconds(),
    eventType: 'hungerStage1',
    data: {},
  });
}

export function getHungerTimerDuration(model: Sr2020Character) {
  const eatsMoreOften = !!model.passiveAbilities.find((ability) => ability.id == 'feed-tamagochi');
  return duration(kHungerTimerDuration * (eatsMoreOften ? 0.5 : 1), 'milliseconds');
}
