export type EthicScale = 'violence' | 'control' | 'individualism' | 'mind';
export type EthicTriggerKind = 'action' | 'crysis' | 'principle';

export interface EthicCondition {
  scale: EthicScale;
  conditionMin: number;
  conditionMax: number;
}

export interface EthicStateShift extends EthicCondition {
  change: number;
}

export interface EthicTrigger {
  id: string;
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

export interface EthicAbilityCondition {
  scale: EthicScale;
  value: number;
  abilityId: string;
}

export interface EthicGroup {
  id: string; // Identifier of the group
  name: string; // Human-readable name of the group.
  ethicStyle: EthicCondition[]; // Member of the group must meet those conditions to get abilities.
  abilityIds: string[];
}

export const kEthicAbilities: EthicAbilityCondition[] = [
  { scale: 'control', value: -4, abilityId: 'comcon-ethic-ability' },
  { scale: 'control', value: 4, abilityId: 'comcon-ethic-ability' },
  { scale: 'individualism', value: -4, abilityId: 'comcon-ethic-ability' },
  { scale: 'individualism', value: 4, abilityId: 'comcon-ethic-ability' },
  { scale: 'mind', value: -4, abilityId: 'comcon-ethic-ability' },
  { scale: 'mind', value: 4, abilityId: 'comcon-ethic-ability' },
  { scale: 'violence', value: -4, abilityId: 'comcon-ethic-ability' },
  { scale: 'violence', value: 4, abilityId: 'comcon-ethic-ability' },
];

export const kAllCrysises: EthicTrigger[] = [
  {
    id: '3104de40-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Сформулируйте, почему милосердие лучше насилия, и любым образом опубликуйте свое мнение\n',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: -1, conditionMax: 3, conditionMin: 0, scale: 'individualism' },
      { change: 1, conditionMax: 2, conditionMin: 0, scale: 'mind' },
    ],
  },
  {
    id: '3104de41-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Пожертвуйте 10% со своего личного счета социальной службе или выполните ее контракт\n',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: 1, conditionMax: -1, conditionMin: -3, scale: 'control' }],
  },
  {
    id: '3104de42-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Поговорите о своем грехе с тем, кого считаете моральным авторитетом, и выполните его совет, как искупить вину.',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: -1, conditionMax: 3, conditionMin: 0, scale: 'individualism' },
      { change: 1, conditionMax: 1, conditionMin: -1, scale: 'control' },
    ],
  },
  {
    id: '3104de43-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Напейтесь с горя в любом кабаке и расскажите о своей беде любому собеседнику',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: -1, conditionMax: 2, conditionMin: -2, scale: 'mind' }],
  },
  {
    id: '3104de44-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Пойдите в любой кабак и поставьте выпивку первому встречному\n',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: -1, conditionMax: 2, conditionMin: -1, scale: 'mind' },
      { change: -1, conditionMax: 1, conditionMin: -1, scale: 'control' },
    ],
  },
  {
    id: '3104de45-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Откройте новую атакующую (воздействующую на другого человека по вашей инициативе) абилку в любом архетипе\n',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: 1, conditionMax: 2, conditionMin: -1, scale: 'mind' }],
  },
  {
    id: '3104de46-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Выполните открытый контракт на поиск должника или преступника',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: 1, conditionMax: 2, conditionMin: 0, scale: 'control' }],
  },
  {
    id: '3104de47-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Оскорбите кого-нибудь публично (не менее трех свидетелей, или в открытом канале)\n',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: -1, conditionMax: 3, conditionMin: -2, scale: 'control' },
      { change: -1, conditionMax: 2, conditionMin: -2, scale: 'mind' },
    ],
  },
  {
    id: '3104de48-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Убейте до клинической смерти близкого человека (друга, родственника, любовника)',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: 1, conditionMax: 1, conditionMin: -3, scale: 'individualism' },
      { change: -1, conditionMax: 2, conditionMin: 0, scale: 'control' },
    ],
  },
  {
    id: '3104de49-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Сформулируйте, почему свобода - высшая ценность, и любым образом опубликуйте свое мнение\n',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: -1, conditionMax: 0, conditionMin: -2, scale: 'mind' },
      { change: 1, conditionMax: 2, conditionMin: 0, scale: 'individualism' },
    ],
  },
  {
    id: '3104de4a-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Нарисуйте граффити или наклейте листовку, критикующую корпоративный порядок',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: 1, conditionMax: 1, conditionMin: -3, scale: 'individualism' }],
  },
  {
    id: '3104de4b-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Сходите в ран на любую корпорацию',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: 1, conditionMax: 1, conditionMin: -1, scale: 'violence' }],
  },
  {
    id: '3104de4c-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Окажите финансовую помощь или наймите на работу человека, близкого к банкротству',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: -1, conditionMax: 2, conditionMin: 0, scale: 'violence' },
      { change: -1, conditionMax: 3, conditionMin: 1, scale: 'individualism' },
    ],
  },
  {
    id: '3104de4d-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Сходите в кабак и съешьте что-нибудь вкусное',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: 1, conditionMax: 2, conditionMin: -2, scale: 'individualism' }],
  },
  {
    id: '3104de4e-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Поступите на работу в корпорацию или выполните ее контракт',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: 1, conditionMax: 1, conditionMin: -1, scale: 'mind' },
      { change: 1, conditionMax: 1, conditionMin: -1, scale: 'individualism' },
    ],
  },
  {
    id: '3104de4f-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Выполните открытый контракт на поиск должника или преступника',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: 1, conditionMax: 0, conditionMin: -2, scale: 'violence' }],
  },
  {
    id: '3104de50-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Отдайте приказ человеку, не являющемуся вашим подчиненным, и добейтейсь его выполнения.',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: -1, conditionMax: 1, conditionMin: -1, scale: 'individualism' },
      { change: 1, conditionMax: -1, conditionMin: -3, scale: 'violence' },
    ],
  },
  {
    id: '3104de51-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Расследуйте преступление и добейтесь наказания для преступника',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: 1, conditionMax: 2, conditionMin: -2, scale: 'violence' },
      { change: 1, conditionMax: 2, conditionMin: -2, scale: 'mind' },
    ],
  },
  {
    id: '3104de52-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Поучаствуйте в публичной акции, пропагандирующей цели и идеалы вашей группы',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: -1, conditionMax: 1, conditionMin: -1, scale: 'mind' }],
  },
  {
    id: '3104de53-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Атакуйте человека, нелестно отозвавшегося о ценностях вашей группы',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: 1, conditionMax: 0, conditionMin: -2, scale: 'violence' },
      { change: -1, conditionMax: 2, conditionMin: 0, scale: 'mind' },
    ],
  },
  {
    id: '3104de54-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Поговорите с лидером вашей группы и попросите дать вам какое-либо задание',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: 1, conditionMax: 1, conditionMin: -1, scale: 'control' }],
  },
  {
    id: '3104de55-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Поставьте выпивку минимум троим товарищам по группе',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: -1, conditionMax: 3, conditionMin: 1, scale: 'violence' },
      { change: -1, conditionMax: 0, conditionMin: -2, scale: 'mind' },
    ],
  },
  {
    id: '3104de56-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Поучаствуйте в любом публичном мероприятии',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: -1, conditionMax: 3, conditionMin: 1, scale: 'mind' }],
  },
  {
    id: '3104de57-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Сделайте ставку на любую из команд Urban Brawl',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: 1, conditionMax: -1, conditionMin: -3, scale: 'violence' },
      { change: 1, conditionMax: 2, conditionMin: 0, scale: 'mind' },
    ],
  },
  {
    id: '3104de58-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Выполните раннерский контракт и по итогам потребуйте себе долю в добыче больше, чем было исходно условлено ',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: 1, conditionMax: 2, conditionMin: 0, scale: 'control' }],
  },
  {
    id: '3104de59-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Публично оскорбите ценности любой группы, к которой не принадлежите',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: -1, conditionMax: 0, conditionMin: -2, scale: 'mind' },
      { change: 1, conditionMax: 1, conditionMin: -1, scale: 'violence' },
    ],
  },
  {
    id: '3104de5a-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Выполните любой контракт, не прибегая к помощи других людей',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: 1, conditionMax: 1, conditionMin: -1, scale: 'mind' },
      { change: -1, conditionMax: 0, conditionMin: -2, scale: 'control' },
    ],
  },
  {
    id: '3104de5b-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Объяснитесь в любви человеку, который вам нравится',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: 1, conditionMax: 0, conditionMin: -2, scale: 'control' },
      { change: -1, conditionMax: 3, conditionMin: 1, scale: 'violence' },
    ],
  },
  {
    id: '3104de5c-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Примите любые два наркотика одновременно',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: -1, conditionMax: 3, conditionMin: 1, scale: 'control' }],
  },
  {
    id: '3104de5d-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Пожертвуйте 10% со своего личного счета любой религиозной организации',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: -1, conditionMax: 2, conditionMin: 0, scale: 'violence' },
      { change: 1, conditionMax: 0, conditionMin: -2, scale: 'control' },
    ],
  },
  {
    id: '3104de5e-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Сочините анекдот на злобу дня и расскажите его троим собеседникам',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: -1, conditionMax: 0, conditionMin: -2, scale: 'individualism' }],
  },
  {
    id: '31050550-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Сходите в бордель или стриптиз-клуб',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: -1, conditionMax: 2, conditionMin: 0, scale: 'control' }],
  },
  {
    id: '31050551-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Сходите в кабак и спойте любую песню во всеуслышанье. Неважно, умеете ли вы петь.',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: 1, conditionMax: -1, conditionMin: -3, scale: 'violence' },
      { change: 1, conditionMax: 1, conditionMin: -1, scale: 'individualism' },
    ],
  },
  {
    id: '31050552-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Опубликуйте компромат на любого человека, которого вы считаете неразумным. Не обязательно правдивый.',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: 1, conditionMax: 2, conditionMin: 0, scale: 'control' },
      { change: 1, conditionMax: 2, conditionMin: 0, scale: 'violence' },
    ],
  },
  {
    id: '31050553-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Оскорбите человека, пытающегося шутить в вашем присутствии',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: 1, conditionMax: 2, conditionMin: 0, scale: 'violence' }],
  },
  {
    id: '31050554-5d9e-11ea-b518-e5c6714f0b78',
    description: 'Обоснуйте и опубликуйте воззвание в поддержку непопулярного, но разумного решения российских властей или ККС',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: 1, conditionMax: 0, conditionMin: -2, scale: 'control' },
      { change: -1, conditionMax: 1, conditionMin: -1, scale: 'individualism' },
    ],
  },
];
export const kEthicLevels: EthicLevel[] = [
  {
    value: -4,
    scale: 'violence',
    description: 'Не хватает только нимба',
    triggers: [
      {
        id: '30dedfb0-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Все имеет свою цену, но человеческая жизнь почти бесценна',
        kind: 'principle',
        crysises: [1],
        shifts: [],
      },
      {
        id: '30df06c0-5d9e-11ea-b518-e5c6714f0b78',
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
      {
        id: '30df06c1-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Любой человек заслуживает сочувствия и милосердного отношения ',
        kind: 'principle',
        crysises: [2],
        shifts: [],
      },
      {
        id: '30df06c2-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы пролили кровь ближнего (сняли минимум хит).',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'violence' },
          { change: -1, conditionMax: 3, conditionMin: 1, scale: 'control' },
        ],
      },
      {
        id: '30df06c3-5d9e-11ea-b518-e5c6714f0b78',
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
      {
        id: '30df06c4-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Если есть возможность решить дело миром, нельзя прибегать к насилию',
        kind: 'principle',
        crysises: [3],
        shifts: [],
      },
      {
        id: '30df06c5-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы прибегли к обману, чтобы убедить человека исполнить вашу просьбу',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'violence' },
          { change: 1, conditionMax: 0, conditionMin: -2, scale: 'control' },
        ],
      },
      {
        id: '30df06c6-5d9e-11ea-b518-e5c6714f0b78',
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
        id: '30df06c7-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Помогать надо только тем, кто не может справиться с проблемой своими силами\n',
        kind: 'principle',
        crysises: [4],
        shifts: [],
      },
      {
        id: '30df06c8-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы приняли осознанное решение не оказать помощь тому, кто в ней нуждается',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'violence' },
          { change: 1, conditionMax: 0, conditionMin: -2, scale: 'individualism' },
        ],
      },
      {
        id: '30df06c9-5d9e-11ea-b518-e5c6714f0b78',
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
        id: '30df06ca-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Нельзя упускать свою выгоду. Так называемые милосердие и насилие - лишь средства ее получить',
        kind: 'principle',
        crysises: [5],
        shifts: [],
      },
      {
        id: '30df06cb-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы возразили тому, кто сильнее вас',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'violence' },
          { change: 1, conditionMax: 1, conditionMin: -1, scale: 'mind' },
        ],
      },
      {
        id: '30df06cc-5d9e-11ea-b518-e5c6714f0b78',
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
        id: '30df06cd-5d9e-11ea-b518-e5c6714f0b78',
        description: '"Око за око" - правильный принцип. Воздаяние надо всегда соизмерять со свершением.\n',
        kind: 'principle',
        crysises: [6],
        shifts: [],
      },
      {
        id: '30df06ce-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы прибегли к угрозам, чтобы убедить человека исполнить ваше требование',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'violence' },
          { change: 1, conditionMax: 1, conditionMin: -1, scale: 'control' },
        ],
      },
      {
        id: '30df06cf-5d9e-11ea-b518-e5c6714f0b78',
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
        id: '30df06d0-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Превышение самообороны - бред. Агрессор заслуживает самого жесткого отпора\n',
        kind: 'principle',
        crysises: [7],
        shifts: [],
      },
      {
        id: '30df06d1-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы напали на противника, не ожидающего нападения',
        kind: 'action',
        crysises: [],
        shifts: [{ change: 1, conditionMax: 10, conditionMin: -10, scale: 'violence' }],
      },
      {
        id: '30df06d2-5d9e-11ea-b518-e5c6714f0b78',
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
        id: '30df06d3-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Если проблему можно решить убийством - это предпочтительный способ ее решения',
        kind: 'principle',
        crysises: [8],
        shifts: [],
      },
      {
        id: '30df06d4-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы добили до клинической смерти кого-то, кто оскорбил вас',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'violence' },
          { change: -1, conditionMax: 0, conditionMin: -2, scale: 'mind' },
        ],
      },
      {
        id: '30df06d5-5d9e-11ea-b518-e5c6714f0b78',
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
      {
        id: '30df06d6-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Все имеет свою цену, но человеческая жизнь - товар из самых дешевых',
        kind: 'principle',
        crysises: [9],
        shifts: [],
      },
      {
        id: '30df06d7-5d9e-11ea-b518-e5c6714f0b78',
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
        id: '30df06d8-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Любое ограничение свободы аморально. Долг достойного человека - противостоять этому.',
        kind: 'principle',
        crysises: [10],
        shifts: [],
      },
      {
        id: '30df06d9-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы не убили того, кто попытался приказывать вам\n',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'control' },
          { change: -1, conditionMax: 3, conditionMin: 1, scale: 'violence' },
        ],
      },
    ],
  },
  {
    value: -3,
    scale: 'control',
    description: 'Лишь ты сам вправе положить предел своей свободе',
    triggers: [
      {
        id: '30df06da-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Никем не повелеваю и никому не отдаю приказов',
        kind: 'principle',
        crysises: [11],
        shifts: [],
      },
      {
        id: '30df06db-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы подчинились чужой воле',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'control' },
          { change: -1, conditionMax: 3, conditionMin: 1, scale: 'individualism' },
        ],
      },
      {
        id: '30df06dc-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы спасли приговоренного к смерти',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: -1, conditionMax: 10, conditionMin: -10, scale: 'control' },
          { change: -1, conditionMax: 3, conditionMin: 1, scale: 'violence' },
        ],
      },
    ],
  },
  {
    value: -2,
    scale: 'control',
    description: 'Твоя свобода кончается там, где начинается чужая',
    triggers: [
      {
        id: '30df06dd-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Право выбора священно. Даже если человек выбирает отказаться от этого права.',
        kind: 'principle',
        crysises: [12],
        shifts: [],
      },
      {
        id: '30df06de-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы заставили человека согласиться с вашим мнением или требованием',
        kind: 'action',
        crysises: [],
        shifts: [{ change: 1, conditionMax: 10, conditionMin: -10, scale: 'control' }],
      },
      {
        id: '30df06df-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы помогли обрести свободу тому, кто был ее лишен',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: -1, conditionMax: 10, conditionMin: -10, scale: 'control' },
          { change: 1, conditionMax: 1, conditionMin: -1, scale: 'individualism' },
        ],
      },
    ],
  },
  {
    value: -1,
    scale: 'control',
    description: 'Нет большего благодеяния, чем дать право выбора',
    triggers: [
      {
        id: '30df06e0-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Хорошо, когда человек подчиняется из любви или уважения. Плохо, если подчиняется из страха.',
        kind: 'principle',
        crysises: [13],
        shifts: [],
      },
      {
        id: '30df06e1-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы выполнили открытый контракт на поиск преступника',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'control' },
          { change: 1, conditionMax: 2, conditionMin: 0, scale: 'violence' },
        ],
      },
      {
        id: '30df06e2-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы дали убежище беглецу',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: -1, conditionMax: 10, conditionMin: -10, scale: 'control' },
          { change: -1, conditionMax: 0, conditionMin: -2, scale: 'violence' },
        ],
      },
    ],
  },
  {
    value: 0,
    scale: 'control',
    description: 'Свобода выбора обязует принять его последствия',
    triggers: [
      {
        id: '30df06e3-5d9e-11ea-b518-e5c6714f0b78',
        description: 'И покорность, и бунт хороши, если пополняют твой счет. И плохи в обратном случае.',
        kind: 'principle',
        crysises: [14],
        shifts: [],
      },
      {
        id: '30df06e4-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы выполнили просьбу, которую не были обязаны выполнять',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'control' },
          { change: 1, conditionMax: 1, conditionMin: -1, scale: 'mind' },
        ],
      },
      {
        id: '30df06e5-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы отказались выполнять требование, которое были обязаны выполнить',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: -1, conditionMax: 10, conditionMin: -10, scale: 'control' },
          { change: -1, conditionMax: 3, conditionMin: 1, scale: 'mind' },
        ],
      },
    ],
  },
  {
    value: 1,
    scale: 'control',
    description: 'Свобода - роскошь, позволительная не каждому',
    triggers: [
      {
        id: '30df06e6-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Задача лидера - действовать во благо своих подчиненных',
        kind: 'principle',
        crysises: [15],
        shifts: [],
      },
      {
        id: '30df06e7-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы возглавили раннергруппу на каком-то задании или согласились подчиняться другому командиру',
        kind: 'action',
        crysises: [],
        shifts: [{ change: 1, conditionMax: 10, conditionMin: -10, scale: 'control' }],
      },
      {
        id: '30df06e8-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы приняли решение, противоречащее мнению вышестоящих',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: -1, conditionMax: 10, conditionMin: -10, scale: 'control' },
          { change: 1, conditionMax: -1, conditionMin: -3, scale: 'individualism' },
        ],
      },
    ],
  },
  {
    value: 2,
    scale: 'control',
    description: 'Решай за других, если можешь. Подчиняйся, если нет',
    triggers: [
      {
        id: '30df06e9-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Только дикарь отрицает дисциплину, как к дикарю к нему и следует относиться',
        kind: 'principle',
        crysises: [16],
        shifts: [],
      },
      {
        id: '30df06ea-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы принесли или приняли присягу / клятву / обет',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'control' },
          { change: -1, conditionMax: 0, conditionMin: -2, scale: 'individualism' },
        ],
      },
      {
        id: '30df06eb-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы согласились с тем, кто аргументированно возразил вашему приказу или требованию',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: -1, conditionMax: 10, conditionMin: -10, scale: 'control' },
          { change: 1, conditionMax: 1, conditionMin: -1, scale: 'mind' },
        ],
      },
    ],
  },
  {
    value: 3,
    scale: 'control',
    description: 'Человек - винтик в машине. Или гаечный ключ.',
    triggers: [
      {
        id: '30df06ec-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Людям нужен лидер, сами за себя они не могут принять правильное решение',
        kind: 'principle',
        crysises: [17],
        shifts: [],
      },
      {
        id: '30df06ed-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы возглавили раннергруппу и выполнили задание\n / контракт',
        kind: 'action',
        crysises: [],
        shifts: [{ change: 1, conditionMax: 10, conditionMin: -10, scale: 'control' }],
      },
      {
        id: '30df06ee-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы оспорили приказ вышестоящего',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: -1, conditionMax: 10, conditionMin: -10, scale: 'control' },
          { change: 1, conditionMax: -1, conditionMin: -3, scale: 'individualism' },
        ],
      },
    ],
  },
  {
    value: 4,
    scale: 'control',
    description: 'Должен - значит, можешь',
    triggers: [
      {
        id: '30df06ef-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Иерархия священна, а слово вышестоящего - закон для подчиненного',
        kind: 'principle',
        crysises: [18],
        shifts: [],
      },
      {
        id: '30df06f0-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы не убили того, кто нарушил ваш приказ или отказался его исполнять',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: -1, conditionMax: 10, conditionMin: -10, scale: 'control' },
          { change: -1, conditionMax: 3, conditionMin: 1, scale: 'violence' },
        ],
      },
    ],
  },
  {
    value: -4,
    scale: 'individualism',
    description: 'Нет такого слова - "я". Есть только "мы"',
    triggers: [
      {
        id: '30df06f1-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Кто не с нами, тот против нас',
        kind: 'principle',
        crysises: [19],
        shifts: [],
      },
      {
        id: '30df06f2-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы не убили члена вашей группы, отказавшегося выполнять общее решение или саботирующего его',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'individualism' },
          { change: 1, conditionMax: 0, conditionMin: -2, scale: 'violence' },
        ],
      },
    ],
  },
  {
    value: -3,
    scale: 'individualism',
    description: 'Лемминги никогда не ошибаются',
    triggers: [
      {
        id: '30df06f3-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Принадлежность к группе - все, что есть у человека. Нет хуже судьбы, чем стать изгоем.',
        kind: 'principle',
        crysises: [20],
        shifts: [],
      },
      {
        id: '30df06f4-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы отказали в помощи члену вашей группы',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'individualism' },
          { change: 1, conditionMax: 2, conditionMin: 0, scale: 'mind' },
        ],
      },
      {
        id: '30df06f5-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы принесли или приняли присягу / клятву / обет',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: -1, conditionMax: 10, conditionMin: -10, scale: 'individualism' },
          { change: 1, conditionMax: 0, conditionMin: -2, scale: 'control' },
        ],
      },
    ],
  },
  {
    value: -2,
    scale: 'individualism',
    description: 'Без друзей меня чуть-чуть, а с друзьями много',
    triggers: [
      {
        id: '30df06f6-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Группа ответственна за действия любого ее члена',
        kind: 'principle',
        crysises: [21],
        shifts: [],
      },
      {
        id: '30df06f7-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы публично отказались выполнять совместное решение вашей группы',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'individualism' },
          { change: -1, conditionMax: 3, conditionMin: 1, scale: 'control' },
        ],
      },
      {
        id: '30df06f8-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы пригласили чужака присоединиться к вашей группе',
        kind: 'action',
        crysises: [],
        shifts: [{ change: -1, conditionMax: 10, conditionMin: -10, scale: 'individualism' }],
      },
    ],
  },
  {
    value: -1,
    scale: 'individualism',
    description: 'Вместе весело шагать по просторам',
    triggers: [
      {
        id: '30df06f9-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вожак группы - лишь первый среди равных',
        kind: 'principle',
        crysises: [22],
        shifts: [],
      },
      {
        id: '30df06fa-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы утаили от группы какую-то информацию',
        kind: 'action',
        crysises: [],
        shifts: [{ change: 1, conditionMax: 10, conditionMin: -10, scale: 'individualism' }],
      },
      {
        id: '30df06fb-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы поддержали решение, невыгодное лично вам, но направленное на общее благо',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: -1, conditionMax: 10, conditionMin: -10, scale: 'individualism' },
          { change: -1, conditionMax: 1, conditionMin: -1, scale: 'mind' },
        ],
      },
    ],
  },
  {
    value: 0,
    scale: 'individualism',
    description: 'Своя рубашка ближе к телу',
    triggers: [
      {
        id: '30df06fc-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Принадлежность к сообществу или самостоятельность хороши, только если это выгодно',
        kind: 'principle',
        crysises: [23],
        shifts: [],
      },
      {
        id: '30df06fd-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы возразили общему решению вашей группы',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'individualism' },
          { change: -1, conditionMax: 3, conditionMin: 1, scale: 'control' },
        ],
      },
      {
        id: '30df06fe-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы подчинились общему решению вашей группы',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: -1, conditionMax: 10, conditionMin: -10, scale: 'individualism' },
          { change: 1, conditionMax: -1, conditionMin: -3, scale: 'control' },
        ],
      },
    ],
  },
  {
    value: 1,
    scale: 'individualism',
    description: 'Не верит. Не боится. Не просит.',
    triggers: [
      {
        id: '30df06ff-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Ошибочное решение остается ошибочным, даже если принято обществом.',
        kind: 'principle',
        crysises: [24],
        shifts: [],
      },
      {
        id: '30df0700-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы потребовали аванс при заключении контракта',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'individualism' },
          { change: 1, conditionMax: 0, conditionMin: -2, scale: 'mind' },
        ],
      },
      {
        id: '30df0701-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы оплатили в кабаке выпивку вашему собутыльнику',
        kind: 'action',
        crysises: [],
        shifts: [{ change: -1, conditionMax: 10, conditionMin: -10, scale: 'individualism' }],
      },
    ],
  },
  {
    value: 2,
    scale: 'individualism',
    description: 'Не стоит прогибаться под изменчивый мир',
    triggers: [
      {
        id: '30df0702-5d9e-11ea-b518-e5c6714f0b78',
        description: 'В любом обществе права и обязанности его членов должны быть четко оговорены и ясны',
        kind: 'principle',
        crysises: [25],
        shifts: [],
      },
      {
        id: '30df0703-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы публично оскорбили задевшего вас',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'individualism' },
          { change: 1, conditionMax: 1, conditionMin: -1, scale: 'violence' },
        ],
      },
      {
        id: '30df0704-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы оказали безвозмездную помощь другу, родственнику, союзнику',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: -1, conditionMax: 10, conditionMin: -10, scale: 'individualism' },
          { change: -1, conditionMax: 3, conditionMin: 1, scale: 'violence' },
        ],
      },
    ],
  },
  {
    value: 3,
    scale: 'individualism',
    description: 'Только личность творит историю',
    triggers: [
      {
        id: '30df0705-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Не стоит присоединяться к сообществу, не имея планов его возглавить',
        kind: 'principle',
        crysises: [26],
        shifts: [],
      },
      {
        id: '30df0706-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы решили выйти из группы и объявили об этом публично',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'individualism' },
          { change: -1, conditionMax: 1, conditionMin: -1, scale: 'control' },
        ],
      },
      {
        id: '30df0707-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы согласились заключить контракт или принять оплату без торга',
        kind: 'action',
        crysises: [],
        shifts: [{ change: -1, conditionMax: 10, conditionMin: -10, scale: 'individualism' }],
      },
    ],
  },
  {
    value: 4,
    scale: 'individualism',
    description: 'Тот, кто на вершине, всегда одинок',
    triggers: [
      {
        id: '30df0708-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Любые привязанности ослабляют человека. Должно отринуть их',
        kind: 'principle',
        crysises: [27],
        shifts: [],
      },
      {
        id: '30df0709-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы поблагодарили человека или ответили на благодарность',
        kind: 'action',
        crysises: [],
        shifts: [{ change: -1, conditionMax: 10, conditionMin: -10, scale: 'individualism' }],
      },
    ],
  },
  {
    value: -4,
    scale: 'mind',
    description: 'Эмоциональная бомба, разминировать осторожно',
    triggers: [
      {
        id: '30df070a-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Ваши эмоции безошибочны. Всегда надо следовать им. ',
        kind: 'principle',
        crysises: [28],
        shifts: [],
      },
      {
        id: '30df070b-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Почувствовав неприязнь к человеку, вы не попытались его убить',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'mind' },
          { change: -1, conditionMax: 3, conditionMin: 1, scale: 'violence' },
        ],
      },
    ],
  },
  {
    value: -3,
    scale: 'mind',
    description: 'Сердце не обманет. В отличие от логики',
    triggers: [
      {
        id: '30df070c-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Эмоциональное отторжение - достаточный повод, чтобы нарушить любой закон или приказ',
        kind: 'principle',
        crysises: [29],
        shifts: [],
      },
      {
        id: '30df070d-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы согласились с обоснованным мнением',
        kind: 'action',
        crysises: [],
        shifts: [{ change: 1, conditionMax: 10, conditionMin: -10, scale: 'mind' }],
      },
      {
        id: '30df070e-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы назвали человека другом и честно пообещали ему помощь в любом его деле',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: -1, conditionMax: 10, conditionMin: -10, scale: 'mind' },
          { change: -1, conditionMax: 0, conditionMin: -2, scale: 'individualism' },
        ],
      },
    ],
  },
  {
    value: -2,
    scale: 'mind',
    description: 'От страстей я получаю силу',
    triggers: [
      {
        id: '30df070f-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Следует доверять любому человеку, чьи эмоции согласны с вашими',
        kind: 'principle',
        crysises: [30],
        shifts: [],
      },
      {
        id: '30df0710-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы согласились на неприятную, но хорошо оплачиваемую работу',
        kind: 'action',
        crysises: [],
        shifts: [{ change: 1, conditionMax: 10, conditionMin: -10, scale: 'mind' }],
      },
      {
        id: '30df0711-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы помогли несправедливо обиженному восстановить справедливость или отомстить',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: -1, conditionMax: 10, conditionMin: -10, scale: 'mind' },
          { change: -1, conditionMax: 1, conditionMin: -1, scale: 'control' },
        ],
      },
    ],
  },
  {
    value: -1,
    scale: 'mind',
    description: 'Лишь эмоции придают жизни вкус',
    triggers: [
      {
        id: '30df0712-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Проверяйте движения своего сердца советом достойных людей',
        kind: 'principle',
        crysises: [31],
        shifts: [],
      },
      {
        id: '30df0713-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы отказали в помощи человеку, сочтя его просьбу неразумной',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'mind' },
          { change: 1, conditionMax: 2, conditionMin: 0, scale: 'individualism' },
        ],
      },
      {
        id: '30df0714-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы отказались от контракта из чувства антипатии к заказчику или неприятия самой работы',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: -1, conditionMax: 10, conditionMin: -10, scale: 'mind' },
          { change: -1, conditionMax: 1, conditionMin: -1, scale: 'violence' },
        ],
      },
    ],
  },
  {
    value: 0,
    scale: 'mind',
    description: 'Равновесие - основа душевного здоровья',
    triggers: [
      {
        id: '30df0715-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Поверяйте решения рассудка чувством, а стремления чувств рассудком',
        kind: 'principle',
        crysises: [32],
        shifts: [],
      },
      {
        id: '30df0716-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Ваше рассуждение убедило собеседника',
        kind: 'action',
        crysises: [],
        shifts: [{ change: 1, conditionMax: 10, conditionMin: -10, scale: 'mind' }],
      },
      {
        id: '30df0717-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы публично прокомментировали эмоционально задевшую вас медиа-публикацию',
        kind: 'action',
        crysises: [],
        shifts: [{ change: -1, conditionMax: 10, conditionMin: -10, scale: 'mind' }],
      },
    ],
  },
  {
    value: 1,
    scale: 'mind',
    description: 'Только интеллект отличает человека от зверя',
    triggers: [
      {
        id: '30df0718-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Следует принимать и использовать людей такими, какие есть. Не нужно пытаться их переделать.',
        kind: 'principle',
        crysises: [33],
        shifts: [],
      },
      {
        id: '30df0719-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы убедили свое начальство или лидера группы принять ваш совет',
        kind: 'action',
        crysises: [],
        shifts: [{ change: 1, conditionMax: 10, conditionMin: -10, scale: 'mind' }],
      },
      {
        id: '30df071a-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы публично оскорбили эмоционально неприятное вам сообщество или группу',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: -1, conditionMax: 10, conditionMin: -10, scale: 'mind' },
          { change: 1, conditionMax: 0, conditionMin: -2, scale: 'individualism' },
        ],
      },
    ],
  },
  {
    value: 2,
    scale: 'mind',
    description: 'Рассудок - преграда для эмоций',
    triggers: [
      {
        id: '30df071b-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Следует прислушаться к мнению рассудительного человека и игнорировать мнение эмоционального',
        kind: 'principle',
        crysises: [34],
        shifts: [],
      },
      {
        id: '30df071c-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы заключили выгодную сделку, обманув собеседника',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'mind' },
          { change: 1, conditionMax: 2, conditionMin: 0, scale: 'control' },
        ],
      },
      {
        id: '30df071d-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы помогли человеку из чувства симпатии',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: -1, conditionMax: 10, conditionMin: -10, scale: 'mind' },
          { change: -1, conditionMax: 3, conditionMin: 1, scale: 'individualism' },
        ],
      },
    ],
  },
  {
    value: 3,
    scale: 'mind',
    description: 'Радости чистого разума. Чувства не важны',
    triggers: [
      {
        id: '30df071e-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Эмоция допустима, только если ее разрешает рассудок',
        kind: 'principle',
        crysises: [35],
        shifts: [],
      },
      {
        id: '30df071f-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы убедили собеседника отказаться от своего преимущества',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'mind' },
          { change: -1, conditionMax: 0, conditionMin: -2, scale: 'individualism' },
        ],
      },
      {
        id: '30df0720-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы пошутили, вызвав у собеседника улыбку или смех',
        kind: 'action',
        crysises: [],
        shifts: [{ change: -1, conditionMax: 10, conditionMin: -10, scale: 'mind' }],
      },
    ],
  },
  {
    value: 4,
    scale: 'mind',
    description: 'Ходячий компьютер в человеческом обличье',
    triggers: [
      {
        id: '30df0721-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Ни одно событие в мире не заслуживает эмоциональной реакции',
        kind: 'principle',
        crysises: [36],
        shifts: [],
      },
      {
        id: '30df0722-5d9e-11ea-b518-e5c6714f0b78',
        description: 'Вы засмеялись или рассердились',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: -1, conditionMax: 10, conditionMin: -10, scale: 'mind' },
          { change: -1, conditionMax: 3, conditionMin: 1, scale: 'control' },
        ],
      },
    ],
  },
];

