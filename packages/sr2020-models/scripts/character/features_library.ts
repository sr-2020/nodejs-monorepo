import { Modifier } from '@sr2020/interface/models/alice-model-engine';
import { modifierFromEffect } from './util';
import {
  increaseMagic,
  increaseMagicFeedbackReduction,
  increaseMagicRecoverySpeed,
  increaseSpiritResistanceMultiplier,
} from './basic_effects';

interface PassiveAbility {
  id: string;
  name: string;
  description: string;
  prerequisites?: string[];
  modifier: Modifier | Modifier[];
}

// Not exported by design, use kAllFeatures instead.
const kAllPassiveAbilitiesList: PassiveAbility[] = [
  // Магия 1-5
  {
    id: 'magic-1',
    name: 'Магия 1',
    description: 'Подвластная тебе Мощь увеличивается',
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },
  {
    id: 'magic-2',
    name: 'Магия 2',
    description: 'Подвластная тебе Мощь увеличивается',
    prerequisites: ['magic-1'],
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },
  {
    id: 'magic-3',
    name: 'Магия 3',
    description: 'Подвластная тебе Мощь увеличивается',
    prerequisites: ['magic-2', 'spirit-enemy-1'],
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },
  {
    id: 'magic-4',
    name: 'Магия 4',
    description: 'Подвластная тебе Мощь увеличивается',
    prerequisites: ['magic-3', 'spirit-enemy-2'],
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },
  {
    id: 'magic-5',
    name: 'Магия 5',
    description: 'Подвластная тебе Мощь увеличивается',
    prerequisites: ['magic-4', 'spirit-enemy-3'],
    modifier: modifierFromEffect(increaseMagic, { amount: 1 }),
  },
  // Сопротивление откату 1-3
  {
    id: 'magic-feedback-resistance-1',
    name: 'Сопротивление Откату 1',
    description: 'Ты легче выносишь Откат',
    modifier: modifierFromEffect(increaseMagicFeedbackReduction, { amount: 1 }),
  },
  {
    id: 'magic-feedback-resistance-2',
    name: 'Сопротивление Откату 2',
    description: 'Ты легче выносишь Откат',
    prerequisites: ['magic-feedback-resistance-1'],
    modifier: modifierFromEffect(increaseMagicFeedbackReduction, { amount: 1 }),
  },
  {
    id: 'magic-feedback-resistance-3',
    name: 'Сопротивление Откату 3',
    description: 'Ты легче выносишь Откат',
    prerequisites: ['magic-feedback-resistance-2'],
    modifier: modifierFromEffect(increaseMagicFeedbackReduction, { amount: 1 }),
  },
  // Откатошный 1-3
  {
    id: 'magic-feedback-unresistance-1',
    name: 'Откатошный 1',
    description: 'Ты тяжелее выносишь Откат',
    modifier: modifierFromEffect(increaseMagicFeedbackReduction, { amount: -1 }),
  },
  {
    id: 'magic-feedback-unresistance-2',
    name: 'Откатошный 2',
    description: 'Ты тяжелее выносишь Откат',
    prerequisites: ['magic-feedback-unresistance-1'],
    modifier: modifierFromEffect(increaseMagicFeedbackReduction, { amount: -1 }),
  },
  {
    id: 'magic-feedback-unresistance-3',
    name: 'Откатошный 3',
    description: 'Ты тяжелее выносишь Откат',
    prerequisites: ['magic-feedback-unresistance-2'],
    modifier: modifierFromEffect(increaseMagicFeedbackReduction, { amount: -1 }),
  },
  // Воспрянь и пой 1-3
  {
    id: 'magic-recovery-1',
    name: 'Воспрянь и пой 1',
    description: 'Магия возвращается к тебе быстрее',
    modifier: modifierFromEffect(increaseMagicRecoverySpeed, { amount: 0.2 }),
  },
  {
    id: 'magic-recovery-2',
    name: 'Воспрянь и пой 2',
    description: 'Магия возвращается к тебе быстрее',
    prerequisites: ['magic-recovery-1'],
    modifier: modifierFromEffect(increaseMagicRecoverySpeed, { amount: 0.2 }),
  },
  {
    id: 'magic-recovery-3',
    name: 'Воспрянь и пой 3',
    description: 'Магия возвращается к тебе быстрее',
    prerequisites: ['magic-recovery-2'],
    modifier: modifierFromEffect(increaseMagicRecoverySpeed, { amount: 0.2 }),
  },
  // Дружелюбие духов 1-3
  {
    id: 'spirit-friend-1',
    name: 'Дружелюбие духов 1',
    description: 'Ты понимаешь настроения духов',
    modifier: modifierFromEffect(increaseSpiritResistanceMultiplier, { amount: -0.2 }),
  },
  {
    id: 'spirit-friend-2',
    name: 'Дружелюбие духов 2',
    description: 'Ты понимаешь настроения духов',
    prerequisites: ['spirit-friend-1', 'magic-feedback-unresistance-1'],
    modifier: modifierFromEffect(increaseSpiritResistanceMultiplier, { amount: -0.2 }),
  },
  {
    id: 'spirit-friend-3',
    name: 'Дружелюбие духов 3',
    description: 'Ты понимаешь настроения духов',
    prerequisites: ['spirit-friend-2'],
    modifier: modifierFromEffect(increaseSpiritResistanceMultiplier, { amount: -0.2 }),
  },
  // Духопротивный 1-3
  {
    id: 'spirit-enemy-1',
    name: 'Духопротивный 1',
    description: 'Инструменты, вот кто духи для тебя. Рабовладелец - вот кто ты для них',
    modifier: modifierFromEffect(increaseSpiritResistanceMultiplier, { amount: 0.2 }),
  },
  {
    id: 'spirit-enemy-2',
    name: 'Духопротивный 2',
    description: 'Инструменты, вот кто духи для тебя. Рабовладелец - вот кто ты для них',
    prerequisites: ['spirit-enemy-1'],
    modifier: modifierFromEffect(increaseSpiritResistanceMultiplier, { amount: 0.2 }),
  },
  {
    id: 'spirit-enemy-3',
    name: 'Духопротивный 3',
    description: 'Инструменты, вот кто духи для тебя. Рабовладелец - вот кто ты для них',
    prerequisites: ['spirit-enemy-2'],
    modifier: modifierFromEffect(increaseSpiritResistanceMultiplier, { amount: 0.2 }),
  },
];

export const kAllFeatures: Map<string, PassiveAbility> = (() => {
  const result = new Map<string, PassiveAbility>();
  kAllPassiveAbilitiesList.forEach((f) => {
    if (result.has(f.id)) throw new Error('Non-unique passive ability id: ' + f.id);
    result.set(f.id, f);
  });
  return result;
})();
