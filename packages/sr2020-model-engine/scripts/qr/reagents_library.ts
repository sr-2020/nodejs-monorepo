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
  { id: 'sample_4599', name: 'образец №4599', content: { virgo: 3, pisces: 3 }, },
  { id: 'sample_7804', name: 'образец №7804', content: { taurus: 3, pisces: 3 }, },
  { id: 'sample_3636', name: 'образец №3636', content: { aries: 3, pisces: 3 }, },
  { id: 'sample_7833', name: 'образец №7833', content: { cancer: 3, pisces: 3 }, },
  { id: 'sample_6739', name: 'образец №6739', content: { gemini: 3, pisces: 3 }, },
  { id: 'sample_8894', name: 'образец №8894', content: { capricorn: 3, pisces: 3 }, },
  { id: 'sample_1802', name: 'образец №1802', content: { virgo: 3, sagittarius: 3 }, },
  { id: 'sample_3259', name: 'образец №3259', content: { taurus: 3, sagittarius: 3 }, },
  { id: 'sample_1555', name: 'образец №1555', content: { aries: 3, sagittarius: 3 }, },
  { id: 'sample_2797', name: 'образец №2797', content: { cancer: 3, sagittarius: 3 }, },
  { id: 'sample_3876', name: 'образец №3876', content: { gemini: 3, sagittarius: 3 }, },
  { id: 'sample_2416', name: 'образец №2416', content: { capricorn: 3, sagittarius: 3 }, },
  { id: 'sample_5004', name: 'образец №5004', content: { virgo: 3, leo: 3 }, },
  { id: 'sample_2510', name: 'образец №2510', content: { taurus: 3, leo: 3 }, },
  { id: 'sample_5018', name: 'образец №5018', content: { aries: 3, leo: 3 }, },
  { id: 'sample_9950', name: 'образец №9950', content: { cancer: 3, leo: 3 }, },
  { id: 'sample_6076', name: 'образец №6076', content: { gemini: 3, leo: 3 }, },
  { id: 'sample_3756', name: 'образец №3756', content: { capricorn: 3, leo: 3 }, },
  { id: 'sample_8815', name: 'образец №8815', content: { virgo: 3, libra: 3 }, },
  { id: 'sample_3541', name: 'образец №3541', content: { taurus: 3, libra: 3 }, },
  { id: 'sample_9873', name: 'образец №9873', content: { aries: 3, libra: 3 }, },
  { id: 'sample_9716', name: 'образец №9716', content: { cancer: 3, libra: 3 }, },
  { id: 'sample_1242', name: 'образец №1242', content: { gemini: 3, libra: 3 }, },
  { id: 'sample_1282', name: 'образец №1282', content: { capricorn: 3, libra: 3 }, },
  { id: 'sample_9940', name: 'образец №9940', content: { virgo: 3, aquarius: 3 }, },
  { id: 'sample_2569', name: 'образец №2569', content: { taurus: 3, aquarius: 3 }, },
  { id: 'sample_4503', name: 'образец №4503', content: { aries: 3, aquarius: 3 }, },
  { id: 'sample_6062', name: 'образец №6062', content: { cancer: 3, aquarius: 3 }, },
  { id: 'sample_2236', name: 'образец №2236', content: { gemini: 3, aquarius: 3 }, },
  { id: 'sample_6438', name: 'образец №6438', content: { capricorn: 3, aquarius: 3 }, },
  { id: 'sample_2688', name: 'образец №2688', content: { virgo: 3, scorpio: 3 }, },
  { id: 'sample_8427', name: 'образец №8427', content: { taurus: 3, scorpio: 3 }, },
  { id: 'sample_9432', name: 'образец №9432', content: { aries: 3, scorpio: 3 }, },
  { id: 'sample_9264', name: 'образец №9264', content: { cancer: 3, scorpio: 3 }, },
  { id: 'sample_4556', name: 'образец №4556', content: { gemini: 3, scorpio: 3 }, },
  { id: 'sample_6658', name: 'образец №6658', content: { capricorn: 3, scorpio: 3 }, },
  { id: 'sample_2956', name: 'образец №2956', content: { virgo: 10, pisces: 10 }, },
  { id: 'sample_8902', name: 'образец №8902', content: { taurus: 10, pisces: 10 }, },
  { id: 'sample_7695', name: 'образец №7695', content: { aries: 10, pisces: 10 }, },
  { id: 'sample_7142', name: 'образец №7142', content: { cancer: 10, pisces: 10 }, },
  { id: 'sample_6766', name: 'образец №6766', content: { gemini: 10, pisces: 10 }, },
  { id: 'sample_2747', name: 'образец №2747', content: { capricorn: 10, pisces: 10 }, },
  { id: 'sample_5843', name: 'образец №5843', content: { virgo: 10, sagittarius: 10 }, },
  { id: 'sample_6974', name: 'образец №6974', content: { taurus: 10, sagittarius: 10 }, },
  { id: 'sample_7249', name: 'образец №7249', content: { aries: 10, sagittarius: 10 }, },
  { id: 'sample_3027', name: 'образец №3027', content: { cancer: 10, sagittarius: 10 }, },
  { id: 'sample_3112', name: 'образец №3112', content: { gemini: 10, sagittarius: 10 }, },
  { id: 'sample_7489', name: 'образец №7489', content: { capricorn: 10, sagittarius: 10 }, },
  { id: 'sample_9650', name: 'образец №9650', content: { virgo: 10, leo: 10 }, },
  { id: 'sample_8451', name: 'образец №8451', content: { taurus: 10, leo: 10 }, },
  { id: 'sample_6041', name: 'образец №6041', content: { aries: 10, leo: 10 }, },
  { id: 'sample_8092', name: 'образец №8092', content: { cancer: 10, leo: 10 }, },
  { id: 'sample_1821', name: 'образец №1821', content: { gemini: 10, leo: 10 }, },
  { id: 'sample_7348', name: 'образец №7348', content: { capricorn: 10, leo: 10 }, },
  { id: 'sample_4964', name: 'образец №4964', content: { virgo: 10, libra: 10 }, },
  { id: 'sample_5889', name: 'образец №5889', content: { taurus: 10, libra: 10 }, },
  { id: 'sample_6152', name: 'образец №6152', content: { aries: 10, libra: 10 }, },
  { id: 'sample_4092', name: 'образец №4092', content: { cancer: 10, libra: 10 }, },
  { id: 'sample_9508', name: 'образец №9508', content: { gemini: 10, libra: 10 }, },
  { id: 'sample_6428', name: 'образец №6428', content: { capricorn: 10, libra: 10 }, },
  { id: 'sample_6572', name: 'образец №6572', content: { virgo: 10, aquarius: 10 }, },
  { id: 'sample_4070', name: 'образец №4070', content: { taurus: 10, aquarius: 10 }, },
  { id: 'sample_1739', name: 'образец №1739', content: { aries: 10, aquarius: 10 }, },
  { id: 'sample_2129', name: 'образец №2129', content: { cancer: 10, aquarius: 10 }, },
  { id: 'sample_5399', name: 'образец №5399', content: { gemini: 10, aquarius: 10 }, },
  { id: 'sample_7181', name: 'образец №7181', content: { capricorn: 10, aquarius: 10 }, },
  { id: 'sample_1400', name: 'образец №1400', content: { virgo: 10, scorpio: 10 }, },
  { id: 'sample_7815', name: 'образец №7815', content: { taurus: 10, scorpio: 10 }, },
  { id: 'sample_7289', name: 'образец №7289', content: { aries: 10, scorpio: 10 }, },
  { id: 'sample_9056', name: 'образец №9056', content: { cancer: 10, scorpio: 10 }, },
  { id: 'sample_7206', name: 'образец №7206', content: { gemini: 10, scorpio: 10 }, },
  { id: 'sample_2786', name: 'образец №2786', content: { capricorn: 10, scorpio: 10 }, },
];
