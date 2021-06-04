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

export const kEmptyContent: ReagentContent = {
  virgo: 0,
  taurus: 0,
  aries: 0,
  cancer: 0,
  gemini: 0,
  capricorn: 0,
  ophiuchus: 0,
  pisces: 0,
  sagittarius: 0,
  leo: 0,
  libra: 0,
  aquarius: 0,
  scorpio: 0,
};

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
  {
    id: 'fish-n-fish',
    name: 'Фиш-н-фиш',
    content: { pisces: 3 },
  },
  {
    id: 'oyboy',
    name: 'Ойбой',
    content: { sagittarius: 3 },
  },
  {
    id: 'lion2lion',
    name: 'Львиный лев',
    content: { leo: 3 },
  },
  {
    id: 'overweight',
    name: 'Перевес',
    content: { libra: 3 },
  },
  {
    id: 'teardrop',
    name: 'Капли дождя',
    content: { aquarius: 3 },
  },
  {
    id: 'stingday',
    name: 'Жало дней',
    content: { scorpio: 3 },
  },
  {
    id: 'elliell',
    name: 'Эльлилиэль',
    content: { virgo: 2 },
  },
  {
    id: 'bulls-by-bulls',
    name: 'Бык-о-бык',
    content: { taurus: 2 },
  },
  {
    id: 'bridge-tour',
    name: 'Встреча на мосту',
    content: { aries: 2 },
  },
  {
    id: 'cc-axe',
    name: 'Двурачный топор',
    content: { cancer: 2 },
  },
  {
    id: 'ivan-da-maria',
    name: 'Иван-да-Марья',
    content: { gemini: 2 },
  },
  {
    id: 'crimson-ing',
    name: 'Кровавый подбой',
    content: { capricorn: 2 },
  },
  {
    id: 'aquarium',
    name: 'Аквариум',
    content: { pisces: 8 },
  },
  {
    id: 'young-and-bright',
    name: 'Молодой да резвый',
    content: { sagittarius: 8 },
  },
  {
    id: 'lay-pride',
    name: 'Прайд',
    content: { leo: 8 },
  },
  {
    id: 'apothecarius',
    name: 'Мерная палата',
    content: { libra: 8 },
  },
  {
    id: 'super-mario',
    name: 'Супер Марио',
    content: { aquarius: 8 },
  },
  {
    id: 'scorping',
    name: 'Скорпинг',
    content: { scorpio: 8 },
  },
  {
    id: 'elvanovo',
    name: 'Эльфанова',
    content: { virgo: 5 },
  },
  {
    id: 'bychat',
    name: 'Бычат',
    content: { taurus: 5 },
  },
  {
    id: 'barash-shur',
    name: 'Бараш Шур',
    content: { aries: 5 },
  },
  {
    id: 'fast-enough',
    name: 'Достаточная скорость',
    content: { cancer: 5 },
  },
  {
    id: 'what-is-the-way',
    name: 'Армия клонов',
    content: { gemini: 5 },
  },
  {
    id: 'fantabeasts',
    name: 'Фантастические твари',
    content: { capricorn: 5 },
  },
  {
    id: 'mama-ama-mag',
    name: 'Мама мыла раму',
    content: { virgo: 3, taurus: 3, aries: 3, cancer: 3, gemini: 3, capricorn: 3, pisces: 3, sagittarius: 3, leo: 3, libra: 3, aquarius: 3, scorpio: 3 },
  },
  {
    id: 'react-at-all',
    name: 'Реагируй полностью',
    content: { virgo: 20, taurus: 20, aries: 20, cancer: 20, gemini: 20, capricorn: 20, pisces: 20, sagittarius: 20, leo: 20, libra: 20, aquarius: 20, scorpio: 20 },
  },
];
