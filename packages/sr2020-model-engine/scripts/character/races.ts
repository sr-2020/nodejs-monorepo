import { MetaRace, Sr2020Character } from '@alice/sr2020-common/models/sr2020-character.model';
import { EventModelApi } from '@alice/alice-common/models/alice-model-engine';
import { addFeatureToModel, removeFeatureFromModel } from '@alice/sr2020-model-engine/scripts/character/features';
import { isHmhvv } from '@alice/sr2020-model-engine/scripts/character/common_helpers';
import {
  kEssenceLostPerHungerTickGhouls,
  kEssenceLostPerHungerTickVampires,
  kHmhvvHungerPeriod,
  kHmhvvHungerTimer,
  kHmhvvHungerTimerDescription,
} from '@alice/sr2020-model-engine/scripts/character/consts';
import { restartAllHungers } from '@alice/sr2020-model-engine/scripts/character/hunger';

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
  'meta-spirit': ['tech-blockade'],
  'meta-digital': ['meta-digital'],
};

export function setRaceForModel(model: Sr2020Character, race: MetaRace) {
  for (const id of kRaceFeatures[model.metarace]) removeFeatureFromModel(model, id);
  model.metarace = race;
  for (const id of kRaceFeatures[model.metarace]) addFeatureToModel(model, id);

  if (isHmhvv(model)) {
    model.essenceDetails = { max: 1000, gap: 700, used: 0 };
  }

  restartAllHungers(model);
}

export function setRace(api: EventModelApi<Sr2020Character>, data: { race: MetaRace }) {
  if (api.model.metarace == data.race) return;
  setRaceForModel(api.model, data.race);
}

export function hungerTick(api: EventModelApi<Sr2020Character>, data: {}) {
  api.setTimer(kHmhvvHungerTimer, kHmhvvHungerTimerDescription, kHmhvvHungerPeriod, hungerTick, {});
  const essenceLoss = api.model.metarace == 'meta-vampire' ? kEssenceLostPerHungerTickVampires : kEssenceLostPerHungerTickGhouls;
  api.model.essenceDetails.gap += Math.min(essenceLoss, api.workModel.essence);
  api.sendNotification('Голод HMHVV', 'Вы испытываете нечеловеческий голод');
}
