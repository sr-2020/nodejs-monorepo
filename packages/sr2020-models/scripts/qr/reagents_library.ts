export interface ReagentContent {
  virgo: number;
  taurus: number;
  aries: number;
  cancer: number;
  gemini: number;
  capricorn: number;
  ophiuchus: number;
  pisces: number;
  sagittarius: number;
  leo: number;
  libra: number;
  aquarius: number;
  scorpio: number;
}

export interface Reagent {
  id: string;
  name: string;
  content: Partial<ReagentContent>;
}

export const kAllReagents: Reagent[] = [
  {
    id: 'virgo',
    name: 'Дева',
    content: { virgo: 1 },
  },
  {
    id: 'taurus',
    name: 'Телец',
    content: { taurus: 1 },
  },
  {
    id: 'aries',
    name: 'Овен',
    content: { aries: 1 },
  },
  {
    id: 'cancer',
    name: 'Рак',
    content: { cancer: 1 },
  },
  {
    id: 'gemini',
    name: 'Близнецы',
    content: { gemini: 1 },
  },
  {
    id: 'capricorn',
    name: 'Козерог',
    content: { capricorn: 1 },
  },
  {
    id: 'ophiuchus',
    name: 'Змееносец',
    content: { ophiuchus: 1 },
  },
  {
    id: 'pisces',
    name: 'Рыбы',
    content: { pisces: 1 },
  },
  {
    id: 'sagittarius',
    name: 'Стрелец',
    content: { sagittarius: 1 },
  },
  {
    id: 'leo',
    name: 'Лев',
    content: { leo: 1 },
  },
  {
    id: 'libra',
    name: 'Весы',
    content: { libra: 1 },
  },
  {
    id: 'aquarius',
    name: 'Водолей',
    content: { aquarius: 1 },
  },
  {
    id: 'scorpio',
    name: 'Скорпион',
    content: { scorpio: 1 },
  },

  {
    id: 'moon-dust',
    name: 'Лунная пыль',
    content: { aquarius: 1, libra: 1, scorpio: 1 },
  },
  {
    id: 'north-moss',
    name: 'Северный мох',
    content: { pisces: 2, cancer: 2 },
  },
  {
    id: 'skalozub',
    name: 'Скалозуб',
    content: { sagittarius: 2, virgo: 2 },
  },
  {
    id: 'blue-puppy',
    name: 'Голубой щенок',
    content: { leo: 1, virgo: 1 },
  },
  {
    id: 'red-leo',
    name: 'Красный лев',
    content: { leo: 3, aries: 1 },
  },
  {
    id: 'double-summit',
    name: 'Двойной пик',
    content: { libra: 2 },
  },
  {
    id: 'dutch-rudder',
    name: 'Голландский штурвал',
    content: { aquarius: 5 },
  },
];