export const kAllEthicGroups: EthicGroup[] = [
  {
    id: 'russian-orthodox-church',
    name: 'Русская Православная Церковь',
    ethicStyle: [
      {
        scale: 'violence',
        conditionMin: -4,
        conditionMax: 3,
      },
      {
        scale: 'control',
        conditionMin: -3,
        conditionMax: 4,
      },
      {
        scale: 'individualism',
        conditionMin: -4,
        conditionMax: 1,
      },
      {
        scale: 'mind',
        conditionMin: -4,
        conditionMax: 4,
      },
    ],
    abilityIds: ['comcon-ethic-ability'],
  },

  {
    id: 'orthodox-miracle-doers',
    name: 'Православные чудотворцы',
    ethicStyle: [
      {
        scale: 'violence',
        conditionMin: -4,
        conditionMax: -3,
      },
      {
        scale: 'control',
        conditionMin: 2,
        conditionMax: 3,
      },
      {
        scale: 'individualism',
        conditionMin: -3,
        conditionMax: -2,
      },
      {
        scale: 'mind',
        conditionMin: 0,
        conditionMax: 1,
      },
    ],
    abilityIds: [],
  },

  {
    id: 'cold-head-and-hot-heart',
    name: 'Холодная голова и горячее сердце',
    ethicStyle: [
      {
        scale: 'violence',
        conditionMin: 3,
        conditionMax: 4,
      },
      {
        scale: 'control',
        conditionMin: 2,
        conditionMax: 4,
      },
      {
        scale: 'individualism',
        conditionMin: -2,
        conditionMax: 0,
      },
      {
        scale: 'mind',
        conditionMin: 3,
        conditionMax: 4,
      },
    ],
    abilityIds: [],
  },
];
