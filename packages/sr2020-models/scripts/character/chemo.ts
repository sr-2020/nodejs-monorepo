import { EventModelApi, Event, UserVisibleError, EffectModelApi, Modifier } from '@sr2020/interface/models/alice-model-engine';
import { Sr2020Character, Concentrations } from '@sr2020/interface/models/sr2020-character.model';
import { kAllPills } from './chemo_library';
import { addTemporaryModifier, modifierFromEffect, validUntil, addHistoryRecord, sendNotificationAndHistoryRecord } from './util';
import { duration, Duration } from 'moment';
import {
  increaseMentalAttack,
  increaseCharisma,
  increaseIntelligence,
  increaseResonance,
  multiplyCooldownCoefficient,
  increaseMentalAttackAndProtection,
  increaseMaxMeatHp,
  increaseAllBaseStats,
} from './basic_effects';
import { healthStateTransition } from './death_and_rebirth';
import { MerchandiseQrData } from '@sr2020/sr2020-models/scripts/qr/datatypes';

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

export const kAllElements: Array<keyof Concentrations> = [
  'iodine',
  'teqgel',
  'argon',
  'radium',
  'junius',
  'custodium',
  'polonium',
  'silicon',
  'magnium',
  'chromium',
  'opium',
  'elba',
  'barium',
  'uranium',
  'moscovium',
  'iconium',
  'vampirium',
];

