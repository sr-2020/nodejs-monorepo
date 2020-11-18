export interface Spirit {
  id: string;
  abilityIds: string[];
}

export const kAllSpirits: Spirit[] = [
  {
    id: 'spirity-type-1',
    abilityIds: ['grey-matter', 'totoro'],
  },
  {
    id: 'spirity-type-2',
    abilityIds: ['firestarter'],
  },
  {
    id: 'spirity-type-3',
    abilityIds: ['riotment'],
  },
];

export const kCommonSpiritAbilityIds = ['dispirit', 'spirit-danger'];

export const kSpiritAbilityIds = new Set(kCommonSpiritAbilityIds.concat(...kAllSpirits.map((drone) => drone.abilityIds)));
