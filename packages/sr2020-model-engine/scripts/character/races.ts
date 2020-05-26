import { MetaRace, Sr2020Character } from '@sr2020/sr2020-common/models/sr2020-character.model';
import { EventModelApi } from '@sr2020/interface/models/alice-model-engine';
import { duration } from 'moment';
import { addFeatureToModel, removeFeatureFromModel } from '@sr2020/sr2020-model-engine/scripts/character/features';

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
    if (api.model.metarace == 'meta-hmhvv1') {
      addFeatureToModel(api.model, 'blood-thirst');
      addFeatureToModel(api.model, 'vampire-feast');
    } else {
      addFeatureToModel(api.model, 'meat-hunger');
      addFeatureToModel(api.model, 'ghoul-feast');
    }
  } else {
    api.removeModifier(kHmhvvHungerTimer);
    removeFeatureFromModel(api.model, 'meat-hunger');
    removeFeatureFromModel(api.model, 'blood-thirst');
    removeFeatureFromModel(api.model, 'vampire-feast');
    removeFeatureFromModel(api.model, 'ghoul-feast');
  }
}

export function hungerTick(api: EventModelApi<Sr2020Character>, data: {}) {
  api.setTimer(kHmhvvHungerTimer, kHmhvvHungerTimerDescription, kHmhvvHungerPeriod, hungerTick, {});
  const essenceLoss = api.model.metarace == 'meta-hmhvv1' ? kEssenceLostPerHungerTickVampires : kEssenceLostPerHungerTickGhouls;
  api.model.essenceDetails.gap += Math.min(essenceLoss, api.workModel.essence);
  api.sendNotification('Голод HMHVV', 'Вы испытываете нечеловеческий голод');
}