export const kAllChemoEffects: ChemoEffect[] = [
  // TODO(https://trello.com/c/npKNMNV9/323-вход-нахождение-и-выход-из-вр): Implement teqgel.
  {
    element: 'teqgel',
    level: 'base',
    message: 'TODO',
  },
  {
    element: 'teqgel',
    level: 'uber',
    message: 'TODO',
  },
  {
    element: 'teqgel',
    level: 'super',
    message: 'TODO',
  },
  {
    element: 'teqgel',
    level: 'crysis',
    message: 'TODO',
  },

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
    element: 'argon',
    level: 'base',
    message: 'У тебя увеличилась Харизма на 10 минут.',
    durationEffect: {
      handler: increaseCharisma,
      amount: 1,
      duration: duration(10, 'minutes'),
    },
  },
  {
    element: 'argon',
    level: 'uber',
    message: 'У тебя очень сильно увеличилась Харизма на 60 минут.',
    durationEffect: {
      handler: increaseCharisma,
      amount: 2,
      duration: duration(60, 'minutes'),
    },
  },
  {
    element: 'argon',
    level: 'super',
    message: 'У тебя увеличилась Харизма на 30 минут.',
    durationEffect: {
      handler: increaseCharisma,
      amount: 1,
      duration: duration(30, 'minutes'),
    },
  },
  {
    element: 'argon',
    level: 'crysis',
    message: 'У тебя увеличилась Харизма на 30 минут. Появилась зависимость.',
    durationEffect: {
      handler: increaseCharisma,
      amount: 1,
      duration: duration(30, 'minutes'),
    },
  },

  {
    element: 'radium',
    level: 'base',
    message: 'У тебя повысился Интеллект на 30 минут',
    durationEffect: {
      handler: increaseIntelligence,
      amount: 1,
      duration: duration(30, 'minutes'),
    },
  },
  {
    element: 'radium',
    level: 'uber',
    message: 'У тебя сильно повысился Интеллект на 60 минут',
    durationEffect: {
      handler: increaseIntelligence,
      amount: 3,
      duration: duration(60, 'minutes'),
    },
  },
  {
    element: 'radium',
    level: 'super',
    message: 'У тебя повысился Интеллект на 60 минут',
    durationEffect: {
      handler: increaseIntelligence,
      amount: 1,
      duration: duration(60, 'minutes'),
    },
  },
  {
    element: 'radium',
    level: 'crysis',
    message: 'У тебя повысился Интеллект на 60 минут, появилась зависимость',
    durationEffect: {
      handler: increaseIntelligence,
      amount: 1,
      duration: duration(60, 'minutes'),
    },
  },

  {
    element: 'junius',
    level: 'base',
    message: 'У тебя повысился Резонанс на 30 минут',
    durationEffect: {
      handler: increaseResonance,
      amount: 1,
      duration: duration(30, 'minutes'),
    },
  },
  {
    element: 'junius',
    level: 'uber',
    message: 'У тебя сильно повысился Резонанс на 60 минут',
    durationEffect: {
      handler: increaseResonance,
      amount: 3,
      duration: duration(60, 'minutes'),
    },
  },
  {
    element: 'junius',
    level: 'super',
    message: 'У тебя повысился Резонанс на 60 минут',
    durationEffect: {
      handler: increaseResonance,
      amount: 1,
      duration: duration(60, 'minutes'),
    },
  },
  {
    element: 'junius',
    level: 'crysis',
    message: 'У тебя повысился Резонанс на 60 минут, появилась зависимость',
    durationEffect: {
      handler: increaseResonance,
      amount: 1,
      duration: duration(60, 'minutes'),
    },
  },

  {
    element: 'custodium',
    level: 'base',
    message: 'Ускоряет восстановление Магии',
    instantEffect: {
      handler: reduceCurrentMagicFeedback,
      amount: 1,
    },
  },

  {
    element: 'custodium',
    level: 'uber',
    message: 'Ускоряет восстановление Магии',
    instantEffect: {
      handler: reduceCurrentMagicFeedback,
      amount: 3,
    },
  },

  {
    element: 'custodium',
    level: 'super',
    message: 'Ускоряет восстановление Магии',
    instantEffect: {
      handler: reduceCurrentMagicFeedback,
      amount: 2,
    },
  },

  {
    element: 'custodium',
    level: 'crysis',
    message: 'Ускоряет восстановление Магии',
    instantEffect: {
      handler: reduceCurrentMagicFeedback,
      amount: 2,
    },
  },

  {
    element: 'polonium',
    level: 'base',
    message: 'Ближайшие 5 минут тяжелое оружие бьет тебя по хитам (эффект лёгкой брони).',
    durationEffect: {
      handler: lightArmorEffect,
      duration: duration(5, 'minutes'),
      amount: 0,
    },
  },
  {
    element: 'polonium',
    level: 'uber',
    message:
      'На 30 минут ты Берсерк. Если у тебя сняли все хиты - издай дикий боевой крик и можешь продолжать сражаться. У тебя два хита. После их снятия нажми кнопку "тяжран"',
    durationEffect: {
      handler: berserkEffect,
      duration: duration(30, 'minutes'),
      amount: 0,
    },
  },
  {
    element: 'polonium',
    level: 'super',
    message: 'Ближайшие 30 минут тяжелое оружие бьет тебя по хитам (эффект лёгкой брони).',
    durationEffect: {
      handler: lightArmorEffect,
      duration: duration(30, 'minutes'),
      amount: 0,
    },
  },
  {
    element: 'polonium',
    level: 'crysis',
    message: 'Ближайшие 30 минут тяжелое оружие бьет тебя по хитам (эффект лёгкой брони). Появилась зависимость.',
    durationEffect: {
      handler: lightArmorEffect,
      duration: duration(30, 'minutes'),
      amount: 0,
    },
  },

  {
    element: 'silicon',
    level: 'base',
    message: 'В течение 30 минут снижает кулдаун каждой активации абилки на 20% ',
    durationEffect: {
      handler: multiplyCooldownCoefficient,
      duration: duration(30, 'minutes'),
      amount: 0.8,
    },
  },
  {
    element: 'silicon',
    level: 'uber',
    message: 'В течение 30 минут снижает кулдаун каждой активации абилки на 80%',
    durationEffect: {
      handler: multiplyCooldownCoefficient,
      duration: duration(30, 'minutes'),
      amount: 0.2,
    },
  },
  {
    element: 'silicon',
    level: 'super',
    message: 'В течение 30 минут снижает кулдаун каждой активации абилки на 40%',
    durationEffect: {
      handler: multiplyCooldownCoefficient,
      duration: duration(30, 'minutes'),
      amount: 0.6,
    },
  },
  {
    element: 'silicon',
    level: 'crysis',
    message: 'В течение 30 минут снижает кулдаун каждой активации абилки на 40% Появилась зависимость.',
    durationEffect: {
      handler: multiplyCooldownCoefficient,
      duration: duration(30, 'minutes'),
      amount: 0.6,
    },
  },

  {
    element: 'magnium',
    level: 'base',
    durationEffect: {
      handler: increaseMentalAttackAndProtection,
      amount: 8,
      duration: duration(30, 'minutes'),
    },
    message: 'Увеличивает силу воздействия: в течение 30 минут увеличивает на 8 единиц  ментальную атаку и ментальную защиту персонажа.',
  },
  {
    element: 'magnium',
    level: 'uber',
    durationEffect: {
      handler: increaseMentalAttackAndProtection,
      amount: 16,
      duration: duration(60, 'minutes'),
    },
    message: 'Увеличивает силу воздействия: в течение 60 минут увеличивает на 16 единиц ментальную атаку и ментальную защиту персонажа.',
  },
  {
    element: 'magnium',
    level: 'super',
    durationEffect: {
      handler: increaseMentalAttackAndProtection,
      amount: 8,
      duration: duration(60, 'minutes'),
    },
    message: 'Увеличивает силу воздействия: в течение 60 минут увеличивает на 8 единиц  ментальную атаку и ментальную защиту персонажа.',
  },
  {
    element: 'magnium',
    level: 'crysis',
    durationEffect: {
      handler: increaseMentalAttackAndProtection,
      amount: 8,
      duration: duration(60, 'minutes'),
    },
    message:
      'Увеличивает силу воздействия: в течение 60 минут увеличивает на 8 единиц  ментальную атаку и ментальную защиту персонажа Появилась зависимость.',
  },

  {
    element: 'chromium',
    level: 'base',
    message: 'Единоразово сокращает все активные кулдауны способностей ',
    instantEffect: {
      handler: reduceCooldowns,
      amount: 0.3,
    },
  },
  {
    element: 'chromium',
    level: 'uber',
    message: 'Единоразово очень сильно сокращает все активные кулдауны способностей',
    instantEffect: {
      handler: reduceCooldowns,
      amount: 0.7,
    },
  },
  {
    element: 'chromium',
    level: 'super',
    message: 'Единоразово сильно сокращает все активные кулдауны способностей.',
    instantEffect: {
      handler: reduceCooldowns,
      amount: 0.5,
    },
  },
  {
    element: 'chromium',
    level: 'crysis',
    message: 'Единоразово сильно сокращает все активные кулдауны способностей. Появилась зависимость.',
    instantEffect: {
      handler: reduceCooldowns,
      amount: 0.5,
    },
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

  {
    element: 'elba',
    level: 'base',
    message: 'Полностью снимает все эффекты от химии и обнуляет концентрацию других веществ в теле, минус 1 хит на полчаса.',
    instantEffect: {
      handler: cleanAllСhemo,
      amount: 0,
    },
  },
  {
    element: 'elba',
    level: 'uber',
    message: 'Снимает все зависимости (в том числе от самой себя)',
    instantEffect: {
      handler: cleanAddictions,
      amount: 1,
    },
  },
  {
    element: 'elba',
    level: 'super',
    message: 'Снимает зависимость (кроме себя самой)',
    instantEffect: {
      handler: cleanAddictions,
      amount: 0,
    },
  },
  {
    element: 'elba',
    level: 'crysis',
    message: 'Снимает зависимость (кроме себя самой), Появилась зависимость',
    instantEffect: {
      handler: cleanAddictions,
      amount: 0,
    },
  },

  {
    element: 'barium',
    level: 'base',
    message: 'Позволяет использовать автоматическое оружие без кибер-рук 15 минут.',
    durationEffect: {
      handler: automaticWeaponsEffect,
      duration: duration(15, 'minutes'),
      amount: 0,
    },
  },
  {
    element: 'barium',
    level: 'uber',
    message: 'Позволяет использовать автоматическое оружие без кибер-рук на 1 час',
    durationEffect: {
      handler: automaticWeaponsEffect,
      duration: duration(1, 'hour'),
      amount: 0,
    },
  },
  {
    element: 'barium',
    level: 'super',
    message: 'Позволяет использовать автоматическое оружие без кибер-рук на 30 минут',
    durationEffect: {
      handler: automaticWeaponsEffect,
      duration: duration(30, 'minutes'),
      amount: 0,
    },
  },
  {
    element: 'barium',
    level: 'crysis',
    message: 'Позволяет использовать автоматическое оружие без кибер-рук на 30 минут. Появилась зависимость.',
    durationEffect: {
      handler: automaticWeaponsEffect,
      duration: duration(30, 'minutes'),
      amount: 0,
    },
  },

  {
    element: 'uranium',
    level: 'base',
    message: 'Мгновенно восстанавливает все потерянные хиты, если персонаж не в тяжране.',
  },
  {
    element: 'uranium',
    level: 'uber',
    message: 'Вылечивает статус клиническая смерть.',
    instantEffect: {
      handler: uranusRecoverFromClinicalDeath,
      amount: 0,
    },
  },
  {
    element: 'uranium',
    level: 'super',
    message: 'Вылечивает статус тяжёлое ранение.',
    instantEffect: {
      handler: uranusRecoverFromWounded,
      amount: 0,
    },
  },
  {
    element: 'uranium',
    level: 'crysis',
    message: 'Персонаж переходит в статус абсолютная смерть.',
    instantEffect: {
      handler: uranusKill,
      amount: 0,
    },
  },

  {
    element: 'moscovium',
    level: 'base',
    message: 'Добавляет +1 максимальных хита на 30 минут',
    durationEffect: {
      handler: increaseMaxMeatHp,
      duration: duration(30, 'minutes'),
      amount: 1,
    },
  },
  {
    element: 'moscovium',
    level: 'uber',
    message: 'Добавляет +4 максимальных хита на 30 минут',
    durationEffect: {
      handler: increaseMaxMeatHp,
      duration: duration(30, 'minutes'),
      amount: 4,
    },
  },
  {
    element: 'moscovium',
    level: 'super',
    message: 'Добавляет +2 максимальных хита на 30 минут',
    durationEffect: {
      handler: increaseMaxMeatHp,
      duration: duration(30, 'minutes'),
      amount: 2,
    },
  },
  {
    element: 'moscovium',
    level: 'crysis',
    message: 'Добавляет +2 максимальных хита на 30 минут Появилась зависимость.',
    durationEffect: {
      handler: increaseMaxMeatHp,
      duration: duration(30, 'minutes'),
      amount: 2,
    },
  },

  {
    element: 'iconium',
    level: 'base',
    message: 'Персонаж может использовать тяжёлое оружие 15 минут',
    durationEffect: {
      handler: heavyWeaponsEffect,
      duration: duration(15, 'minutes'),
      amount: 0,
    },
  },
  {
    element: 'iconium',
    level: 'uber',
    message: 'Персонаж может использовать тяжёлое оружие 1 час',
    durationEffect: {
      handler: heavyWeaponsEffect,
      duration: duration(1, 'hour'),
      amount: 0,
    },
  },
  {
    element: 'iconium',
    level: 'super',
    message: 'Персонаж может использовать тяжёлое оружие 30 минут',
    durationEffect: {
      handler: heavyWeaponsEffect,
      duration: duration(30, 'minutes'),
      amount: 0,
    },
  },
  {
    element: 'iconium',
    level: 'crysis',
    message: 'Персонаж может использовать тяжёлое оружие 30 минут, Появилась зависимость',
    durationEffect: {
      handler: heavyWeaponsEffect,
      duration: duration(30, 'minutes'),
      amount: 0,
    },
  },

  {
    element: 'vampirium',
    level: 'base',
    message: 'Персонаж 10 минут пребывает в эйфории. Появилась зависимость.',
    durationEffect: {
      handler: vampiriumEffect,
      duration: duration(10, 'minutes'),
      amount: 0,
    },
  },
  {
    element: 'vampirium',
    level: 'uber',
    message: 'Персонаж 10 минут пребывает в эйфории. Появилась зависимость.',
    durationEffect: {
      handler: vampiriumEffect,
      duration: duration(10, 'minutes'),
      amount: 0,
    },
  },
  {
    element: 'vampirium',
    level: 'super',
    message: 'Персонаж 10 минут пребывает в эйфории. Появилась зависимость.',
    durationEffect: {
      handler: vampiriumEffect,
      duration: duration(10, 'minutes'),
      amount: 0,
    },
  },
  {
    element: 'vampirium',
    level: 'crysis',
    message: 'Персонаж 10 минут пребывает в эйфории. Появилась зависимость.',
    durationEffect: {
      handler: vampiriumEffect,
      duration: duration(10, 'minutes'),
      amount: 0,
    },
  },
];

