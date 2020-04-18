import { MetaRace, Sr2020Character } from '@sr2020/interface/models/sr2020-character.model';
import { EventModelApi, Event } from '@sr2020/interface/models/alice-model-engine';
import { duration } from 'moment';

const kHmhvvHungerTimer = 'hmhvv-hunger';
const kHmhvvHungerPeriod = duration(1, 'hour');
const kEssenceLostPerHungerTick = 50;

export function setRace(api: EventModelApi<Sr2020Character>, data: { race: MetaRace }, _: Event) {
  if (api.model.metarace == data.race) return;
  api.model.metarace = data.race;

  if (api.model.metarace == 'meta-hmhvv1' || api.model.metarace == 'meta-hmhvv3') {
    api.setTimer(kHmhvvHungerTimer, kHmhvvHungerPeriod, hungerTick, {});
  } else {
    api.removeModifier(kHmhvvHungerTimer);
  }
}

export function hungerTick(api: EventModelApi<Sr2020Character>, data: {}, _: Event) {
  api.setTimer(kHmhvvHungerTimer, kHmhvvHungerPeriod, hungerTick, {});
  api.model.essenceDetails.gap += Math.min(kEssenceLostPerHungerTick, api.workModel.essence);
  api.sendNotification('Голод HMHVV', 'Вы испытываете нечеловеческий голод');
}
