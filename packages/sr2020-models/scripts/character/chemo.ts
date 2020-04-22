import { EventModelApi, Event, UserVisibleError, EffectModelApi, Modifier } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020Character, Concentrations } from '@sr2020/interface/models/sr2020-character.model';
import { kAllPills } from './chemo_library';
import { addTemporaryModifier, modifierFromEffect } from './util';
import { duration, Duration } from 'moment';
import { increaseMentalAttack } from './basic_effects';
import { healthStateTransition } from './death_and_rebirth';

export type ChemoLevel = 'base' | 'uber' | 'super' | 'crysis';

interface InstantEffect {
  handler: (api: EventModelApi<Sr2020Character>, data: { amount: number }, event: Event) => void;
  amount: number;
}

interface DurationEffect {
  handler: (api: EffectModelApi<Sr2020Character>, m: Modifier) => void;
  duration: Duration;
  amount: number;
}

interface ChemoEffect {
  element: keyof Concentrations;
  level: ChemoLevel;
  instantEffect?: InstantEffect;
  durationEffect?: DurationEffect;
  message: string;
}

export const kAllChemoEffects: ChemoEffect[] = [
  {
    element: 'iodine',
    level: 'base',
    message: 'Ты восстановил один хит.',
  },
  {
    element: 'iodine',
    level: 'uber',
    message: 'Ты вылечился из тяжелого ранения!',
    instantEffect: {
      handler: reviveTo1Hp,
      amount: 0,
    },
  },
  {
    element: 'iodine',
    level: 'super',
    message: 'Ты восстановил два хита.',
  },
  {
    element: 'iodine',
    level: 'crysis',
    message: 'Ты восстановил два хита. Появилась зависимость.',
  },
  {
    element: 'opium',
    level: 'base',
    durationEffect: {
      handler: increaseMentalAttack,
      amount: 3,
      duration: duration(30, 'minutes'),
    },
    message: 'На 30 минут увеличивает способности персонажа-менталиста к ментальному воздействию.',
  },
  {
    element: 'opium',
    level: 'uber',
    durationEffect: {
      handler: increaseMentalAttack,
      amount: 10,
      duration: duration(30, 'minutes'),
    },
    message: 'На 30 минут сильно увеличивает способности персонажа-менталиста к ментальному воздействию.',
  },
  {
    element: 'opium',
    level: 'super',
    durationEffect: {
      handler: increaseMentalAttack,
      amount: 5,
      duration: duration(30, 'minutes'),
    },
    message: 'На 30 минут увеличивает способности персонажа-менталиста к ментальному воздействию.',
  },
  {
    element: 'opium',
    level: 'crysis',
    durationEffect: {
      handler: increaseMentalAttack,
      amount: 5,
      duration: duration(30, 'minutes'),
    },
    message: 'На 30 минут увеличивает способности персонажа-менталиста к ментальному воздействию. Появилась зависимость.',
  },
];

export function consumeChemo(api: EventModelApi<Sr2020Character>, data: { id: string }, _: Event) {
  // TODO(aeremin) Check for body type
  const pill = kAllPills.find((it) => it.id == data.id);
  if (!pill) {
    throw new UserVisibleError('Такого препарата не существует');
  }
  for (const element in pill.content) {
    const amount = pill.content[element];
    const modifierClass = `${element}-concentration`;
    const mods = api.getModifiersByClass(modifierClass);
    if (mods.length) {
      mods[0].amount += amount;
    } else {
      addTemporaryModifier(api, modifierFromEffect(increaseConcentration, { element, amount }, modifierClass), duration(1, 'hour'));
    }
  }
  api.sendSelfEvent(checkConcentrations, { concentrations: pill.content });
}

export function checkConcentrations(api: EventModelApi<Sr2020Character>, data: { concentrations: Partial<Concentrations> }, _: Event) {
  for (const element in data.concentrations) {
    let level: ChemoLevel | undefined = undefined;
    if (api.workModel.chemo.concentration[element] >= api.workModel.chemo.crysisThreshold) {
      level = 'crysis';
    } else if (api.workModel.chemo.concentration[element] >= api.workModel.chemo.superEffectThreshold) {
      level = 'super';
    } else if (api.workModel.chemo.concentration[element] >= api.workModel.chemo.uberEffectThreshold) {
      level = 'uber';
    } else if (api.workModel.chemo.concentration[element] >= api.workModel.chemo.baseEffectThreshold) {
      level = 'base';
    }
    if (!level) continue;

    const effect = kAllChemoEffects.find((it) => it.level == level && it.element == element);
    if (!effect) continue;

    if (effect.instantEffect) {
      api.sendSelfEvent(effect.instantEffect.handler, { amount: effect.instantEffect.amount });
    }

    if (effect.durationEffect) {
      const modifierClass = `${element}-effect`;
      const mods = api.getModifiersByClass(modifierClass);
      for (const m of mods) api.removeModifier(m.mID);
      addTemporaryModifier(
        api,
        modifierFromEffect(effect.durationEffect.handler, { amount: effect.durationEffect.amount }, modifierClass),
        effect.durationEffect.duration,
      );
    }
  }
  // TODO(aeremin) Implement addictions
}

export function increaseConcentration(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.chemo.concentration[m.element] += m.amount;
}

export function reviveTo1Hp(api: EventModelApi<Sr2020Character>, _data: {}, _: Event) {
  if (api.model.healthState != 'wounded') return;
  healthStateTransition(api, 'healthy');
}