export function consumeChemo(api: EventModelApi<Sr2020Character>, data: MerchandiseQrData, _: Event) {
  if (api.workModel.currentBody != 'physical') {
    throw new UserVisibleError('Только мясное тело может принимать препараты!');
  }

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
  api.sendPubSubNotification('pill_consumption', { characterId: api.model.modelId, id: data.id, lifestyle: data.lifestyle });
}

export function checkConcentrations(api: EventModelApi<Sr2020Character>, data: { concentrations: Partial<Concentrations> }, _: Event) {
  let effectsCount = 0;
  let effectMessage = '';
  for (const element of kAllElements) {
    if (!data.concentrations[element]) continue;
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

    resetAddiction(api, element);
    if (level == 'crysis') {
      addAddiction(api, element);
    }

    effectsCount += 1;
    addHistoryRecord(api, 'Химия', effect.message, effect.message);
    effectMessage = effect.message;

    if (effect.instantEffect) {
      api.sendSelfEvent(effect.instantEffect.handler, { amount: effect.instantEffect.amount });
    }

    if (effect.durationEffect) {
      const modifierClass = `${element}-effect`;
      const mods = api.getModifiersByClass(modifierClass);
      for (const m of mods) api.removeModifier(m.mID);
      addTemporaryModifier(
        api,
        modifierFromEffect(
          effect.durationEffect.handler,
          {
            amount: effect.durationEffect.amount,
            durationSeconds: effect.durationEffect.duration.asSeconds(),
          },
          modifierClass,
        ),
        effect.durationEffect.duration,
      );
    }
  }

  if (effectsCount > 0) {
    if (effectsCount == 1) {
      api.sendNotification('Химия', effectMessage);
    } else {
      api.sendNotification('Химия', `Вы чувствуете ${effectsCount} эффекта от химии. Подробности по каждому смотрите на экране истории.`);
    }
  }
}

