export type DroneType = 'groundcraft' | 'aircraft' | 'medicart' | 'autodoc';

export interface Drone {
  id: string;
  name: string;
  description: string;
  type: DroneType;
  modSlots: number;
  moddingCapacity: number;
  sensor: number;
  hitpoints: number;
  abilityIds: string[];
}

export const kAllDrones: Drone[] = [
  {
    id: 'belarus',
    name: 'Беларусь',
    type: 'groundcraft',
    modSlots: 0,
    moddingCapacity: 0,
    sensor: 4,
    hitpoints: 2,
    description: 'Дроны модели Беларусь появились давно, они просты в управлении, не очень надежны (2 хита), но могут служить Щитом, на них установлена Тяжелая броня.',
    abilityIds: ['drone-dozer', 'drone-heavy'],
  },
  {
    id: 'trici',
    name: 'Трици',
    type: 'groundcraft',
    modSlots: 1,
    moddingCapacity: 1,
    sensor: 5,
    hitpoints: 3,
    description: 'Дроны модели Трици логичное продолжение модельного ряда дронов Беларусь, в них решили проблему надёжности (3 хита), но они стали чуть капризнее в управлении, могут служить надёжным Щитом, на них установлена Тяжелая броня.',
    abilityIds: ['drone-dozer', 'drone-heavy'],
  },
  {
    id: 'heemeyer',
    name: 'Химейер',
    type: 'groundcraft',
    modSlots: 1,
    moddingCapacity: 2,
    sensor: 8,
    hitpoints: 5,
    description: 'Химейер передовая модель дронов, не каждый Риггер сможет им управлять, надежность дрона на высоте (5 хитов), они служат мощным Щитом, с Тяжелой бронёй.',
    abilityIds: ['drone-dozer', 'drone-heavy'],
  },
  {
    id: 'grom',
    name: 'Гром',
    type: 'groundcraft',
    modSlots: 0,
    moddingCapacity: 0,
    sensor: 7,
    hitpoints: 2,
    description: 'Пушка. 2 хита',
    abilityIds: ['drone-turret'],
  },
  {
    id: 'cat',
    name: 'Кэт',
    type: 'groundcraft',
    modSlots: 1,
    moddingCapacity: 1,
    sensor: 8,
    hitpoints: 3,
    description: 'Пушка. 3 хита',
    abilityIds: ['drone-turret'],
  },
  {
    id: 'bfg',
    name: 'БФГ',
    type: 'groundcraft',
    modSlots: 1,
    moddingCapacity: 2,
    sensor: 11,
    hitpoints: 4,
    description: 'Пушка. 4 хита',
    abilityIds: ['drone-turret'],
  },
  {
    id: 'dzerginsk',
    name: 'Дзержинский',
    type: 'groundcraft',
    modSlots: 0,
    moddingCapacity: 0,
    sensor: 7,
    hitpoints: 3,
    description: 'Всем стоять! Работает полиция! Легкий дрон, который может применить Паралич движения в случае необходимости.',
    abilityIds: ['drone-paralysis-1'],
  },
  {
    id: 'trockiy',
    name: 'Троцкий',
    type: 'groundcraft',
    modSlots: 0,
    moddingCapacity: 0,
    sensor: 10,
    hitpoints: 3,
    description: 'Всем стоять! Работает полиция! Тяжелый дрон, который может применить два Паралича движения в случае необходимости.',
    abilityIds: ['drone-paralysis-1', 'drone-paralysis-2', 'drone-heavy'],
  },
  {
    id: 'beriya',
    name: 'Берия',
    type: 'groundcraft',
    modSlots: 0,
    moddingCapacity: 0,
    sensor: 14,
    hitpoints: 4,
    description: 'Всем стоять! Работает Робокоп! Тяжелый дрон с пулемётом, который может применить три Паралича движения в случае необходимости. Обладает повышенной надёжностью (4 хита).',
    abilityIds: ['drone-paralysis-1', 'drone-paralysis-2', 'drone-paralysis-3', 'drone-heavy', 'drone-ekzo'],
  },
  {
    id: 'drednaught',
    name: 'Дредноут',
    type: 'groundcraft',
    modSlots: 1,
    moddingCapacity: 1,
    sensor: 10,
    hitpoints: 3,
    description: 'Пулемет. Тяжелая броня. 3 хита',
    abilityIds: ['drone-heavy', 'drone-ekzo'],
  },
  {
    id: 'marchal',
    name: 'Маршал',
    type: 'groundcraft',
    modSlots: 1,
    moddingCapacity: 2,
    sensor: 12,
    hitpoints: 4,
    description: 'Пулемет. Тяжелая броня. 4 хита',
    abilityIds: ['drone-heavy', 'drone-ekzo'],
  },
  {
    id: 'kosmos',
    name: 'Космос',
    type: 'groundcraft',
    modSlots: 1,
    moddingCapacity: 2,
    sensor: 14,
    hitpoints: 4,
    description: 'Пулемет. Тяжелая броня. 4 хита. Может лечить на поле боя!',
    abilityIds: ['drone-heavy', 'drone-ekzo', 'medcart-light-heal-1', 'medcart-light-heal-2', 'medcart-heavy-heal-1'],
  },
  {
    id: 'pecheneg',
    name: 'Печенег',
    type: 'groundcraft',
    modSlots: 2,
    moddingCapacity: 3,
    sensor: 14,
    hitpoints: 5,
    description: 'Пулемет. Тяжелая броня. 5 хитов',
    abilityIds: ['drone-heavy', 'drone-ekzo'],
  },
  {
    id: 'beetle',
    name: 'Жук',
    type: 'aircraft',
    modSlots: 0,
    moddingCapacity: 0,
    sensor: 2,
    hitpoints: 1,
    description: 'Видеокамера. Нет брони. Иммунитет ко всему холодному оружию и легкому огнестрельному.',
    abilityIds: ['drone-copter'],
  },
  {
    id: 'wasp',
    name: 'Оса',
    type: 'aircraft',
    modSlots: 1,
    moddingCapacity: 1,
    sensor: 5,
    hitpoints: 1,
    description: 'Видеокамера. Нет брони. Иммунитет ко всему холодному оружию и легкому огнестрельному.',
    abilityIds: ['drone-copter'],
  },
  {
    id: 'huxley',
    name: 'Хаксли',
    type: 'aircraft',
    modSlots: 0,
    moddingCapacity: 0,
    sensor: 8,
    hitpoints: 1,
    description: 'Проектор голограмм. Нет брони. Иммунитет ко всему холодному оружию и легкому огнестрельному.',
    abilityIds: ['drone-project'],
  },
  {
    id: 'scorge',
    name: 'Скордж',
    type: 'aircraft',
    modSlots: 0,
    moddingCapacity: 0,
    sensor: 8,
    hitpoints: 1,
    description: 'Бадабум!  Иммунитет ко всему холодному оружию и легкому огнестрельному. Массовое поражение вокруг!',
    abilityIds: ['drone-kabuum'],
  },
  {
    id: 'wise-eagle-owl',
    name: 'Мудрый филин',
    type: 'aircraft',
    modSlots: 1,
    moddingCapacity: 1,
    sensor: 11,
    hitpoints: 2,
    description: 'Может перевозить 3 персонажей. Иммунитет ко всему холодному оружию и легкому огнестрельному. Тяжелая броня. 2 хита',
    abilityIds: ['drone-heli', 'drone-heavy'],
  },
  {
    id: 'falcon',
    name: 'Ясный сокол',
    type: 'aircraft',
    modSlots: 1,
    moddingCapacity: 2,
    sensor: 12,
    hitpoints: 4,
    description: 'Может перевозить 3 персонажей. Иммунитет ко всему холодному оружию и легкому огнестрельному. Тяжелая броня. 3 хита',
    abilityIds: ['drone-heli', 'drone-heavy'],
  },
  {
    id: 'white-eagle',
    name: 'Белый орел',
    type: 'aircraft',
    modSlots: 2,
    moddingCapacity: 3,
    sensor: 14,
    hitpoints: 4,
    description: 'Может перевозить 3 персонажей. Иммунитет ко всему холодному оружию и легкому огнестрельному. Тяжелая броня. 4 хита',
    abilityIds: ['drone-heli', 'drone-heavy'],
  },
  {
    id: 'berkut',
    name: 'Беркут',
    type: 'aircraft',
    modSlots: 2,
    moddingCapacity: 3,
    sensor: 14,
    hitpoints: 4,
    description: 'Может перевозить 3 персонажей. Иммунитет ко всему холодному оружию и легкому огнестрельному. Тяжелая броня. Может лечить на поле боя! 4 хита',
    abilityIds: ['drone-heli', 'drone-heavy', 'medcart-light-heal-1', 'medcart-light-heal-2', 'medcart-heavy-heal-1'],
  },
  {
    id: 'medicart',
    name: 'Медикарт',
    type: 'medicart',
    modSlots: 1,
    moddingCapacity: 1,
    sensor: 4,
    hitpoints: 3,
    description: 'Медикарт. Простая модель, обладает 3 хитами, может лечить 2 легких ранения и 1 тяжёлое за раз.',
    abilityIds: ['drone-medcart', 'medcart-light-heal-1', 'medcart-light-heal-2', 'medcart-heavy-heal-1'],
  },
  {
    id: 'hippocrates',
    name: 'Гиппократ',
    type: 'medicart',
    modSlots: 1,
    moddingCapacity: 2,
    sensor: 8,
    hitpoints: 4,
    description: 'Гиппократ это медикарт 2-го поколения, в нем усиленны возможности по лечению (2 легких и 2 тяжёлых за раз), и повышена надёжность (4 хита)',
    abilityIds: ['drone-medcart', 'medcart-light-heal-1', 'medcart-light-heal-2', 'medcart-heavy-heal-1', 'medcart-heavy-heal-2'],
  },
  {
    id: 'lekar',
    name: 'Лекарь',
    type: 'medicart',
    modSlots: 1,
    moddingCapacity: 2,
    sensor: 8,
    hitpoints: 4,
    description: 'Мечта группы силовой поддержки! Обладает возможностями Гиппократа (возможности по лечению - 2 легких и 2 тяжёлых за раз, 4 хита), но при этом на нём может стоять Щит и установлена Тяжёлая броня!',
    abilityIds: ['drone-medcart', 'medcart-light-heal-1', 'medcart-light-heal-2', 'medcart-heavy-heal-1', 'medcart-heavy-heal-2'],
  },
  {
    id: 'kuzhuget',
    name: 'Кужугет',
    type: 'medicart',
    modSlots: 2,
    moddingCapacity: 3,
    sensor: 12,
    hitpoints: 6,
    description: 'Мечта группы поддержки, самый топчик по возможностям (3 легких и 3 тяжелых ранения за раз лечить можно), невероятно надёжный (6 хитов) и обладает возможностью реанимации прямо на поле боя!',
    abilityIds: [
      'drone-medcart',
      'medcart-light-heal-1',
      'medcart-light-heal-2',
      'medcart-light-heal-3',
      'medcart-heavy-heal-1',
      'medcart-heavy-heal-2',
      'medcart-heavy-heal-3',
      'medcart-reanimate',
    ],
  },
  {
    id: 'konfuciy',
    name: 'Конфуций',
    type: 'medicart',
    modSlots: 2,
    moddingCapacity: 3,
    sensor: 14,
    hitpoints: 6,
    description: 'Самый топовый медикарт, секретная экспериментальная модель, обладает полными известными возможностями по реанимации полным комплексом защиты и самообороны! (пулемет, тяжелая броня)',
    abilityIds: [
      'drone-medcart',
      'medcart-light-heal-1',
      'medcart-light-heal-2',
      'medcart-light-heal-3',
      'medcart-heavy-heal-1',
      'medcart-heavy-heal-2',
      'medcart-heavy-heal-3',
      'medcart-reanimate',
      'drone-ekzo',
      'drone-heavy',
    ],
  },
  {
    id: 'tool-autodoc-1',
    name: 'Пирогов',
    type: 'autodoc',
    modSlots: 0,
    moddingCapacity: 0,
    sensor: 4,
    hitpoints: 6,
    description: 'Автодок Пирогов - классика в области стационарных комплексов. Возможности комплекса позволяют надёжно взаимодействовать с простыми имплантами, а так же лечить пациентов.',
    abilityIds: ['auto-doc-screen', 'auto-doc-bonus-1'],
  },
  {
    id: 'tool-autodoc-2',
    name: 'Авиценна',
    type: 'autodoc',
    modSlots: 0,
    moddingCapacity: 0,
    sensor: 8,
    hitpoints: 6,
    description: 'Автодок Авиценна - комплекс, который позволит взаимодействовать с продвинутыми имплантами.',
    abilityIds: ['auto-doc-screen', 'auto-doc-bonus-3'],
  },
  {
    id: 'tool-autodoc-3',
    name: 'Асклепий',
    type: 'autodoc',
    modSlots: 0,
    moddingCapacity: 0,
    sensor: 12,
    hitpoints: 6,
    description: 'Асклепий - потрясающий автодок, в котором продвинутый Риггер сможет проводить достаточно сложные операции (если конечно разберется как с ним работать), ну а в руках мастера, автодок становится мощнейшим инструментом для операций с самыми сложными имплантами.',
    abilityIds: ['auto-doc-screen', 'auto-doc-bonus-5'],
  },
];
export const kCommonDroneAbilityIds = ['drone-danger', 'drone-logoff', 'in-drone'];

export const kDroneAbilityIds = new Set(kCommonDroneAbilityIds.concat(...kAllDrones.map((drone) => drone.abilityIds)));
