import { oneTimeRevive } from './abilities';

export interface ActiveAbility {
  id: string;
  humanReadableName: string;
  description: string;
  hasTarget: boolean;
  prerequisites?: string[];
  eventType: string;
}

// Not exported by design, use kAllActiveAbilities instead.
export const kAllActiveAbilitiesList: ActiveAbility[] = [
  {
    id: 'ground-heal-ability',
    humanReadableName: 'Ground Heal',
    description: 'Поднимает одну цель из КС/тяжрана в полные хиты.',
    hasTarget: true,
    eventType: oneTimeRevive.name,
  },
];

export const kAllActiveAbilities: Map<string, ActiveAbility> = (() => {
  const result = new Map<string, ActiveAbility>();
  kAllActiveAbilitiesList.forEach((f) => {
    if (result.has(f.id)) throw new Error('Non-unique active ability id: ' + f.id);
    result.set(f.id, f);
  });
  return result;
})();