export function increaseConcentration(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.chemo.concentration[m.element] += m.amount;
}

export function reviveTo1Hp(api: EventModelApi<Sr2020Character>, _data: {}, _: Event) {
  if (api.model.healthState != 'wounded') return;
  healthStateTransition(api, 'healthy');
}

export function reduceCurrentMagicFeedback(api: EventModelApi<Sr2020Character>, data: { amount: number }, _: Event) {
  for (const timerId in api.model.timers ?? {}) {
    const timer = api.model.timers![timerId];
    if (timer.name.startsWith('feedback-recovery-')) {
      timer.miliseconds = Math.max(
        duration(30, 'seconds').asMilliseconds(),
        timer.miliseconds - duration(data.amount, 'minutes').asMilliseconds(),
      );
    }
  }
}

export function lightArmorEffect(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.passiveAbilities.push({
    name: 'Легкая броня',
    description: 'Тяжелое оружие бьет тебя по хитам (эффект лёгкой брони).',
    id: 'light-armor-chemo',
    validUntil: validUntil(api, duration(m.durationSeconds, 'seconds')),
  });
}

export function berserkEffect(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.passiveAbilities.push({
    name: 'Берсерк',
    description:
      'Если у тебя сняли все хиты - издай дикий боевой крик и можешь продолжать сражаться. У тебя два хита. После их снятия нажми кнопку "тяжран".',
    id: 'berserk-chemo',
    validUntil: validUntil(api, duration(m.durationSeconds, 'seconds')),
  });
}

