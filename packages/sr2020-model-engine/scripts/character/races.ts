import { MetaRace, Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { EventModelApi } from '@alice/alice-common/models/alice-model-engine';
import { duration } from 'moment';
import { addFeatureToModel, removeFeatureFromModel } from '@alice/sr2020-model-engine/scripts/character/features';
import { isHmhvv, removeHunger, resetHunger } from '@alice/sr2020-model-engine/scripts/character/common_helpers';

const kHmhvvHungerTimer = 'hmhvv-hunger';
const kHmhvvHungerTimerDescription = 'Голод HMHVV';
const kHmhvvHungerPeriod = duration(1, 'hour');
const kEssenceLostPerHungerTickVampires = 100;
const kEssenceLostPerHungerTickGhouls = 20;

const kRaceFeatures: { [race in MetaRace]: string[] } = {
  'meta-norm': ['meta-norm', 'feel-matrix', 'chem-weak'],
  'meta-dwarf': ['meta-dwarf', 'chem-resist', 'magic-feedback-resist', 'matrix-feedback-resist', 'good-rigga', 'dont-touch-my-hole'],
  'meta-elf': ['meta-elf', 'elven-prices'],
  'meta-ork': ['meta-ork', 'extra-hp', 'spirit-feed'],
  'meta-troll': [
    'meta-troll',
    'extra-hp',
    'magic-feedback-resist',
    'matrix-feedback-resist',
    'good-rigga',
    'skin-armor',
    'this-my-glory-hole',
    'strong-arm',
    'feed-tamagochi',
  ],
  'meta-vampire': [
    'meta-vampire',
    'strong-arm',
    'starvation',
    'chem-resist-heavy',
    'chrome-blockade',
    'tech-blockade',
    'blood-thirst',
    'vampire-feast',
  ],
  'meta-ghoul': [
    'meta-ghoul',
    'strong-arm',
    'meat-hunger',
    'ghoul-feast',
    'starvation',
    'chem-resist-heavy',
    'astral-vision',
    'chrome-blockade',
    'tech-blockade',
  ],
  'meta-spirit': ['meta-spirit', 'tech-blockade', 'can-be-exorcized', 'fleshpoint'],
  'meta-ai': ['meta-ai', 'magic-blockade'],
  'meta-eghost': ['meta-eghost', 'magic-blockade'],
};

export function setRaceForModel(model: Sr2020Character, race: MetaRace) {
  for (const id of kRaceFeatures[model.metarace]) removeFeatureFromModel(model, id);
  model.metarace = race;
  for (const id of kRaceFeatures[model.metarace]) addFeatureToModel(model, id);

  if (isHmhvv(model)) {
    // HMHVV don't have "normal" hunger.
    removeHunger(model);
    resetHmhvvHunger(model);
    model.essenceDetails = { max: 1000, gap: 700, used: 0 };
  } else {
    // Reset hunger to set proper hunger timer depending on troll/not troll.
    resetHunger(model);
    removeHmhvvHunger(model);
  }
}

export function setRace(api: EventModelApi<Sr2020Character>, data: { race: MetaRace }) {
  if (api.model.metarace == data.race) return;
  setRaceForModel(api.model, data.race);
}

export function removeHmhvvHunger(model: Sr2020Character) {
  model.timers = model.timers.filter((timer) => timer.name != kHmhvvHungerTimer);
}

export function resetHmhvvHunger(model: Sr2020Character) {
  removeHmhvvHunger(model);
  model.timers.push({
    name: kHmhvvHungerTimer,
    description: kHmhvvHungerTimerDescription,
    miliseconds: kHmhvvHungerPeriod.asMilliseconds(),
    eventType: hungerTick.name,
    data: {},
  });
}

export function hungerTick(api: EventModelApi<Sr2020Character>, data: {}) {
  api.setTimer(kHmhvvHungerTimer, kHmhvvHungerTimerDescription, kHmhvvHungerPeriod, hungerTick, {});
  const essenceLoss = api.model.metarace == 'meta-vampire' ? kEssenceLostPerHungerTickVampires : kEssenceLostPerHungerTickGhouls;
  api.model.essenceDetails.gap += Math.min(essenceLoss, api.workModel.essence);
  api.sendNotification('Голод HMHVV', 'Вы испытываете нечеловеческий голод');
}
