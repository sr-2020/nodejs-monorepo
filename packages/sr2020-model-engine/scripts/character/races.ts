import { MetaRace, Sr2020Character } from '@sr2020/sr2020-common/models/sr2020-character.model';
import { EventModelApi } from '@sr2020/interface/models/alice-model-engine';
import { duration } from 'moment';

const kHmhvvHungerTimer = 'hmhvv-hunger';
const kHmhvvHungerTimerDescription = 'Голод HMHVV';
const kHmhvvHungerPeriod = duration(1, 'hour');
const kEssenceLostPerHungerTickVampires = 100;
const kEssenceLostPerHungerTickGhouls = 20;

export function setRace(api: EventModelApi<Sr2020Character>, data: { race: MetaRace }) {
  if (api.model.metarace == data.race) return;
  api.model.metarace = data.race;

  if (api.model.metarace == 'meta-hmhvv1' || api.model.metarace == 'meta-hmhvv3') {
    api.setTimer(kHmhvvHungerTimer, kHmhvvHungerTimerDescription, kHmhvvHungerPeriod, hungerTick, {});
  } else {
    api.removeModifier(kHmhvvHungerTimer);
  }
}

export function hungerTick(api: EventModelApi<Sr2020Character>, data: {}) {
  api.setTimer(kHmhvvHungerTimer, kHmhvvHungerTimerDescription, kHmhvvHungerPeriod, hungerTick, {});
  const essenceLoss = api.model.metarace == 'meta-hmhvv1' ? kEssenceLostPerHungerTickVampires : kEssenceLostPerHungerTickGhouls;
  api.model.essenceDetails.gap += Math.min(essenceLoss, api.workModel.essence);
  api.sendNotification('Голод HMHVV', 'Вы испытываете нечеловеческий голод');
}
