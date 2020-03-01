export type EthicScale = 'violence' | 'control' | 'individualism' | 'mind';
export type EthicTriggerKind = 'action' | 'crysis' | 'principle';

export interface EthicStateShift {
  scale: EthicScale;
  change: number;
  conditionMin: number;
  conditionMax: number;
}

export interface EthicTrigger {
  kind: EthicTriggerKind;
  description: string;
  shifts: EthicStateShift[];
  crysises: number[]; // Indices in the kAllCrysises array
}

export interface EthicLevel {
  scale: EthicScale;
  value: number;
  description: string;
  triggers: EthicTrigger[];
}

export const kAllCrysises: EthicTrigger[] = [
  {
    description: 'Сформулируйте, почему милосердие лучше насилия, и любым образом опубликуйте свое мнение\n',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: -1, conditionMax: 3, conditionMin: 0, scale: 'individualism' },
      { change: 1, conditionMax: 2, conditionMin: 0, scale: 'mind' },
    ],
  },
  {
    description: 'Пожертвуйте денег социальной службе или выполните ее контракт\n',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: 1, conditionMax: -1, conditionMin: -3, scale: 'control' }],
  },
  {
    description: 'Поговорите о своем грехе с тем, кого считаете моральным авторитетом, и выполните его совет, как искупить вину.',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: -1, conditionMax: 3, conditionMin: 0, scale: 'individualism' },
      { change: 1, conditionMax: 1, conditionMin: -1, scale: 'control' },
    ],
  },
  {
    description: 'Напейтесь с горя в любом кабаке и расскажите о своей беде любому собеседнику',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: -1, conditionMax: 2, conditionMin: -2, scale: 'mind' }],
  },
  {
    description: 'Пойдите в любой кабак и поставьте выпивку первому встречному\n',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: -1, conditionMax: 2, conditionMin: -1, scale: 'mind' },
      { change: -1, conditionMax: 1, conditionMin: -1, scale: 'control' },
    ],
  },
  {
    description: 'Откройте новую атакующую (воздействующую на другого человека по вашей инициативе) абилку в любом архетипе\n',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: 1, conditionMax: 2, conditionMin: -1, scale: 'mind' }],
  },
  {
    description: 'Выполните открытый контракт на поиск должника или преступника',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: 1, conditionMax: 2, conditionMin: 0, scale: 'control' }],
  },
  {
    description: 'Оскорбите кого-нибудь публично (не менее трех свидетелей, или в открытом канале)\n',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: -1, conditionMax: 3, conditionMin: -2, scale: 'control' },
      { change: -1, conditionMax: 2, conditionMin: -2, scale: 'mind' },
    ],
  },
  {
    description: 'Убейте до клинической смерти близкого человека (друга, родственника, любовника)',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: 2, conditionMax: 1, conditionMin: -3, scale: 'individualism' },
      { change: -1, conditionMax: 2, conditionMin: 0, scale: 'control' },
    ],
  },
  { description: '', kind: 'crysis', crysises: [], shifts: [] },
  { description: '', kind: 'crysis', crysises: [], shifts: [] },
  { description: '', kind: 'crysis', crysises: [], shifts: [] },
  { description: '', kind: 'crysis', crysises: [], shifts: [] },
  { description: '', kind: 'crysis', crysises: [], shifts: [] },
  { description: '', kind: 'crysis', crysises: [], shifts: [] },
  { description: '', kind: 'crysis', crysises: [], shifts: [] },
  { description: '', kind: 'crysis', crysises: [], shifts: [] },
  { description: '', kind: 'crysis', crysises: [], shifts: [] },
  { description: '', kind: 'crysis', crysises: [], shifts: [] },
  { description: '', kind: 'crysis', crysises: [], shifts: [] },
  { description: '', kind: 'crysis', crysises: [], shifts: [] },
  { description: '', kind: 'crysis', crysises: [], shifts: [] },
  { description: '', kind: 'crysis', crysises: [], shifts: [] },
  { description: '', kind: 'crysis', crysises: [], shifts: [] },
];
export const kEthicLevels: EthicLevel[] = [
  {
    value: -4,
    scale: 'violence',
    description: 'Не хватает только нимба',
    triggers: [
      { description: 'Все имеет свою цену, но человеческая жизнь почти бесценна', kind: 'principle', crysises: [1], shifts: [] },
      {
        description: 'Вы не помогли близкому человеку (другу, родственнику, любовнику), имея возможность помочь',
        kind: 'action',
        crysises: [],
        shifts: [{ change: 1, conditionMax: 10, conditionMin: -10, scale: 'violence' }],
      },
    ],
  },
  {
    value: -3,
    scale: 'violence',
    description: 'Друг всем, кто не успел вовремя сбежать',
    triggers: [
      { description: 'Любой человек заслуживает сочувствия и милосердного отношения ', kind: 'principle', crysises: [2], shifts: [] },
      {
        description: 'Вы пролили кровь ближнего (сняли минимум хит).',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'violence' },
          { change: -1, conditionMax: 3, conditionMin: 1, scale: 'control' },
        ],
      },
      {
        description: 'Вы оказали помощь человеку, который враждебен лично вам или вашей группе',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: -1, conditionMax: 10, conditionMin: -10, scale: 'violence' },
          { change: 1, conditionMax: 1, conditionMin: -1, scale: 'individualism' },
        ],
      },
    ],
  },
  {
    value: -2,
    scale: 'violence',
    description: 'Ребята, давайте жить дружно!',
    triggers: [
      { description: 'Если есть возможность решить дело миром, нельзя прибегать к насилию', kind: 'principle', crysises: [3], shifts: [] },
      {
        description: 'Вы прибегли к обману, чтобы убедить человека исполнить вашу просьбу',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'violence' },
          { change: 1, conditionMax: 0, conditionMin: -2, scale: 'control' },
        ],
      },
      {
        description: 'Вы оказали помощь или услугу по своей инициативе, без просьбы\n',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: -1, conditionMax: 10, conditionMin: -10, scale: 'violence' },
          { change: -1, conditionMax: 3, conditionMin: 1, scale: 'control' },
        ],
      },
    ],
  },
  {
    value: -1,
    scale: 'violence',
    description: 'Не откажется помочь, но не терпит нахлебников',
    triggers: [
      {
        description: 'Помогать надо только тем, кто не может справиться с проблемой своими силами\n',
        kind: 'principle',
        crysises: [4],
        shifts: [],
      },
      {
        description: 'Вы приняли осознанное решение не оказать помощь тому, кто в ней нуждается',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'violence' },
          { change: 1, conditionMax: 0, conditionMin: -2, scale: 'individualism' },
        ],
      },
      {
        description: 'Вы простили долг или сделали весомый подарок',
        kind: 'action',
        crysises: [],
        shifts: [{ change: -1, conditionMax: 10, conditionMin: -10, scale: 'violence' }],
      },
    ],
  },
  {
    value: 0,
    scale: 'violence',
    description: 'За добро платит добром, за зло - по справедливости',
    triggers: [
      {
        description: 'Нельзя упускать свою выгоду. Так называемые милосердие и насилие - лишь средства ее получить',
        kind: 'principle',
        crysises: [5],
        shifts: [],
      },
      {
        description: 'Вы возразили тому, кто сильнее вас',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'violence' },
          { change: 1, conditionMax: 1, conditionMin: -1, scale: 'mind' },
        ],
      },
      {
        description: 'Вы подчинились тому, кто слабее вас',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: -1, conditionMax: 10, conditionMin: -10, scale: 'violence' },
          { change: -1, conditionMax: 3, conditionMin: 1, scale: 'individualism' },
        ],
      },
    ],
  },
  {
    value: 1,
    scale: 'violence',
    description: 'Кто с мечом к нам придет, тот в грызло огребет',
    triggers: [
      {
        description: '"Око за око" - правильный принцип. Воздаяние надо всегда соизмерять со свершением.\n',
        kind: 'principle',
        crysises: [6],
        shifts: [],
      },
      {
        description: 'Вы прибегли к угрозам, чтобы убедить человека исполнить ваше требование',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'violence' },
          { change: 1, conditionMax: 1, conditionMin: -1, scale: 'control' },
        ],
      },
      {
        description: 'Вы отказались от контракта, сочтя его слишком жестоким',
        kind: 'action',
        crysises: [],
        shifts: [{ change: -1, conditionMax: 10, conditionMin: -10, scale: 'violence' }],
      },
    ],
  },
  {
    value: 2,
    scale: 'violence',
    description: 'Добро с кулаками, пулеметами и файрболлами',
    triggers: [
      {
        description: 'Превышение самообороны - бред. Агрессор заслуживает самого жесткого отпора\n',
        kind: 'principle',
        crysises: [7],
        shifts: [],
      },
      {
        description: 'Вы напали на противника, не ожидающего нападения',
        kind: 'action',
        crysises: [],
        shifts: [{ change: 1, conditionMax: 10, conditionMin: -10, scale: 'violence' }],
      },
      {
        description: 'Вы не ответили на оскорбление',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: -1, conditionMax: 10, conditionMin: -10, scale: 'violence' },
          { change: 1, conditionMax: 2, conditionMin: 0, scale: 'mind' },
        ],
      },
    ],
  },
  {
    value: 3,
    scale: 'violence',
    description: 'Беспощаден к врагам. К друзьям, впрочем, тоже',
    triggers: [
      {
        description: 'Если проблему можно решить убийством - это предпочтительный способ ее решения',
        kind: 'principle',
        crysises: [8],
        shifts: [],
      },
      {
        description: 'Вы добили до клинической смерти кого-то, кто оскорбил вас',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'violence' },
          { change: -1, conditionMax: 0, conditionMin: -2, scale: 'mind' },
        ],
      },
      {
        description: 'Вы угрожали убить кого-то, но не убили.',
        kind: 'action',
        crysises: [],
        shifts: [{ change: -1, conditionMax: 10, conditionMin: -10, scale: 'violence' }],
      },
    ],
  },
  {
    value: 4,
    scale: 'violence',
    description: 'Абсолютный отморозок с эмпатической глухотой',
    triggers: [
      { description: 'Все имеет свою цену, но человеческая жизнь - товар из самых дешевых', kind: 'principle', crysises: [9], shifts: [] },
      {
        description: 'Вы не добили врага ',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: -1, conditionMax: 10, conditionMin: -10, scale: 'violence' },
          { change: -1, conditionMax: 1, conditionMin: -1, scale: 'mind' },
        ],
      },
    ],
  },
  {
    value: -4,
    scale: 'control',
    description: 'Делай, что хочешь, и будь, что будет',
    triggers: [
      {
        description: 'Любое ограничение свободы аморально. Долг достойного человека - противостоять этому.',
        kind: 'principle',
        crysises: [10],
        shifts: [],
      },
      {
        description: 'Вы не убили того, кто попытался приказывать вам\n',
        kind: 'action',
        crysises: [],
        shifts: [{ change: 1, conditionMax: 10, conditionMin: -10, scale: 'control' }],
      },
    ],
  },
  {
    value: -3,
    scale: 'control',
    description: 'Лишь ты сам вправе положить предел своей свободе',
    triggers: [
      { description: 'Никем не повелеваю и никому не отдаю приказов', kind: 'principle', crysises: [11], shifts: [] },
      {
        description: 'Вы подчинились чужой воле',
        kind: 'action',
        crysises: [],
        shifts: [{ change: 1, conditionMax: 10, conditionMin: -10, scale: 'control' }],
      },
      {
        description: 'Вы спасли приговоренного к смерти',
        kind: 'action',
        crysises: [],
        shifts: [{ change: -1, conditionMax: 10, conditionMin: -10, scale: 'control' }],
      },
    ],
  },
  {
    value: -2,
    scale: 'control',
    description: 'Твоя свобода кончается там, где начинается чужая',
    triggers: [
      {
        description: 'Право выбора священно. Даже если человек выбирает отказаться от этого права.',
        kind: 'principle',
        crysises: [12],
        shifts: [],
      },
      {
        description: 'Вы заставили человека согласиться с вашим мнением или требованием',
        kind: 'action',
        crysises: [],
        shifts: [{ change: 1, conditionMax: 10, conditionMin: -10, scale: 'control' }],
      },
      {
        description: 'Вы помогли обрести свободу тому, кто был ее лишен',
        kind: 'action',
        crysises: [],
        shifts: [{ change: -1, conditionMax: 10, conditionMin: -10, scale: 'control' }],
      },
    ],
  },
  {
    value: -1,
    scale: 'control',
    description: 'Нет большего благодеяния, чем дать право выбора',
    triggers: [
      {
        description: 'Хорошо, когда человек подчиняется из любви или уважения. Плохо, если подчиняется из страха.',
        kind: 'principle',
        crysises: [13],
        shifts: [],
      },
      {
        description: 'Вы выполнили открытый контракт на поиск преступника',
        kind: 'action',
        crysises: [],
        shifts: [{ change: 1, conditionMax: 10, conditionMin: -10, scale: 'control' }],
      },
      {
        description: 'Вы дали убежище беглецу',
        kind: 'action',
        crysises: [],
        shifts: [{ change: -1, conditionMax: 10, conditionMin: -10, scale: 'control' }],
      },
    ],
  },
  {
    value: 0,
    scale: 'control',
    description: 'Свобода выбора обязует принять его последствия',
    triggers: [
      {
        description: 'И покорность, и бунт хороши, если пополняют твой счет. И плохи в обратном случае.',
        kind: 'principle',
        crysises: [14],
        shifts: [],
      },
      {
        description: 'Вы выполнили просьбу, которую не были обязаны выполнять',
        kind: 'action',
        crysises: [],
        shifts: [{ change: 1, conditionMax: 10, conditionMin: -10, scale: 'control' }],
      },
      {
        description: 'Вы отказались выполнять требование, которое были обязаны выполнить',
        kind: 'action',
        crysises: [],
        shifts: [{ change: -1, conditionMax: 10, conditionMin: -10, scale: 'control' }],
      },
    ],
  },
  {
    value: 1,
    scale: 'control',
    description: 'Свобода - роскошь, позволительная не каждому',
    triggers: [
      { description: 'Единоначалие часто неудобно, но всегда предпочтительнее комитета', kind: 'principle', crysises: [15], shifts: [] },
      {
        description: 'Вы возглавили раннергруппу на каком-то задании или согласились подчиняться другому командиру',
        kind: 'action',
        crysises: [],
        shifts: [{ change: 1, conditionMax: 10, conditionMin: -10, scale: 'control' }],
      },
      {
        description: 'Вы приняли решение, противоречащее мнению вышестоящих',
        kind: 'action',
        crysises: [],
        shifts: [{ change: -1, conditionMax: 10, conditionMin: -10, scale: 'control' }],
      },
    ],
  },
  {
    value: 2,
    scale: 'control',
    description: 'Решай за других, если можешь. Подчиняйся, если нет',
    triggers: [
      {
        description: 'Только дикарь отрицает дисциплину, как к дикарю к нему и следует относиться',
        kind: 'principle',
        crysises: [16],
        shifts: [],
      },
      {
        description: 'Вы принесли или приняли присягу / клятву / обет',
        kind: 'action',
        crysises: [],
        shifts: [{ change: 1, conditionMax: 10, conditionMin: -10, scale: 'control' }],
      },
      {
        description: 'Вы согласились с тем, кто аргументированно возразил вашему приказу или требованию',
        kind: 'action',
        crysises: [],
        shifts: [{ change: -1, conditionMax: 10, conditionMin: -10, scale: 'control' }],
      },
    ],
  },
  {
    value: 3,
    scale: 'control',
    description: 'Человек - винтик в машине. Или гаечный ключ.',
    triggers: [
      {
        description: 'Людям нужен лидер, сами за себя они не могут принять правильное решение',
        kind: 'principle',
        crysises: [17],
        shifts: [],
      },
      {
        description: 'Вы возглавили раннергруппу и выполнили задание\n / контракт',
        kind: 'action',
        crysises: [],
        shifts: [{ change: 1, conditionMax: 10, conditionMin: -10, scale: 'control' }],
      },
      {
        description: 'Вы оспорили приказ вышестоящего',
        kind: 'action',
        crysises: [],
        shifts: [{ change: -1, conditionMax: 10, conditionMin: -10, scale: 'control' }],
      },
    ],
  },
  {
    value: 4,
    scale: 'control',
    description: 'Должен - значит, можешь',
    triggers: [
      {
        description: 'Иерархия священна. Тот, кто ставит себя вне иерархии, не должен существовать',
        kind: 'principle',
        crysises: [18],
        shifts: [],
      },
      {
        description: 'Вы не убили того, кто нарушил ваш приказ или отказался его исполнять',
        kind: 'action',
        crysises: [],
        shifts: [{ change: -1, conditionMax: 10, conditionMin: -10, scale: 'control' }],
      },
    ],
  },
  { value: -4, scale: 'individualism', description: 'Нет такого слова - "я". Есть только "мы"', triggers: [] },
  { value: -3, scale: 'individualism', description: 'Лемминги никогда не ошибаются', triggers: [] },
  { value: -2, scale: 'individualism', description: 'Без друзей меня чуть-чуть, а с друзьями много', triggers: [] },
  { value: -1, scale: 'individualism', description: 'Вместе весело шагать по просторам', triggers: [] },
  { value: 0, scale: 'individualism', description: 'Своя рубашка ближе к телу', triggers: [] },
  { value: 1, scale: 'individualism', description: 'Не верит. Не боится. Не просит.', triggers: [] },
  { value: 2, scale: 'individualism', description: 'Не стоит прогибаться под изменчивый мир', triggers: [] },
  { value: 3, scale: 'individualism', description: 'Только личность творит историю', triggers: [] },
  { value: 4, scale: 'individualism', description: 'Тот, кто на вершине, всегда одинок', triggers: [] },
  { value: -4, scale: 'mind', description: 'Эмоциональная бомба, разминировать осторожно', triggers: [] },
  { value: -3, scale: 'mind', description: 'Сердце не обманет. В отличие от логики', triggers: [] },
  { value: -2, scale: 'mind', description: 'От страстей я получаю силу', triggers: [] },
  { value: -1, scale: 'mind', description: 'Лишь эмоции придают жизни вкус', triggers: [] },
  { value: 0, scale: 'mind', description: 'Равновесие - основа душевного здоровья', triggers: [] },
  { value: 1, scale: 'mind', description: 'Только интеллект отличает человека от зверя', triggers: [] },
  { value: 2, scale: 'mind', description: 'Эмоция допустима, если ее разрешает рассудок', triggers: [] },
  { value: 3, scale: 'mind', description: 'Радости чистого разума. Чувства не важны', triggers: [] },
  { value: 4, scale: 'mind', description: 'Ходячий компьютер в человеческом обличье', triggers: [] },
];