export function automaticWeaponsEffect(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.passiveAbilities.push({
    name: 'Автоматическое оружие',
    description: 'Позволяет использовать автоматическое оружие (даже без кибер-рук).',
    id: 'automatic-weapons-chemo',
    validUntil: validUntil(api, duration(m.durationSeconds, 'seconds')),
  });
}

export function heavyWeaponsEffect(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.passiveAbilities.push({
    name: 'Тяжелое оружие',
    description: 'Позволяет использовать тяжелое оружие.',
    id: 'heavy-weapons-chemo',
    validUntil: validUntil(api, duration(m.durationSeconds, 'seconds')),
  });
}

export function vampiriumEffect(api: EffectModelApi<Sr2020Character>, m: Modifier) {
  api.model.passiveAbilities.push({
    name: 'Эйфория',
    description: 'Вы пребываете в состоянии странной эйфории',
    id: 'vampirium-bite-chemo',
    validUntil: validUntil(api, duration(m.durationSeconds, 'seconds')),
  });
}

export function reduceCooldowns(api: EventModelApi<Sr2020Character>, data: { amount: number }, _: Event) {
  for (const ability of api.model.activeAbilities) {
    ability.cooldownUntil -= duration(ability.cooldownMinutes, 'minutes').asMilliseconds() * data.amount;
  }
}

