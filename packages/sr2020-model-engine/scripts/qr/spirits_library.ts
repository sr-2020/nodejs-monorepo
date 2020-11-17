export interface Spirit {
  id: string;
  name: string;
  abilityIds: string[];
}

export const kAllSpirits: Spirit[] = [
  {
    id: 'dummy-spirit',
    name: 'Дух-заглушка',
    abilityIds: ['magic-shield'],
  },
];

export const kCommonSpiritAbilityIds = ['dispirit'];

export const kSpiritAbilityIds = new Set(kCommonSpiritAbilityIds.concat(...kAllSpirits.map((drone) => drone.abilityIds)));
