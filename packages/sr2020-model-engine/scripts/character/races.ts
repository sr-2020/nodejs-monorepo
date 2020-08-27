import { MetaRace, Sr2020Character } from '@sr2020/sr2020-common/models/sr2020-character.model';
import { EventModelApi } from '@sr2020/interface/models/alice-model-engine';
import { duration } from 'moment';
import { addFeatureToModel, removeFeatureFromModel } from '@sr2020/sr2020-model-engine/scripts/character/features';
import { essenceReset } from '@sr2020/sr2020-model-engine/scripts/character/essence';
import { resetHunger } from '@sr2020/sr2020-model-engine/scripts/character/hunger';

const kHmhvvHungerTimer = 'hmhvv-hunger';
const kHmhvvHungerTimerDescription = 'Голод HMHVV';
const kHmhvvHungerPeriod = duration(1, 'hour');
const kEssenceLostPerHungerTickVampires = 100;
const kEssenceLostPerHungerTickGhouls = 20;

const kRaceFeatures: { [race in MetaRace]: string[] } = {
  'meta-norm': ['feel-matrix', 'chem-weak'],
  'meta-dwarf': ['chem-resist', 'magic-feedback-resist', 'matrix-feedback-resist', 'good-rigga', 'dont-touch-my-hole'],
  'meta-elf': ['elven-prices'],
  'meta-ork': ['extra-hp', 'spirit-feed'],
  'meta-troll': [
    'extra-hp',
    'magic-feedback-resist',
    'matrix-feedback-resist',
    'good-rigga',
    'skin-armor',
    'this-my-glory-hole',
    'strong-arm',
    'feed-tamagochi',
  ],
  'meta-hmhvv1': ['strong-arm', 'starvation', 'chem-resist-heavy', 'chrome-blockade', 'tech-blockade', 'blood-thirst', 'vampire-feast'],
  'meta-hmhvv3': [
    'strong-arm',
    'meat-hunger',
    'ghoul-feast',
    'starvation',
    'chem-resist-heavy',
    'astral-vision',
    'chrome-blockade',
    'tech-blockade',
  ],
  'meta-spirit': ['tech-blockade'],
  'meta-ai': ['magic-blockade'],
  'meta-eghost': ['magic-blockade'],
};

export function setRace(api: EventModelApi<Sr2020Character>, data: { race: MetaRace }) {
  if (api.model.metarace == data.race) return;

  for (const id of kRaceFeatures[api.model.metarace]) removeFeatureFromModel(api.model, id);
  api.model.metarace = data.race;
  for (const id of kRaceFeatures[api.model.metarace]) addFeatureToModel(api.model, id);

  // Reset hunger to set proper hunger timer depending on troll/not troll.
  resetHunger(api.model);

  if (api.model.metarace == 'meta-hmhvv1' || api.model.metarace == 'meta-hmhvv3') {
    api.setTimer(kHmhvvHungerTimer, kHmhvvHungerTimerDescription, kHmhvvHungerPeriod, hungerTick, {});
    api.model.essenceDetails = { max: 1000, gap: 700, used: 0 };
  } else {
    essenceReset(api, {});
    api.removeTimer(kHmhvvHungerTimer);
  }
}

export function hungerTick(api: EventModelApi<Sr2020Character>, data: {}) {
  api.setTimer(kHmhvvHungerTimer, kHmhvvHungerTimerDescription, kHmhvvHungerPeriod, hungerTick, {});
  const essenceLoss = api.model.metarace == 'meta-hmhvv1' ? kEssenceLostPerHungerTickVampires : kEssenceLostPerHungerTickGhouls;
  api.model.essenceDetails.gap += Math.min(essenceLoss, api.workModel.essence);
  api.sendNotification('Голод HMHVV', 'Вы испытываете нечеловеческий голод');
}
