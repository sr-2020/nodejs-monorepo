export interface Spirit {
  id: string;
  abilityIds: string[];
}

export const kAllSpirits: Spirit[] = [
  {
    id: 'spirit-type-1',
    abilityIds: ['grey-matter', 'totoro'],
  },
  {
    id: 'spirit-type-2',
    abilityIds: ['firestarter'],
  },
  {
    id: 'spirit-type-3',
    abilityIds: ['riotment'],
  },
];

export const kCommonSpiritAbilityIds = ['dispirit', 'spirit-danger'];

export const kSpiritAbilityIds = new Set(kCommonSpiritAbilityIds.concat(...kAllSpirits.map((spirit) => spirit.abilityIds)));
