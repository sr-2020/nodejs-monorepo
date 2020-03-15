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

export interface EthicAbilityCondition {
  scale: EthicScale;
  value: number;
  abilityId: string;
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
    id: '93cbbb80-631f-11ea-ac14-1dc9f7f29dd9',
    description: 'Напишите в чатик ShadowRun-2020, что достигли высшего уровня "Альтруизм: волонтер Комкона"',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: -1, conditionMax: 3, conditionMin: 0, scale: 'individualism' },
      { change: 1, conditionMax: 2, conditionMin: 0, scale: 'mind' },
    ],
  },
  {
    id: '93cbbb81-631f-11ea-ac14-1dc9f7f29dd9',
    description: 'Купите на ярмарке какую-нибудь безделушку и подарите ее кому захотите.\n',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: 1, conditionMax: -1, conditionMin: -3, scale: 'control' }],
  },
  {
    id: '93cbbb82-631f-11ea-ac14-1dc9f7f29dd9',
    description: 'Напишите в чатик Комкона восхваление или благодарность его организаторам',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: -1, conditionMax: 3, conditionMin: 0, scale: 'individualism' },
      { change: 1, conditionMax: 1, conditionMin: -1, scale: 'control' },
    ],
  },
  {
    id: '93cbbb83-631f-11ea-ac14-1dc9f7f29dd9',
    description: 'Угостите кого-нибудь сигареткой / глотком напитка.',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: -1, conditionMax: 2, conditionMin: -2, scale: 'mind' }],
  },
  {
    id: '93cbbb84-631f-11ea-ac14-1dc9f7f29dd9',
    description: 'Получите какой-нибудь сувенир, приз или промо.',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: -1, conditionMax: 2, conditionMin: -1, scale: 'mind' },
      { change: -1, conditionMax: 1, conditionMin: -1, scale: 'control' },
    ],
  },
  {
    id: '93cbbb85-631f-11ea-ac14-1dc9f7f29dd9',
    description: 'Стрельните у кого-нибудь сигаретку или глоток напитка.',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: 1, conditionMax: 2, conditionMin: -1, scale: 'mind' }],
  },
  {
    id: '93cbbb86-631f-11ea-ac14-1dc9f7f29dd9',
    description: 'Пригласите на балу или на дискотеке троих разных партнеров',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: 1, conditionMax: 2, conditionMin: 0, scale: 'control' }],
  },
  {
    id: '93cbbb87-631f-11ea-ac14-1dc9f7f29dd9',
    description: 'Выпейте мохито. Если мохито взять негде, можно обойтись спрайтом',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: -1, conditionMax: 3, conditionMin: -2, scale: 'control' },
      { change: -1, conditionMax: 2, conditionMin: -2, scale: 'mind' },
    ],
  },
  {
    id: '93cbbb88-631f-11ea-ac14-1dc9f7f29dd9',
    description: 'Напишите в чатик ShadowRun-2020, что достигли высшего уровня "Эгоизм: любитель мохито"',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: 1, conditionMax: 1, conditionMin: -3, scale: 'individualism' },
      { change: -1, conditionMax: 2, conditionMin: 0, scale: 'control' },
    ],
  },
  {
    id: '93cbbb89-631f-11ea-ac14-1dc9f7f29dd9',
    description: 'Напишите в чатик ShadowRun-2020, что достигли высшего уровня "Игрок: королева полигона"',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: -1, conditionMax: 0, conditionMin: -2, scale: 'mind' },
      { change: 1, conditionMax: 2, conditionMin: 0, scale: 'individualism' },
    ],
  },
  {
    id: '93cbbb8a-631f-11ea-ac14-1dc9f7f29dd9',
    description: 'Напишите в чатик Комкона, на какие игры едете в будущем году',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: 1, conditionMax: 1, conditionMin: -3, scale: 'individualism' }],
  },
  {
    id: '93cbbb8b-631f-11ea-ac14-1dc9f7f29dd9',
    description: 'Примите участие в ролевой игре на конвенте\n',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: 1, conditionMax: 1, conditionMin: -1, scale: 'violence' }],
  },
  {
    id: '93cbbb8c-631f-11ea-ac14-1dc9f7f29dd9',
    description: 'Сходите на презентацию игры будущего сезона',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: -1, conditionMax: 2, conditionMin: 0, scale: 'violence' },
      { change: -1, conditionMax: 3, conditionMin: 1, scale: 'individualism' },
    ],
  },
  {
    id: '93cbbb8d-631f-11ea-ac14-1dc9f7f29dd9',
    description: 'Сходите на концерт, представление или кулуарное выступление.\n',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: 1, conditionMax: 2, conditionMin: -2, scale: 'individualism' }],
  },
  {
    id: '93cbbb8e-631f-11ea-ac14-1dc9f7f29dd9',
    description: 'Сыграйте с кем-нибудь в настольную игру.',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: 1, conditionMax: 1, conditionMin: -1, scale: 'mind' },
      { change: 1, conditionMax: 1, conditionMin: -1, scale: 'individualism' },
    ],
  },
  {
    id: '93cbbb8f-631f-11ea-ac14-1dc9f7f29dd9',
    description: 'Напишите в чатик Комкона, какую игру вы хотели бы когда-нибудь помастерить.',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: 1, conditionMax: 0, conditionMin: -2, scale: 'violence' }],
  },
  {
    id: '93cbbb90-631f-11ea-ac14-1dc9f7f29dd9',
    description: 'Сагитируйте кого-нибудь подать заявку на любую игру по вашему выбору',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: -1, conditionMax: 1, conditionMin: -1, scale: 'individualism' },
      { change: 1, conditionMax: -1, conditionMin: -3, scale: 'violence' },
    ],
  },
  {
    id: '93cbbb91-631f-11ea-ac14-1dc9f7f29dd9',
    description: 'Напишите в чатик ShadowRun-2020, что достигли высшего уровня "Мастер: главмастер"',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: 1, conditionMax: 2, conditionMin: -2, scale: 'violence' },
      { change: 1, conditionMax: 2, conditionMin: -2, scale: 'mind' },
    ],
  },
  {
    id: '93cbbb92-631f-11ea-ac14-1dc9f7f29dd9',
    description: 'Напишите в чатик ShadowRun-2020, что достигли высшего уровня "Тусовка: гиена коврочата"',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: -1, conditionMax: 1, conditionMin: -1, scale: 'mind' }],
  },
  {
    id: '93cbbb93-631f-11ea-ac14-1dc9f7f29dd9',
    description: 'Проводите девушку/юношу до палатки (зачеркнуто) комнаты. Входить не обязательно',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: 1, conditionMax: 0, conditionMin: -2, scale: 'violence' },
      { change: -1, conditionMax: 2, conditionMin: 0, scale: 'mind' },
    ],
  },
  {
    id: '93cbbb94-631f-11ea-ac14-1dc9f7f29dd9',
    description: 'Побывайте на семинаре по актерскому мастерству или работе с антуражем',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: 1, conditionMax: 1, conditionMin: -1, scale: 'control' }],
  },
  {
    id: '93cbbb95-631f-11ea-ac14-1dc9f7f29dd9',
    description: 'Напишите в чатик Комкона ролевую байку про игроков',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: -1, conditionMax: 3, conditionMin: 1, scale: 'violence' },
      { change: -1, conditionMax: 0, conditionMin: -2, scale: 'mind' },
    ],
  },
  {
    id: '93cbbb96-631f-11ea-ac14-1dc9f7f29dd9',
    description: 'Побывайте на балу или дискотеке',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: -1, conditionMax: 3, conditionMin: 1, scale: 'mind' }],
  },
  {
    id: '93cbbb97-631f-11ea-ac14-1dc9f7f29dd9',
    description: 'Напишите в чатик Комкона ролевую байку про мастеров',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: 1, conditionMax: -1, conditionMin: -3, scale: 'violence' },
      { change: 1, conditionMax: 2, conditionMin: 0, scale: 'mind' },
    ],
  },
  {
    id: '93cbbb98-631f-11ea-ac14-1dc9f7f29dd9',
    description: 'Побывайте на семинаре по АХЧ',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: 1, conditionMax: 2, conditionMin: 0, scale: 'control' }],
  },
  {
    id: '93cbbb99-631f-11ea-ac14-1dc9f7f29dd9',
    description: 'Выступите на семинаре с вопросами к докладчику или критикой его позиции',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: -1, conditionMax: 0, conditionMin: -2, scale: 'mind' },
      { change: 1, conditionMax: 1, conditionMin: -1, scale: 'violence' },
    ],
  },
  {
    id: '93cbbb9a-631f-11ea-ac14-1dc9f7f29dd9',
    description: 'Напишите в чатик ShadowRun-2020, что достигли высшего уровня "Учеба: мастер тысячника"',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: 1, conditionMax: 1, conditionMin: -1, scale: 'mind' },
      { change: -1, conditionMax: 0, conditionMin: -2, scale: 'control' },
    ],
  },
  {
    id: '93cbbb9b-631f-11ea-ac14-1dc9f7f29dd9',
    description: 'Напишите в чатик ShadowRun-2020, что достигли высшего уровня "Пьянство: пил элберетовку и выжил"',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: 1, conditionMax: 0, conditionMin: -2, scale: 'control' },
      { change: -1, conditionMax: 3, conditionMin: 1, scale: 'violence' },
    ],
  },
  {
    id: '93cbbb9c-631f-11ea-ac14-1dc9f7f29dd9',
    description:
      'Смешайте пять первых попавшихся спиртных напитка и выпейте получившийся коктейль. Если у вас нет напитков - попросите у других',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: -1, conditionMax: 3, conditionMin: 1, scale: 'control' }],
  },
  {
    id: '93cbbb9d-631f-11ea-ac14-1dc9f7f29dd9',
    description: 'Напишите в чатик Комкона любую байку про ролевое пьянство',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: -1, conditionMax: 2, conditionMin: 0, scale: 'violence' },
      { change: 1, conditionMax: 0, conditionMin: -2, scale: 'control' },
    ],
  },
  {
    id: '93cbbb9e-631f-11ea-ac14-1dc9f7f29dd9',
    description: 'Выйдите покурить или подышать свежим воздухом не менее чем на 5 минут\n',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: -1, conditionMax: 0, conditionMin: -2, scale: 'individualism' }],
  },
  {
    id: '93cbbb9f-631f-11ea-ac14-1dc9f7f29dd9',
    description: 'Скажите тост за успех ролевой игры. Любой на ваши выбор\n',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: -1, conditionMax: 2, conditionMin: 0, scale: 'control' }],
  },
  {
    id: '93cbbba0-631f-11ea-ac14-1dc9f7f29dd9',
    description: 'Когда вам предложат налить, попросите налить безалкогольного',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: 1, conditionMax: -1, conditionMin: -3, scale: 'violence' },
      { change: 1, conditionMax: 1, conditionMin: -1, scale: 'individualism' },
    ],
  },
  {
    id: '93cbbba1-631f-11ea-ac14-1dc9f7f29dd9',
    description: 'Проведите час в пьющей компании, не выпив ни глотка спиртного',
    kind: 'crysis',
    crysises: [],
    shifts: [
      { change: 1, conditionMax: 2, conditionMin: 0, scale: 'control' },
      { change: 1, conditionMax: 2, conditionMin: 0, scale: 'violence' },
    ],
  },
  {
    id: '93cbbba2-631f-11ea-ac14-1dc9f7f29dd9',
    description: 'Напишите в чатик Комкона порицание ролевому пьянству',
    kind: 'crysis',
    crysises: [],
    shifts: [{ change: 1, conditionMax: 2, conditionMin: 0, scale: 'violence' }],
  },
  {
    id: '93cbbba3-631f-11ea-ac14-1dc9f7f29dd9',
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
        id: '93a1ec60-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Надо помогать другим. Мы все участники Комкона!\n',
        kind: 'principle',
        crysises: [1],
        shifts: [],
      },
      {
        id: '93a1ec61-631f-11ea-ac14-1dc9f7f29dd9',
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
        id: '93a1ec62-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Нельзя обесценивать ничей труд! Даже если очень хочется.',
        kind: 'principle',
        crysises: [2],
        shifts: [],
      },
      {
        id: '93a1ec63-631f-11ea-ac14-1dc9f7f29dd9',
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
          {
            change: -1,
            conditionMax: 3,
            conditionMin: 1,
            scale: 'control',
          },
        ],
      },
      {
        id: '93a1ec64-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы оказали помощь в каком-то деле',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: -1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'violence',
          },
          {
            change: 1,
            conditionMax: 1,
            conditionMin: -1,
            scale: 'individualism',
          },
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
        id: '93a1ec65-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Если кто-то ссорится, их надо примирить',
        kind: 'principle',
        crysises: [3],
        shifts: [],
      },
      {
        id: '93a1ec66-631f-11ea-ac14-1dc9f7f29dd9',
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
          {
            change: 1,
            conditionMax: 0,
            conditionMin: -2,
            scale: 'control',
          },
        ],
      },
      {
        id: '93a1ec67-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы оказали помощь в каком-то деле',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: -1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'violence',
          },
          {
            change: -1,
            conditionMax: 3,
            conditionMin: 1,
            scale: 'control',
          },
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
        id: '93a1ec68-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Нужды друзей важнее, чем просьбы дальних знакомых',
        kind: 'principle',
        crysises: [4],
        shifts: [],
      },
      {
        id: '93a1ec69-631f-11ea-ac14-1dc9f7f29dd9',
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
          {
            change: 1,
            conditionMax: 0,
            conditionMin: -2,
            scale: 'individualism',
          },
        ],
      },
      {
        id: '93a1ec6a-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы оказали помощь в каком-то деле',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: -1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'violence',
          },
        ],
      },
    ],
  },
  {
    value: 0,
    scale: 'violence',
    description: 'Своя рубашка ближе к телу',
    triggers: [
      {
        id: '93a1ec6b-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Не проси о помощи или услуге тех, с кем не знаком\n',
        kind: 'principle',
        crysises: [5],
        shifts: [],
      },
      {
        id: '93a1ec6c-631f-11ea-ac14-1dc9f7f29dd9',
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
          {
            change: 1,
            conditionMax: 1,
            conditionMin: -1,
            scale: 'mind',
          },
        ],
      },
      {
        id: '93a1ec6d-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы оказали помощь в каком-то деле',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: -1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'violence',
          },
          {
            change: -1,
            conditionMax: 3,
            conditionMin: 1,
            scale: 'individualism',
          },
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
        id: '93a1ec6e-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'За услугу всегда надо отвечать услугой\n',
        kind: 'principle',
        crysises: [6],
        shifts: [],
      },
      {
        id: '93a1ec6f-631f-11ea-ac14-1dc9f7f29dd9',
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
          {
            change: 1,
            conditionMax: 1,
            conditionMin: -1,
            scale: 'control',
          },
        ],
      },
      {
        id: '93a1ec70-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы оказали помощь в каком-то деле',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: -1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'violence',
          },
        ],
      },
    ],
  },
  {
    value: 2,
    scale: 'violence',
    description: 'Эгоист 40lvl\n',
    triggers: [
      {
        id: '93a1ec71-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Не стоит давать непрошеных советов, а вот спросить чужого может быть полезно',
        kind: 'principle',
        crysises: [7],
        shifts: [],
      },
      {
        id: '93a1ec72-631f-11ea-ac14-1dc9f7f29dd9',
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
      {
        id: '93a1ec73-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы оказали помощь в каком-то деле',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: -1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'violence',
          },
          {
            change: 1,
            conditionMax: 2,
            conditionMin: 0,
            scale: 'mind',
          },
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
        id: '93a1ec74-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Хорошее дело - угоститься от щедрот ближнего своего\n',
        kind: 'principle',
        crysises: [8],
        shifts: [],
      },
      {
        id: '93a1ec75-631f-11ea-ac14-1dc9f7f29dd9',
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
          {
            change: -1,
            conditionMax: 0,
            conditionMin: -2,
            scale: 'mind',
          },
        ],
      },
      {
        id: '93a1ec76-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы оказали помощь в каком-то деле',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: -1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'violence',
          },
        ],
      },
    ],
  },
  {
    value: 4,
    scale: 'violence',
    description: 'Любитель мохито',
    triggers: [
      {
        id: '93a1ec77-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Надо стараться заставить делать твою работу других людей\n',
        kind: 'principle',
        crysises: [9],
        shifts: [],
      },
      {
        id: '93a1ec78-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы оказали помощь в каком-то деле',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: -1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'violence',
          },
          {
            change: -1,
            conditionMax: 1,
            conditionMin: -1,
            scale: 'mind',
          },
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
        id: '93a1ec79-631f-11ea-ac14-1dc9f7f29dd9',
        description: '\nОбсуждая будущую игру, надо общаться в образе своего персонажа',
        kind: 'principle',
        crysises: [10],
        shifts: [],
      },
      {
        id: '93a1ec7a-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы посетили семинар или другое мероприятие для мастеров и капитанов команд',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: 1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'control',
          },
          {
            change: -1,
            conditionMax: 3,
            conditionMin: 1,
            scale: 'violence',
          },
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
        id: '93a1ec7b-631f-11ea-ac14-1dc9f7f29dd9',
        description: '\nОбсуждая будущую игру, надо общаться в образе своего персонажа',
        kind: 'principle',
        crysises: [11],
        shifts: [],
      },
      {
        id: '93a1ec7c-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы посетили семинар или другое мероприятие для игроков, или развлекательное мероприятие',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: 1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'control',
          },
          {
            change: -1,
            conditionMax: 3,
            conditionMin: 1,
            scale: 'individualism',
          },
        ],
      },
      {
        id: '93a1ec7d-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы посетили семинар или другое мероприятие для мастеров и капитанов команд',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: -1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'control',
          },
          {
            change: -1,
            conditionMax: 3,
            conditionMin: 1,
            scale: 'violence',
          },
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
        id: '93a1ec7e-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Нельзя пропускать презентации игр будущего сезона, если вы планируете на них ехать',
        kind: 'principle',
        crysises: [12],
        shifts: [],
      },
      {
        id: '93a1ec7f-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы посетили семинар или другое мероприятие для игроков, или развлекательное мероприятие',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: 1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'control',
          },
        ],
      },
      {
        id: '93a1ec80-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы посетили семинар или другое мероприятие для мастеров и капитанов команд',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: -1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'control',
          },
          {
            change: 1,
            conditionMax: 1,
            conditionMin: -1,
            scale: 'individualism',
          },
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
        id: '93a1ec81-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Нельзя пропускать семинары по актерскому мастерству, если у вас есть возможность их посетить',
        kind: 'principle',
        crysises: [13],
        shifts: [],
      },
      {
        id: '93a1ec82-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы посетили семинар или другое мероприятие для игроков, или развлекательное мероприятие',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: 1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'control',
          },
          {
            change: 1,
            conditionMax: 2,
            conditionMin: 0,
            scale: 'violence',
          },
        ],
      },
      {
        id: '93a1ec83-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы посетили семинар или другое мероприятие для мастеров и капитанов команд',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: -1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'control',
          },
          {
            change: -1,
            conditionMax: 0,
            conditionMin: -2,
            scale: 'violence',
          },
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
        id: '93a1ec84-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Нельзя не поздороваться с каждым знакомым, кого еще не встречал на этом Комконе',
        kind: 'principle',
        crysises: [14],
        shifts: [],
      },
      {
        id: '93a1ec85-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы посетили семинар или другое мероприятие для игроков, или развлекательное мероприятие',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: 1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'control',
          },
          {
            change: 1,
            conditionMax: 1,
            conditionMin: -1,
            scale: 'mind',
          },
        ],
      },
      {
        id: '93a1ec86-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы посетили семинар или другое мероприятие для мастеров и капитанов команд',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: -1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'control',
          },
          {
            change: -1,
            conditionMax: 3,
            conditionMin: 1,
            scale: 'mind',
          },
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
        id: '93a1ec87-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Нельзя пропускать семинары по сюжетостроению',
        kind: 'principle',
        crysises: [15],
        shifts: [],
      },
      {
        id: '93a1ec88-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы посетили семинар или другое мероприятие для игроков, или развлекательное мероприятие',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: 1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'control',
          },
        ],
      },
      {
        id: '93a1ec89-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы посетили семинар или другое мероприятие для мастеров и капитанов команд',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: -1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'control',
          },
          {
            change: 1,
            conditionMax: -1,
            conditionMin: -3,
            scale: 'individualism',
          },
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
        id: '93a1ec8a-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Нельзя пропускать семинары по мастерскому АХЧ',
        kind: 'principle',
        crysises: [16],
        shifts: [],
      },
      {
        id: '93a1ec8b-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы посетили семинар или другое мероприятие для игроков, или развлекательное мероприятие',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: 1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'control',
          },
          {
            change: -1,
            conditionMax: 0,
            conditionMin: -2,
            scale: 'individualism',
          },
        ],
      },
      {
        id: '93a1ec8c-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы посетили семинар или другое мероприятие для мастеров и капитанов команд',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: -1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'control',
          },
          {
            change: 1,
            conditionMax: 1,
            conditionMin: -1,
            scale: 'mind',
          },
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
        id: '93a1ec8d-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Если вы делаете игру или едете на нее, надо приглашать собеседников. Если есть места, конечно\n',
        kind: 'principle',
        crysises: [17],
        shifts: [],
      },
      {
        id: '93a1ec8e-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы посетили семинар или другое мероприятие для игроков, или развлекательное мероприятие',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: 1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'control',
          },
        ],
      },
      {
        id: '93a1ec8f-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы посетили семинар или другое мероприятие для мастеров и капитанов команд',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: -1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'control',
          },
          {
            change: 1,
            conditionMax: -1,
            conditionMin: -3,
            scale: 'individualism',
          },
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
        id: '93a1ec90-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Если вы делаете игру или едете на нее, надо приглашать собеседников. Если есть места, конечно\n',
        kind: 'principle',
        crysises: [18],
        shifts: [],
      },
      {
        id: '93a1ec91-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы посетили семинар или другое мероприятие для мастеров и капитанов команд',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: -1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'control',
          },
          {
            change: -1,
            conditionMax: 3,
            conditionMin: 1,
            scale: 'violence',
          },
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
        id: '93a1ec92-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Всегда, если есть возможность, ходите на семинары ваших знакомых',
        kind: 'principle',
        crysises: [19],
        shifts: [],
      },
      {
        id: '93a1ec93-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы посетили познавательный семинар',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: 1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'individualism',
          },
          {
            change: 1,
            conditionMax: 0,
            conditionMin: -2,
            scale: 'violence',
          },
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
        id: '93a1ec94-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'На любом мероприятии надо притусоваться к знакомым',
        kind: 'principle',
        crysises: [20],
        shifts: [],
      },
      {
        id: '93a1ec95-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы посетили познавательный семинар',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: 1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'individualism',
          },
          {
            change: 1,
            conditionMax: 2,
            conditionMin: 0,
            scale: 'mind',
          },
        ],
      },
      {
        id: '93a1ec96-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы посетили развлекательное мероприятие',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: -1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'individualism',
          },
          {
            change: 1,
            conditionMax: 0,
            conditionMin: -2,
            scale: 'control',
          },
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
        id: '93a1ec97-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'На любом мероприятии надо притусоваться к знакомым',
        kind: 'principle',
        crysises: [21],
        shifts: [],
      },
      {
        id: '93a1ec98-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы посетили познавательный семинар',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: 1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'individualism',
          },
          {
            change: -1,
            conditionMax: 3,
            conditionMin: 1,
            scale: 'control',
          },
        ],
      },
      {
        id: '93a1ec99-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы посетили развлекательное мероприятие',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: -1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'individualism',
          },
        ],
      },
    ],
  },
  {
    value: -1,
    scale: 'individualism',
    description: 'Завсегдатай балов',
    triggers: [
      {
        id: '93a1ec9a-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Принимая пищу в столовой или в баре, обязательно подсаживайтесь к компании\n',
        kind: 'principle',
        crysises: [22],
        shifts: [],
      },
      {
        id: '93a1ec9b-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы посетили познавательный семинар',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: 1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'individualism',
          },
        ],
      },
      {
        id: '93a1ec9c-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы посетили развлекательное мероприятие',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: -1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'individualism',
          },
          {
            change: -1,
            conditionMax: 1,
            conditionMin: -1,
            scale: 'mind',
          },
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
        id: '93a1ec9d-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Если хотите поговорить с кем-то о своем, надо делать это в кулуарах, а не во время семинаров\n',
        kind: 'principle',
        crysises: [23],
        shifts: [],
      },
      {
        id: '93a1ec9e-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы посетили познавательный семинар',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: 1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'individualism',
          },
          {
            change: -1,
            conditionMax: 3,
            conditionMin: 1,
            scale: 'control',
          },
        ],
      },
      {
        id: '93a1ec9f-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы посетили развлекательное мероприятие',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: -1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'individualism',
          },
          {
            change: 1,
            conditionMax: -1,
            conditionMin: -3,
            scale: 'control',
          },
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
        id: '93a1eca0-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Принимая пищу в столовой или в баре, обязательно садитесь в стороне от компании',
        kind: 'principle',
        crysises: [24],
        shifts: [],
      },
      {
        id: '93a1eca1-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы посетили познавательный семинар',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: 1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'individualism',
          },
          {
            change: 1,
            conditionMax: 0,
            conditionMin: -2,
            scale: 'mind',
          },
        ],
      },
      {
        id: '93a1eca2-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы посетили развлекательное мероприятие',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: -1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'individualism',
          },
        ],
      },
    ],
  },
  {
    value: 2,
    scale: 'individualism',
    description: 'Участник круглого стола',
    triggers: [
      {
        id: '93a1eca3-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Лучше посещать семинары без компании, чтоб не отвлекаться',
        kind: 'principle',
        crysises: [25],
        shifts: [],
      },
      {
        id: '93a1eca4-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы посетили познавательный семинар',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: 1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'individualism',
          },
          {
            change: 1,
            conditionMax: 1,
            conditionMin: -1,
            scale: 'violence',
          },
        ],
      },
      {
        id: '93a1eca5-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы посетили развлекательное мероприятие',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: -1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'individualism',
          },
          {
            change: -1,
            conditionMax: 3,
            conditionMin: 1,
            scale: 'violence',
          },
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
        id: '93a1eca6-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Лучше посещать семинары без компании, чтоб не отвлекаться',
        kind: 'principle',
        crysises: [26],
        shifts: [],
      },
      {
        id: '93a1eca7-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы посетили познавательный семинар',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: 1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'individualism',
          },
          {
            change: -1,
            conditionMax: 1,
            conditionMin: -1,
            scale: 'control',
          },
        ],
      },
      {
        id: '93a1eca8-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы посетили развлекательное мероприятие',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: -1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'individualism',
          },
        ],
      },
    ],
  },
  {
    value: 4,
    scale: 'individualism',
    description: 'Мастер тысячника',
    triggers: [
      {
        id: '93a1eca9-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Нельзя решать спонтанно, куда идти. О том, какое мероприятие посетите, надо знать хотя бы за час до',
        kind: 'principle',
        crysises: [27],
        shifts: [],
      },
      {
        id: '93a1ecaa-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы посетили развлекательное мероприятие',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: -1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'individualism',
          },
        ],
      },
    ],
  },
  {
    value: -4,
    scale: 'mind',
    description: 'Пил "элберетовку" и выжил',
    triggers: [
      {
        id: '93a1ecab-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Если вам предлагают спиртное, надо соглашаться',
        kind: 'principle',
        crysises: [28],
        shifts: [],
      },
      {
        id: '93a1ecac-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы поделились с другим человеком спиртным напитком',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: 1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'mind',
          },
          {
            change: -1,
            conditionMax: 3,
            conditionMin: 1,
            scale: 'violence',
          },
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
        id: '93a1ecad-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'На любую пьянку надо приходить с угощением или бутылкой от себя',
        kind: 'principle',
        crysises: [29],
        shifts: [],
      },
      {
        id: '93a1ecae-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы поделились с другим человеком безалкогольным напитком',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: 1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'mind',
          },
        ],
      },
      {
        id: '93a1ecaf-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы поделились с другим человеком спиртным напитком',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: -1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'mind',
          },
          {
            change: -1,
            conditionMax: 0,
            conditionMin: -2,
            scale: 'individualism',
          },
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
        id: '93a1ecb0-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'На каждой пьянке надо минимум раз выпить за прекрасных дам\n',
        kind: 'principle',
        crysises: [30],
        shifts: [],
      },
      {
        id: '93a21370-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы поделились с другим человеком безалкогольным напитком',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: 1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'mind',
          },
        ],
      },
      {
        id: '93a21371-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы поделились с другим человеком спиртным напитком',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: -1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'mind',
          },
          {
            change: -1,
            conditionMax: 1,
            conditionMin: -1,
            scale: 'control',
          },
        ],
      },
    ],
  },
  {
    value: -1,
    scale: 'mind',
    description: 'Спиртное - не раньше ужина\n',
    triggers: [
      {
        id: '93a21372-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Нельзя пить без тоста',
        kind: 'principle',
        crysises: [31],
        shifts: [],
      },
      {
        id: '93a21373-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы поделились с другим человеком безалкогольным напитком',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: 1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'mind',
          },
          {
            change: 1,
            conditionMax: 2,
            conditionMin: 0,
            scale: 'individualism',
          },
        ],
      },
      {
        id: '93a21374-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы поделились с другим человеком спиртным напитком',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: -1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'mind',
          },
          {
            change: -1,
            conditionMax: 1,
            conditionMin: -1,
            scale: 'violence',
          },
        ],
      },
    ],
  },
  {
    value: 0,
    scale: 'mind',
    description: 'Пью, но в меру',
    triggers: [
      {
        id: '93a21375-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Не крепче водки!',
        kind: 'principle',
        crysises: [32],
        shifts: [],
      },
      {
        id: '93a21376-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы поделились с другим человеком безалкогольным напитком',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: 1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'mind',
          },
        ],
      },
      {
        id: '93a21377-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы поделились с другим человеком спиртным напитком',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: -1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'mind',
          },
        ],
      },
    ],
  },
  {
    value: 1,
    scale: 'mind',
    description: 'Трезвенник 20lvl',
    triggers: [
      {
        id: '93a21378-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Не крепче вина!',
        kind: 'principle',
        crysises: [33],
        shifts: [],
      },
      {
        id: '93a21379-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы поделились с другим человеком безалкогольным напитком',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: 1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'mind',
          },
        ],
      },
      {
        id: '93a2137a-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы поделились с другим человеком спиртным напитком',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: -1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'mind',
          },
          {
            change: 1,
            conditionMax: 0,
            conditionMin: -2,
            scale: 'individualism',
          },
        ],
      },
    ],
  },
  {
    value: 2,
    scale: 'mind',
    description: 'Трезвенник 40lvl',
    triggers: [
      {
        id: '93a2137b-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Не крепче пива!',
        kind: 'principle',
        crysises: [34],
        shifts: [],
      },
      {
        id: '93a2137c-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы поделились с другим человеком безалкогольным напитком',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: 1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'mind',
          },
          {
            change: 1,
            conditionMax: 2,
            conditionMin: 0,
            scale: 'control',
          },
        ],
      },
      {
        id: '93a2137d-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы поделились с другим человеком спиртным напитком',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: -1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'mind',
          },
          {
            change: -1,
            conditionMax: 3,
            conditionMin: 1,
            scale: 'individualism',
          },
        ],
      },
    ],
  },
  {
    value: 3,
    scale: 'mind',
    description: 'Трезвенник 80lvl',
    triggers: [
      {
        id: '93a2137e-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Не крепче кефира!',
        kind: 'principle',
        crysises: [35],
        shifts: [],
      },
      {
        id: '93a2137f-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы поделились с другим человеком безалкогольным напитком',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: 1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'mind',
          },
          {
            change: -1,
            conditionMax: 0,
            conditionMin: -2,
            scale: 'individualism',
          },
        ],
      },
      {
        id: '93a21380-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы поделились с другим человеком спиртным напитком',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: -1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'mind',
          },
        ],
      },
    ],
  },
  {
    value: 4,
    scale: 'mind',
    description: 'Не нужно пить даже для запаха\n',
    triggers: [
      {
        id: '93a21381-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Если вам предлагают спиртное, надо отказываться\n',
        kind: 'principle',
        crysises: [36],
        shifts: [],
      },
      {
        id: '93a21382-631f-11ea-ac14-1dc9f7f29dd9',
        description: 'Вы поделились с другим человеком спиртным напитком',
        kind: 'action',
        crysises: [],
        shifts: [
          {
            change: -1,
            conditionMax: 10,
            conditionMin: -10,
            scale: 'mind',
          },
          {
            change: -1,
            conditionMax: 3,
            conditionMin: 1,
            scale: 'control',
          },
        ],
      },
    ],
  },
];