export function cleanAllСhemo(api: EventModelApi<Sr2020Character>, data: { amount: number }, _: Event) {
  for (const element of kAllElements.filter((it) => it != 'elba')) {
    const mods = [...api.getModifiersByClass(`${element}-effect`), ...api.getModifiersByClass(`${element}-concentration`)];
    for (const m of mods) api.removeModifier(m.mID);
  }
}

export function cleanAddictions(api: EventModelApi<Sr2020Character>, data: { amount: number }, _: Event) {
  const addictionsToCure = kAllElements.filter((element) => element != 'elba' || data.amount == 1);
  for (const element of addictionsToCure) {
    removeAddiction(api, element);
  }
}

export function uranusRecoverFromClinicalDeath(api: EventModelApi<Sr2020Character>, _data: {}, _: Event) {
  if (api.workModel.healthState != 'biologically_dead') {
    healthStateTransition(api, 'healthy');
  }
}

export function uranusRecoverFromWounded(api: EventModelApi<Sr2020Character>, _data: {}, _: Event) {
  if (api.workModel.healthState == 'wounded') {
    healthStateTransition(api, 'healthy');
  }
}

export function uranusKill(api: EventModelApi<Sr2020Character>, _data: {}, _: Event) {
  healthStateTransition(api, 'biologically_dead');
}

interface Addiction extends Modifier {
  stage: number;
  amount: -1;
}

function createAddiction(element: keyof Concentrations): Addiction {
  return {
    mID: `${element}-addiction`,
    class: `${element}-addiction`,
    enabled: true,
    stage: 0,
    effects: [
      { enabled: false, handler: increaseAllBaseStats.name, type: 'normal' },
      { enabled: false, handler: increaseMaxMeatHp.name, type: 'normal' },
    ],
    amount: -1,
  };
}

function addictionTimerName(element: keyof Concentrations) {
  return `${element}-addiction-timer`;
}

function hasAddiction(api, element: keyof Concentrations): boolean {
  return api.getModifierById(`${element}-addiction`);
}

function addAddiction(api: EventModelApi<Sr2020Character>, element: keyof Concentrations) {
  if (!hasAddiction(api, element)) {
    api.addModifier(createAddiction(element));
    api.setTimer(addictionTimerName(element), duration(1, 'hour'), advanceAddiction, { element });
  }
}

function removeAddiction(api: EventModelApi<Sr2020Character>, element: keyof Concentrations) {
  api.removeModifier(`${element}-addiction`);
  api.removeTimer(addictionTimerName(element));
}

export function resetAllAddictions(api: EventModelApi<Sr2020Character>) {
  for (const element of kAllElements) resetAddiction(api, element);
}

function resetAddiction(api: EventModelApi<Sr2020Character>, element: keyof Concentrations) {
  if (hasAddiction(api, element)) {
    removeAddiction(api, element);
    addAddiction(api, element);
  }
}

export function advanceAddiction(api: EventModelApi<Sr2020Character>, data: { element: keyof Concentrations }, _: Event) {
  const m = api.getModifierById(`${data.element}-addiction`);
  if (!m) return;
  const addiction = m as Addiction;
  addiction.stage += 1;
  if (addiction.stage == 1) {
    sendNotificationAndHistoryRecord(
      api,
      'Зависимость',
      'Тебя крючит, хочется дозу. Садись (при возможности ложись), и пять минут активно ненавидь всех окружающих. Говори им гадости, страдай.',
    );
    api.setTimer(addictionTimerName(data.element), duration(1, 'hour'), advanceAddiction, data);
  } else if (addiction.stage == 2) {
    sendNotificationAndHistoryRecord(api, 'Зависимость', 'Базовые параметры персонажа уменьшились.');
    addiction.effects[0].enabled = true;
    api.setTimer(addictionTimerName(data.element), duration(2, 'hour'), advanceAddiction, data);
  } else if (addiction.stage == 3) {
    sendNotificationAndHistoryRecord(api, 'Зависимость', 'Максимальные хиты уменьшились.');
    addiction.effects[1].enabled = true;
    api.setTimer(addictionTimerName(data.element), duration(4, 'hour'), advanceAddiction, data);
  } else if (addiction.stage == 4) {
    if (api.workModel.healthState != 'biologically_dead') {
      healthStateTransition(api, 'clinically_dead');
    }
  } else {
    api.error(`Incorrect addiction stage: ${addiction.stage}`);
  }
}
