export type EthicScale = 'violence' | 'control' | 'individualism' | 'mind';
export type EthicTriggerKind = 'action' | 'crysis' | 'principle';

export interface EthicStateShift {
  scale: EthicScale;
  change: number;
  conditionMin: number;
  conditionMax: number;
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

export const kAllCrysises: EthicTrigger[] = [
  {
    id: '628f86b0-6486-11ea-a399-09a05ee6ca4f',
    description: 'Напишите в чатик ShadowRun-2020, что достигли высшего уровня "Альтруизм: волонтер Комкона"',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: -1, conditionMax: 3, conditionMin: 0, scale: 'individualism' },
      { change: 1, conditionMax: 2, conditionMin: 0, scale: 'mind' },
    ],
  },
  {
    id: '628f86b1-6486-11ea-a399-09a05ee6ca4f',
    description: 'Купите на ярмарке какую-нибудь безделушку и подарите ее кому захотите.\n',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: 1, conditionMax: -1, conditionMin: -3, scale: 'control' }],
  },
  {
    id: '628f86b2-6486-11ea-a399-09a05ee6ca4f',
    description: 'Напишите в чатик Комкона восхваление или благодарность его организаторам',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: -1, conditionMax: 3, conditionMin: 0, scale: 'individualism' },
      { change: 1, conditionMax: 1, conditionMin: -1, scale: 'control' },
    ],
  },
  {
    id: '628f86b3-6486-11ea-a399-09a05ee6ca4f',
    description: 'Угостите кого-нибудь сигареткой / глотком напитка.',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: -1, conditionMax: 2, conditionMin: -2, scale: 'mind' }],
  },
  {
    id: '628f86b4-6486-11ea-a399-09a05ee6ca4f',
    description: 'Получите какой-нибудь сувенир, приз или промо.',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: -1, conditionMax: 2, conditionMin: -1, scale: 'mind' },
      { change: -1, conditionMax: 1, conditionMin: -1, scale: 'control' },
    ],
  },
  {
    id: '628f86b5-6486-11ea-a399-09a05ee6ca4f',
    description: 'Стрельните у кого-нибудь сигаретку или глоток напитка.',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: 1, conditionMax: 2, conditionMin: -1, scale: 'mind' }],
  },
  {
    id: '628f86b6-6486-11ea-a399-09a05ee6ca4f',
    description: 'Пригласите на балу или на дискотеке троих разных партнеров',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: 1, conditionMax: 2, conditionMin: 0, scale: 'control' }],
  },
  {
    id: '628f86b7-6486-11ea-a399-09a05ee6ca4f',
    description: 'Выпейте мохито. Если мохито взять негде, можно обойтись спрайтом',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: -1, conditionMax: 3, conditionMin: -2, scale: 'control' },
      { change: -1, conditionMax: 2, conditionMin: -2, scale: 'mind' },
    ],
  },
  {
    id: '628f86b8-6486-11ea-a399-09a05ee6ca4f',
    description: 'Напишите в чатик ShadowRun-2020, что достигли высшего уровня "Эгоизм: любитель мохито"',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: 1, conditionMax: 1, conditionMin: -3, scale: 'individualism' },
      { change: -1, conditionMax: 2, conditionMin: 0, scale: 'control' },
    ],
  },
  {
    id: '628f86b9-6486-11ea-a399-09a05ee6ca4f',
    description: 'Напишите в чатик ShadowRun-2020, что достигли высшего уровня "Игрок: королева полигона"',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: -1, conditionMax: 0, conditionMin: -2, scale: 'mind' },
      { change: 1, conditionMax: 2, conditionMin: 0, scale: 'individualism' },
    ],
  },
  {
    id: '628f86ba-6486-11ea-a399-09a05ee6ca4f',
    description: 'Напишите в чатик Комкона, на какие игры едете в будущем году',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: 1, conditionMax: 1, conditionMin: -3, scale: 'individualism' }],
  },
  {
    id: '628f86bb-6486-11ea-a399-09a05ee6ca4f',
    description: 'Примите участие в ролевой игре на конвенте\n',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: 1, conditionMax: 1, conditionMin: -1, scale: 'violence' }],
  },
  {
    id: '628f86bc-6486-11ea-a399-09a05ee6ca4f',
    description: 'Сходите на презентацию игры будущего сезона',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: -1, conditionMax: 2, conditionMin: 0, scale: 'violence' },
      { change: -1, conditionMax: 3, conditionMin: 1, scale: 'individualism' },
    ],
  },
  {
    id: '628f86bd-6486-11ea-a399-09a05ee6ca4f',
    description: 'Сходите на концерт, представление или кулуарное выступление.\n',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: 1, conditionMax: 2, conditionMin: -2, scale: 'individualism' }],
  },
  {
    id: '628f86be-6486-11ea-a399-09a05ee6ca4f',
    description: 'Сыграйте с кем-нибудь в настольную игру.',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: 1, conditionMax: 1, conditionMin: -1, scale: 'mind' },
      { change: 1, conditionMax: 1, conditionMin: -1, scale: 'individualism' },
    ],
  },
  {
    id: '628f86bf-6486-11ea-a399-09a05ee6ca4f',
    description: 'Напишите в чатик Комкона, какую игру вы хотели бы когда-нибудь помастерить.',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: 1, conditionMax: 0, conditionMin: -2, scale: 'violence' }],
  },
  {
    id: '628f86c0-6486-11ea-a399-09a05ee6ca4f',
    description: 'Сагитируйте кого-нибудь подать заявку на любую игру по вашему выбору',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: -1, conditionMax: 1, conditionMin: -1, scale: 'individualism' },
      { change: 1, conditionMax: -1, conditionMin: -3, scale: 'violence' },
    ],
  },
  {
    id: '628f86c1-6486-11ea-a399-09a05ee6ca4f',
    description: 'Напишите в чатик ShadowRun-2020, что достигли высшего уровня "Мастер: главмастер"',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: 1, conditionMax: 2, conditionMin: -2, scale: 'violence' },
      { change: 1, conditionMax: 2, conditionMin: -2, scale: 'mind' },
    ],
  },
  {
    id: '628f86c2-6486-11ea-a399-09a05ee6ca4f',
    description: 'Напишите в чатик ShadowRun-2020, что достигли высшего уровня "Тусовка: гиена коврочата"',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: -1, conditionMax: 1, conditionMin: -1, scale: 'mind' }],
  },
  {
    id: '628f86c3-6486-11ea-a399-09a05ee6ca4f',
    description: 'Проводите девушку/юношу до палатки (зачеркнуто) комнаты. Входить не обязательно',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: 1, conditionMax: 0, conditionMin: -2, scale: 'violence' },
      { change: -1, conditionMax: 2, conditionMin: 0, scale: 'mind' },
    ],
  },
  {
    id: '628f86c4-6486-11ea-a399-09a05ee6ca4f',
    description: 'Побывайте на семинаре по актерскому мастерству или работе с антуражем',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: 1, conditionMax: 1, conditionMin: -1, scale: 'control' }],
  },
  {
    id: '628f86c5-6486-11ea-a399-09a05ee6ca4f',
    description: 'Напишите в чатик Комкона ролевую байку про игроков',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: -1, conditionMax: 3, conditionMin: 1, scale: 'violence' },
      { change: -1, conditionMax: 0, conditionMin: -2, scale: 'mind' },
    ],
  },
  {
    id: '628f86c6-6486-11ea-a399-09a05ee6ca4f',
    description: 'Побывайте на балу или дискотеке',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: -1, conditionMax: 3, conditionMin: 1, scale: 'mind' }],
  },
  {
    id: '628f86c7-6486-11ea-a399-09a05ee6ca4f',
    description: 'Напишите в чатик Комкона ролевую байку про мастеров',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: 1, conditionMax: -1, conditionMin: -3, scale: 'violence' },
      { change: 1, conditionMax: 2, conditionMin: 0, scale: 'mind' },
    ],
  },
  {
    id: '628f86c8-6486-11ea-a399-09a05ee6ca4f',
    description: 'Побывайте на семинаре по АХЧ',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: 1, conditionMax: 2, conditionMin: 0, scale: 'control' }],
  },
  {
    id: '628f86c9-6486-11ea-a399-09a05ee6ca4f',
    description: 'Выступите на семинаре с вопросами к докладчику или критикой его позиции',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: -1, conditionMax: 0, conditionMin: -2, scale: 'mind' },
      { change: 1, conditionMax: 1, conditionMin: -1, scale: 'violence' },
    ],
  },
  {
    id: '628f86ca-6486-11ea-a399-09a05ee6ca4f',
    description: 'Напишите в чатик ShadowRun-2020, что достигли высшего уровня "Учеба: мастер тысячника"',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: 1, conditionMax: 1, conditionMin: -1, scale: 'mind' },
      { change: -1, conditionMax: 0, conditionMin: -2, scale: 'control' },
    ],
  },
  {
    id: '628f86cb-6486-11ea-a399-09a05ee6ca4f',
    description: 'Напишите в чатик ShadowRun-2020, что достигли высшего уровня "Пьянство: пил элберетовку и выжил"',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: 1, conditionMax: 0, conditionMin: -2, scale: 'control' },
      { change: -1, conditionMax: 3, conditionMin: 1, scale: 'violence' },
    ],
  },
  {
    id: '628f86cc-6486-11ea-a399-09a05ee6ca4f',
    description:
      'Смешайте пять первых попавшихся спиртных напитка и выпейте получившийся коктейль. Если у вас нет напитков - попросите у других',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: -1, conditionMax: 3, conditionMin: 1, scale: 'control' }],
  },
  {
    id: '628f86cd-6486-11ea-a399-09a05ee6ca4f',
    description: 'Напишите в чатик Комкона любую байку про ролевое пьянство',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: -1, conditionMax: 2, conditionMin: 0, scale: 'violence' },
      { change: 1, conditionMax: 0, conditionMin: -2, scale: 'control' },
    ],
  },
  {
    id: '628f86ce-6486-11ea-a399-09a05ee6ca4f',
    description: 'Выйдите покурить или подышать свежим воздухом не менее чем на 5 минут\n',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: -1, conditionMax: 0, conditionMin: -2, scale: 'individualism' }],
  },
  {
    id: '628f86cf-6486-11ea-a399-09a05ee6ca4f',
    description: 'Скажите тост за успех ролевой игры. Любой на ваши выбор\n',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: -1, conditionMax: 2, conditionMin: 0, scale: 'control' }],
  },
  {
    id: '628f86d0-6486-11ea-a399-09a05ee6ca4f',
    description: 'Когда вам предложат налить, попросите налить безалкогольного',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: 1, conditionMax: -1, conditionMin: -3, scale: 'violence' },
      { change: 1, conditionMax: 1, conditionMin: -1, scale: 'individualism' },
    ],
  },
  {
    id: '628f86d1-6486-11ea-a399-09a05ee6ca4f',
    description: 'Проведите час в пьющей компании, не выпив ни глотка спиртного',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: 1, conditionMax: 2, conditionMin: 0, scale: 'control' },
      { change: 1, conditionMax: 2, conditionMin: 0, scale: 'violence' },
    ],
  },
  {
    id: '628f86d2-6486-11ea-a399-09a05ee6ca4f',
    description: 'Напишите в чатик Комкона порицание ролевому пьянству',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: 1, conditionMax: 2, conditionMin: 0, scale: 'violence' }],
  },
  {
    id: '628f86d3-6486-11ea-a399-09a05ee6ca4f',
    description: 'Напишите в чатик ShadowRun-2020, что достигли высшего уровня "Трезвость: не пью даже для запаха"',
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
    description: 'Волонтер Комкона',
    triggers: [
      {
        id: '626605b0-6486-11ea-a399-09a05ee6ca4f',
        description: 'Надо помогать другим. Мы все участники Комкона!\n',
        kind: 'principle',
        crysises: [1],
        shifts: [],
      },
      {
        id: '626605b1-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы отказались помочь, имея к тому возможность',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: 1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'violence',
          },
        ],
      },
    ],
  },
  {
    value: -3,
    scale: 'violence',
    description: 'Альтруист 80lvl',
    triggers: [
      {
        id: '626605b2-6486-11ea-a399-09a05ee6ca4f',
        description: 'Нельзя обесценивать ничей труд! Даже если очень хочется.',
        kind: 'principle',
        crysises: [2],
        shifts: [],
      },
      {
        id: '626605b3-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы отказались помочь, имея к тому возможность',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'violence' },
          { change: -1, conditionMax: 3, conditionMin: 1, scale: 'control' },
        ],
      },
      {
        id: '626605b4-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы оказали помощь в каком-то деле',
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
    description: 'Альтруист 40lvl',
    triggers: [
      {
        id: '626605b5-6486-11ea-a399-09a05ee6ca4f',
        description: 'Если кто-то ссорится, их надо примирить',
        kind: 'principle',
        crysises: [3],
        shifts: [],
      },
      {
        id: '626605b6-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы отказались помочь, имея к тому возможность',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'violence' },
          { change: 1, conditionMax: 0, conditionMin: -2, scale: 'control' },
        ],
      },
      {
        id: '626605b7-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы оказали помощь в каком-то деле',
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
    description: 'Альтруист 20lvl',
    triggers: [
      {
        id: '626605b8-6486-11ea-a399-09a05ee6ca4f',
        description: 'Нужды друзей важнее, чем просьбы дальних знакомых',
        kind: 'principle',
        crysises: [4],
        shifts: [],
      },
      {
        id: '626605b9-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы отказались помочь, имея к тому возможность',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'violence' },
          { change: 1, conditionMax: 0, conditionMin: -2, scale: 'individualism' },
        ],
      },
      {
        id: '62662cc0-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы оказали помощь в каком-то деле',
        kind: 'action',
        crysises: [],
        shifts: [{ change: -1, conditionMax: 10, conditionMin: -10, scale: 'violence' }],
      },
    ],
  },
  {
    value: 0,
    scale: 'violence',
    description: 'Своя рубашка ближе к телу',
    triggers: [
      {
        id: '62662cc1-6486-11ea-a399-09a05ee6ca4f',
        description: 'Не проси о помощи или услуге тех, с кем не знаком\n',
        kind: 'principle',
        crysises: [5],
        shifts: [],
      },
      {
        id: '62662cc2-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы отказались помочь, имея к тому возможность',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'violence' },
          { change: 1, conditionMax: 1, conditionMin: -1, scale: 'mind' },
        ],
      },
      {
        id: '62662cc3-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы оказали помощь в каком-то деле',
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
    description: 'Эгоист 20lvl\n',
    triggers: [
      {
        id: '62662cc4-6486-11ea-a399-09a05ee6ca4f',
        description: 'За услугу всегда надо отвечать услугой\n',
        kind: 'principle',
        crysises: [6],
        shifts: [],
      },
      {
        id: '62662cc5-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы отказались помочь, имея к тому возможность',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'violence' },
          { change: 1, conditionMax: 1, conditionMin: -1, scale: 'control' },
        ],
      },
      {
        id: '62662cc6-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы оказали помощь в каком-то деле',
        kind: 'action',
        crysises: [],
        shifts: [{ change: -1, conditionMax: 10, conditionMin: -10, scale: 'violence' }],
      },
    ],
  },
  {
    value: 2,
    scale: 'violence',
    description: 'Эгоист 40lvl\n',
    triggers: [
      {
        id: '62662cc7-6486-11ea-a399-09a05ee6ca4f',
        description: 'Не стоит давать непрошеных советов, а вот спросить чужого может быть полезно',
        kind: 'principle',
        crysises: [7],
        shifts: [],
      },
      {
        id: '62662cc8-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы отказались помочь, имея к тому возможность',
        kind: 'action',
        crysises: [],
        shifts: [{ change: 1, conditionMax: 10, conditionMin: -10, scale: 'violence' }],
      },
      {
        id: '62662cc9-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы оказали помощь в каком-то деле',
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
    description: 'Эгоист 80lvl\n',
    triggers: [
      {
        id: '62662cca-6486-11ea-a399-09a05ee6ca4f',
        description: 'Хорошее дело - угоститься от щедрот ближнего своего\n',
        kind: 'principle',
        crysises: [8],
        shifts: [],
      },
      {
        id: '62662ccb-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы отказались помочь, имея к тому возможность',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'violence' },
          { change: -1, conditionMax: 0, conditionMin: -2, scale: 'mind' },
        ],
      },
      {
        id: '62662ccc-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы оказали помощь в каком-то деле',
        kind: 'action',
        crysises: [],
        shifts: [{ change: -1, conditionMax: 10, conditionMin: -10, scale: 'violence' }],
      },
    ],
  },
  {
    value: 4,
    scale: 'violence',
    description: 'Любитель мохито',
    triggers: [
      {
        id: '62662ccd-6486-11ea-a399-09a05ee6ca4f',
        description: 'Надо стараться заставить делать твою работу других людей\n',
        kind: 'principle',
        crysises: [9],
        shifts: [],
      },
      {
        id: '62662cce-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы оказали помощь в каком-то деле',
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
    description: 'Королева полигона',
    triggers: [
      {
        id: '62662ccf-6486-11ea-a399-09a05ee6ca4f',
        description: '\nОбсуждая будущую игру, надо общаться в образе своего персонажа',
        kind: 'principle',
        crysises: [10],
        shifts: [],
      },
      {
        id: '62662cd0-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы посетили семинар или другое мероприятие для мастеров и капитанов команд',
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
    description: 'На пути к славе',
    triggers: [
      {
        id: '62662cd1-6486-11ea-a399-09a05ee6ca4f',
        description: '\nОбсуждая будущую игру, надо общаться в образе своего персонажа',
        kind: 'principle',
        crysises: [11],
        shifts: [],
      },
      {
        id: '62662cd2-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы посетили семинар или другое мероприятие для мастеров и капитанов команд',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'control' },
          { change: -1, conditionMax: 3, conditionMin: 1, scale: 'individualism' },
        ],
      },
      {
        id: '62662cd3-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы посетили семинар или другое мероприятие для игроков, или развлекательное мероприятие',
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
    description: 'В поисках коровы\n',
    triggers: [
      {
        id: '62662cd4-6486-11ea-a399-09a05ee6ca4f',
        description: 'Нельзя пропускать презентации игр будущего сезона, если вы планируете на них ехать',
        kind: 'principle',
        crysises: [12],
        shifts: [],
      },
      {
        id: '62662cd5-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы посетили семинар или другое мероприятие для мастеров и капитанов команд',
        kind: 'action',
        crysises: [],
        shifts: [{ change: 1, conditionMax: 10, conditionMin: -10, scale: 'control' }],
      },
      {
        id: '62662cd6-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы посетили семинар или другое мероприятие для игроков, или развлекательное мероприятие',
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
    description: 'Третий лучник в пятом ряду',
    triggers: [
      {
        id: '62662cd7-6486-11ea-a399-09a05ee6ca4f',
        description: 'Нельзя пропускать семинары по актерскому мастерству, если у вас есть возможность их посетить',
        kind: 'principle',
        crysises: [13],
        shifts: [],
      },
      {
        id: '62662cd8-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы посетили семинар или другое мероприятие для мастеров и капитанов команд',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'control' },
          { change: 1, conditionMax: 2, conditionMin: 0, scale: 'violence' },
        ],
      },
      {
        id: '62662cd9-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы посетили семинар или другое мероприятие для игроков, или развлекательное мероприятие',
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
    description: 'Игротехник - и не мастер, и не игрок',
    triggers: [
      {
        id: '62662cda-6486-11ea-a399-09a05ee6ca4f',
        description: 'Нельзя не поздороваться с каждым знакомым, кого еще не встречал на этом Комконе',
        kind: 'principle',
        crysises: [14],
        shifts: [],
      },
      {
        id: '62662cdb-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы посетили семинар или другое мероприятие для мастеров и капитанов команд',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'control' },
          { change: 1, conditionMax: 1, conditionMin: -1, scale: 'mind' },
        ],
      },
      {
        id: '62662cdc-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы посетили семинар или другое мероприятие для игроков, или развлекательное мероприятие',
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
    description: 'Региональный мастер',
    triggers: [
      {
        id: '62662cdd-6486-11ea-a399-09a05ee6ca4f',
        description: 'Нельзя пропускать семинары по сюжетостроению',
        kind: 'principle',
        crysises: [15],
        shifts: [],
      },
      {
        id: '62662cde-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы посетили семинар или другое мероприятие для мастеров и капитанов команд',
        kind: 'action',
        crysises: [],
        shifts: [{ change: 1, conditionMax: 10, conditionMin: -10, scale: 'control' }],
      },
      {
        id: '62662cdf-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы посетили семинар или другое мероприятие для игроков, или развлекательное мероприятие',
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
    description: 'Модельный мастер',
    triggers: [
      {
        id: '62662ce0-6486-11ea-a399-09a05ee6ca4f',
        description: 'Нельзя пропускать семинары по мастерскому АХЧ',
        kind: 'principle',
        crysises: [16],
        shifts: [],
      },
      {
        id: '62662ce1-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы посетили семинар или другое мероприятие для мастеров и капитанов команд',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'control' },
          { change: -1, conditionMax: 0, conditionMin: -2, scale: 'individualism' },
        ],
      },
      {
        id: '62662ce2-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы посетили семинар или другое мероприятие для игроков, или развлекательное мероприятие',
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
    description: 'Мастер по АХЧ\n',
    triggers: [
      {
        id: '62662ce3-6486-11ea-a399-09a05ee6ca4f',
        description: 'Если вы делаете игру или едете на нее, надо приглашать собеседников. Если есть места, конечно\n',
        kind: 'principle',
        crysises: [17],
        shifts: [],
      },
      {
        id: '62662ce4-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы посетили семинар или другое мероприятие для мастеров и капитанов команд',
        kind: 'action',
        crysises: [],
        shifts: [{ change: 1, conditionMax: 10, conditionMin: -10, scale: 'control' }],
      },
      {
        id: '62662ce5-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы посетили семинар или другое мероприятие для игроков, или развлекательное мероприятие',
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
    description: 'Главмастер\n',
    triggers: [
      {
        id: '62662ce6-6486-11ea-a399-09a05ee6ca4f',
        description: 'Если вы делаете игру или едете на нее, надо приглашать собеседников. Если есть места, конечно\n',
        kind: 'principle',
        crysises: [18],
        shifts: [],
      },
      {
        id: '62662ce7-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы посетили семинар или другое мероприятие для игроков, или развлекательное мероприятие',
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
    description: 'Гиена Коврочата',
    triggers: [
      {
        id: '62662ce8-6486-11ea-a399-09a05ee6ca4f',
        description: 'Всегда, если есть возможность, ходите на семинары ваших знакомых',
        kind: 'principle',
        crysises: [19],
        shifts: [],
      },
      {
        id: '62662ce9-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы посетили познавательный семинар',
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
    description: 'Душа компании',
    triggers: [
      {
        id: '62662cea-6486-11ea-a399-09a05ee6ca4f',
        description: 'На любом мероприятии надо притусоваться к знакомым',
        kind: 'principle',
        crysises: [20],
        shifts: [],
      },
      {
        id: '62662ceb-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы посетили познавательный семинар',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'individualism' },
          { change: 1, conditionMax: 2, conditionMin: 0, scale: 'mind' },
        ],
      },
      {
        id: '62662cec-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы посетили развлекательное мероприятие',
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
    description: 'Знаток игровых баек\n',
    triggers: [
      {
        id: '62662ced-6486-11ea-a399-09a05ee6ca4f',
        description: 'На любом мероприятии надо притусоваться к знакомым',
        kind: 'principle',
        crysises: [21],
        shifts: [],
      },
      {
        id: '62662cee-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы посетили познавательный семинар',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'individualism' },
          { change: -1, conditionMax: 3, conditionMin: 1, scale: 'control' },
        ],
      },
      {
        id: '62662cef-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы посетили развлекательное мероприятие',
        kind: 'action',
        crysises: [],
        shifts: [{ change: -1, conditionMax: 10, conditionMin: -10, scale: 'individualism' }],
      },
    ],
  },
  {
    value: -1,
    scale: 'individualism',
    description: 'Завсегдатай балов',
    triggers: [
      {
        id: '62662cf0-6486-11ea-a399-09a05ee6ca4f',
        description: 'Принимая пищу в столовой или в баре, обязательно подсаживайтесь к компании\n',
        kind: 'principle',
        crysises: [22],
        shifts: [],
      },
      {
        id: '62662cf1-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы посетили познавательный семинар',
        kind: 'action',
        crysises: [],
        shifts: [{ change: 1, conditionMax: 10, conditionMin: -10, scale: 'individualism' }],
      },
      {
        id: '62662cf2-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы посетили развлекательное мероприятие',
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
    description: 'Ум питай знанием, а чувство общением\n',
    triggers: [
      {
        id: '62662cf3-6486-11ea-a399-09a05ee6ca4f',
        description: 'Если хотите поговорить с кем-то о своем, надо делать это в кулуарах, а не во время семинаров\n',
        kind: 'principle',
        crysises: [23],
        shifts: [],
      },
      {
        id: '62662cf4-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы посетили познавательный семинар',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'individualism' },
          { change: -1, conditionMax: 3, conditionMin: 1, scale: 'control' },
        ],
      },
      {
        id: '62662cf5-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы посетили развлекательное мероприятие',
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
    description: 'Посетитель семинара',
    triggers: [
      {
        id: '62662cf6-6486-11ea-a399-09a05ee6ca4f',
        description: 'Принимая пищу в столовой или в баре, обязательно садитесь в стороне от компании',
        kind: 'principle',
        crysises: [24],
        shifts: [],
      },
      {
        id: '62662cf7-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы посетили познавательный семинар',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'individualism' },
          { change: 1, conditionMax: 0, conditionMin: -2, scale: 'mind' },
        ],
      },
      {
        id: '62662cf8-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы посетили развлекательное мероприятие',
        kind: 'action',
        crysises: [],
        shifts: [{ change: -1, conditionMax: 10, conditionMin: -10, scale: 'individualism' }],
      },
    ],
  },
  {
    value: 2,
    scale: 'individualism',
    description: 'Участник круглого стола',
    triggers: [
      {
        id: '62662cf9-6486-11ea-a399-09a05ee6ca4f',
        description: 'Лучше посещать семинары без компании, чтоб не отвлекаться',
        kind: 'principle',
        crysises: [25],
        shifts: [],
      },
      {
        id: '62662cfa-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы посетили познавательный семинар',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'individualism' },
          { change: 1, conditionMax: 1, conditionMin: -1, scale: 'violence' },
        ],
      },
      {
        id: '62662cfb-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы посетили развлекательное мероприятие',
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
    description: 'Организатор мероприятия',
    triggers: [
      {
        id: '62662cfc-6486-11ea-a399-09a05ee6ca4f',
        description: 'Лучше посещать семинары без компании, чтоб не отвлекаться',
        kind: 'principle',
        crysises: [26],
        shifts: [],
      },
      {
        id: '62662cfd-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы посетили познавательный семинар',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'individualism' },
          { change: -1, conditionMax: 1, conditionMin: -1, scale: 'control' },
        ],
      },
      {
        id: '62662cfe-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы посетили развлекательное мероприятие',
        kind: 'action',
        crysises: [],
        shifts: [{ change: -1, conditionMax: 10, conditionMin: -10, scale: 'individualism' }],
      },
    ],
  },
  {
    value: 4,
    scale: 'individualism',
    description: 'Мастер тысячника',
    triggers: [
      {
        id: '62662cff-6486-11ea-a399-09a05ee6ca4f',
        description: 'Нельзя решать спонтанно, куда идти. О том, какое мероприятие посетите, надо знать хотя бы за час до',
        kind: 'principle',
        crysises: [27],
        shifts: [],
      },
      {
        id: '62662d00-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы посетили развлекательное мероприятие',
        kind: 'action',
        crysises: [],
        shifts: [{ change: -1, conditionMax: 10, conditionMin: -10, scale: 'individualism' }],
      },
    ],
  },
  {
    value: -4,
    scale: 'mind',
    description: 'Пил "элберетовку" и выжил',
    triggers: [
      {
        id: '62662d01-6486-11ea-a399-09a05ee6ca4f',
        description: 'Если вам предлагают спиртное, надо соглашаться',
        kind: 'principle',
        crysises: [28],
        shifts: [],
      },
      {
        id: '62662d02-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы поделились с другим человеком спиртным напитком',
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
    description: 'Пьяница в дурацком\n',
    triggers: [
      {
        id: '62662d03-6486-11ea-a399-09a05ee6ca4f',
        description: 'На любую пьянку надо приходить с угощением или бутылкой от себя',
        kind: 'principle',
        crysises: [29],
        shifts: [],
      },
      {
        id: '62662d04-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы поделились с другим человеком безалкогольным напитком',
        kind: 'action',
        crysises: [],
        shifts: [{ change: 1, conditionMax: 10, conditionMin: -10, scale: 'mind' }],
      },
      {
        id: '62662d05-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы поделились с другим человеком спиртным напитком',
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
    description: 'Всегда при себе',
    triggers: [
      {
        id: '62662d06-6486-11ea-a399-09a05ee6ca4f',
        description: 'На каждой пьянке надо минимум раз выпить за прекрасных дам\n',
        kind: 'principle',
        crysises: [30],
        shifts: [],
      },
      {
        id: '62662d07-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы поделились с другим человеком безалкогольным напитком',
        kind: 'action',
        crysises: [],
        shifts: [{ change: 1, conditionMax: 10, conditionMin: -10, scale: 'mind' }],
      },
      {
        id: '62662d08-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы поделились с другим человеком спиртным напитком',
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
    description: 'Спиртное - не раньше ужина\n',
    triggers: [
      { id: '62662d09-6486-11ea-a399-09a05ee6ca4f', description: 'Нельзя пить без тоста', kind: 'principle', crysises: [31], shifts: [] },
      {
        id: '62662d0a-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы поделились с другим человеком безалкогольным напитком',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'mind' },
          { change: 1, conditionMax: 2, conditionMin: 0, scale: 'individualism' },
        ],
      },
      {
        id: '62662d0b-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы поделились с другим человеком спиртным напитком',
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
    description: 'Пью, но в меру',
    triggers: [
      { id: '62662d0c-6486-11ea-a399-09a05ee6ca4f', description: 'Не крепче водки!', kind: 'principle', crysises: [32], shifts: [] },
      {
        id: '62662d0d-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы поделились с другим человеком безалкогольным напитком',
        kind: 'action',
        crysises: [],
        shifts: [{ change: 1, conditionMax: 10, conditionMin: -10, scale: 'mind' }],
      },
      {
        id: '62662d0e-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы поделились с другим человеком спиртным напитком',
        kind: 'action',
        crysises: [],
        shifts: [{ change: -1, conditionMax: 10, conditionMin: -10, scale: 'mind' }],
      },
    ],
  },
  {
    value: 1,
    scale: 'mind',
    description: 'Трезвенник 20lvl',
    triggers: [
      { id: '62662d0f-6486-11ea-a399-09a05ee6ca4f', description: 'Не крепче вина!', kind: 'principle', crysises: [33], shifts: [] },
      {
        id: '62662d10-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы поделились с другим человеком безалкогольным напитком',
        kind: 'action',
        crysises: [],
        shifts: [{ change: 1, conditionMax: 10, conditionMin: -10, scale: 'mind' }],
      },
      {
        id: '62662d11-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы поделились с другим человеком спиртным напитком',
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
    description: 'Трезвенник 40lvl',
    triggers: [
      { id: '62662d12-6486-11ea-a399-09a05ee6ca4f', description: 'Не крепче пива!', kind: 'principle', crysises: [34], shifts: [] },
      {
        id: '62662d13-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы поделились с другим человеком безалкогольным напитком',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'mind' },
          { change: 1, conditionMax: 2, conditionMin: 0, scale: 'control' },
        ],
      },
      {
        id: '62662d14-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы поделились с другим человеком спиртным напитком',
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
    description: 'Трезвенник 80lvl',
    triggers: [
      { id: '62662d15-6486-11ea-a399-09a05ee6ca4f', description: 'Не крепче кефира!', kind: 'principle', crysises: [35], shifts: [] },
      {
        id: '62662d16-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы поделились с другим человеком безалкогольным напитком',
        kind: 'action',
        crysises: [],
        shifts: [
          { change: 1, conditionMax: 10, conditionMin: -10, scale: 'mind' },
          { change: -1, conditionMax: 0, conditionMin: -2, scale: 'individualism' },
        ],
      },
      {
        id: '62662d17-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы поделились с другим человеком спиртным напитком',
        kind: 'action',
        crysises: [],
        shifts: [{ change: -1, conditionMax: 10, conditionMin: -10, scale: 'mind' }],
      },
    ],
  },
  {
    value: 4,
    scale: 'mind',
    description: 'Не нужно пить даже для запаха\n',
    triggers: [
      {
        id: '62662d18-6486-11ea-a399-09a05ee6ca4f',
        description: 'Если вам предлагают спиртное, надо отказываться\n',
        kind: 'principle',
        crysises: [36],
        shifts: [],
      },
      {
        id: '62662d19-6486-11ea-a399-09a05ee6ca4f',
        description: 'Вы поделились с другим человеком спиртным напитком',
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
