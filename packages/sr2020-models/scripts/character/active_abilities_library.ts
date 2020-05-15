import {
  oneTimeRevive,
  dummyAbility,
  hammerOfJustice,
  arrowgant,
  trollton,
  iWillSurvive,
  copyPasteQr,
  absoluteDeathAbility,
  alloHomorusAbility,
  cloudMemoryAbility,
  howMuchItCosts,
  whoNeedsIt,
  howMuchTheRent,
  letMePay,
  letHimPay,
  reRent,
  investigateScoring,
} from './active_abilities';
import {
  useMentalAbility,
  increaseTheMentalProtectionAbility,
  reduceTheMentalProtectionAbility,
  iDontTrustAnybody,
  youDontTrustAnybody,
} from './mental';
import { reviveAbsoluteOnTarget, reviveOnTarget } from './death_and_rebirth';
import { QrType } from '@sr2020/interface/models/qr-code.model';
import { Targetable } from '@sr2020/interface/models/sr2020-character.model';
import {
  discourseGroupAddAbility,
  discourseGroupExcludeAbility,
  chargeLocusAbility,
  discourseGroupAddGuru,
  discourseGroupInquisitor1,
  discourseGroupInquisitor2,
  prophetAbility,
} from './ethics';
import { setAllActiveAbilities } from '@sr2020/sr2020-models/scripts/character/library_registrator';
import { droneEmergencyExit, enterDrone, exitDrone } from '@sr2020/sr2020-models/scripts/character/rigger';

export type TargetType = 'scan' | 'show';

export interface TargetSignature {
  // Human-readable name to e.g. show on button
  name: string;
  allowedTypes: QrType[];
  // Name of field inside data in which client should pass an id of corresponding target
  field: keyof Targetable;
}

const kHealthyBodyTargeted: TargetSignature[] = [
  {
    name: 'Персонаж',
    allowedTypes: ['HEALTHY_BODY'],
    field: 'targetCharacterId',
  },
];

const kNonDeadBodyTargeted: TargetSignature[] = [
  {
    name: 'Персонаж',
    allowedTypes: ['HEALTHY_BODY', 'WOUNDED_BODY'],
    field: 'targetCharacterId',
  },
];

const kAstralBodyTargeted: TargetSignature[] = [
  {
    name: 'Дух',
    allowedTypes: ['ASTRAL_BODY'],
    field: 'targetCharacterId',
  },
];

const kLocusAndPhysicalBody: TargetSignature[] = [
  {
    name: 'Локус',
    allowedTypes: ['locus'],
    field: 'locusId',
  },
  {
    name: 'Персонаж',
    allowedTypes: ['HEALTHY_BODY', 'WOUNDED_BODY', 'CLINICALLY_DEAD_BODY', 'ABSOLUTELY_DEAD_BODY'],
    field: 'targetCharacterId',
  },
];

const kNoTarget: TargetSignature[] = [];

const kMerchandiseQrTypes: QrType[] = [
  'implant',
  'pill',
  'reagent',
  'locus_charge',
  'box',
  'drone',
  'drone_mod',
  'cyberdeck',
  'cyberdeck_mod',
];

const kMerchandiseTargeted: TargetSignature = {
  name: 'Товар',
  allowedTypes: kMerchandiseQrTypes,
  field: 'qrCode',
};

const kBodyStorageTarget: TargetSignature = {
  name: 'Телохранилище',
  allowedTypes: ['body_storage'],
  field: 'bodyStorageId',
};

const kBodyStorageTargeted = [kBodyStorageTarget];

const kDroneAndBodyStorageTargeted: TargetSignature[] = [
  {
    name: 'Дрон',
    allowedTypes: ['drone'],
    field: 'droneId',
  },
  kBodyStorageTarget,
];

export interface ActiveAbility {
  id: string;
  humanReadableName: string;
  description: string;
  target: TargetType;
  targetsSignature: TargetSignature[];
  cooldownMinutes: number;
  prerequisites?: string[];
  minimalEssence: number; // in 0-6 range, not 0-600.
  eventType: string;
}

// Not exported by design, use kAllActiveAbilities instead.
export const kAllActiveAbilitiesList: ActiveAbility[] = [
  {
    id: 'ground-heal-ability',
    humanReadableName: 'Ground Heal',
    description: 'Поднимает одну цель из КС/тяжрана в полные хиты.',
    target: 'scan',
    targetsSignature: [
      {
        name: 'Персонаж',
        allowedTypes: ['WOUNDED_BODY', 'CLINICALLY_DEAD_BODY'],
        field: 'targetCharacterId',
      },
    ],
    cooldownMinutes: 0,
    minimalEssence: 0,
    eventType: oneTimeRevive.name,
  },

  {
    id: 'mugger',
    humanReadableName: 'Грабеж',
    description: '',
    // 60
    // Самурай находит тушку в тяжране, применяет эту абилку, сканирует QR тушки. Со счета тушки переводится самураю 10% нуйен остатка счета тушки. Тушка автоматически переходит в КС. Перевод создается без обоснования. В поле назначение - "добровольное пожертвование".
    // TODO(https://trello.com/c/ihi8Ffmu/320-реализовать-абилку-грабеж): Add proper implementation
    target: 'scan',
    targetsSignature: [
      {
        name: 'Жертва',
        allowedTypes: ['WOUNDED_BODY'],
        field: 'targetCharacterId',
      },
    ],
    cooldownMinutes: 9000,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },

  {
    id: 'absolutely-finish-him',
    humanReadableName: 'Абсолютная смерть',
    description: '',
    // 64
    // добивание до АС (из тяжрана или КС)
    target: 'scan',
    targetsSignature: [
      {
        name: 'Жертва',
        allowedTypes: ['WOUNDED_BODY', 'CLINICALLY_DEAD_BODY'],
        field: 'targetCharacterId',
      },
    ],
    cooldownMinutes: 240,
    minimalEssence: 0,
    eventType: absoluteDeathAbility.name,
  },

  {
    id: 'finish-him',
    humanReadableName: 'добивание тела из тяжрана в КС',
    description: '',
    // 113
    // требует уровня Насилия
    // TODO(https://trello.com/c/RgKWvnBk/322-реализовать-добивание-тела-из-тяжрана-в-кс): Add proper implementation
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 9000,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },

  {
    id: 'enter-vr',
    humanReadableName: 'зайти в Виар',
    description: '',
    // 195
    // дает возможность персонажу зайти в Виар на 2 часа (или сколько-то), кулдаун есть.  Увеличение длительности виара ИЛИ уменьшение кулдауна - спец абилки.
    // TODO(https://trello.com/c/npKNMNV9/323-вход-нахождение-и-выход-из-вр): Add proper implementation
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 9000,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },

  {
    id: 'merge-shaman',
    humanReadableName: 'Merge (техношаман)',
    description: 'Устанавливает спрайт в ноду Хоста Основания',
    // 245
    // Устанавливает спрайт в ноду.
    // Самый простой вариант - это бэкдор, то есть обеспечивает временную возможность работы с Контролем этого хоста из-вне матрицы. Крутота бэкдора зависит от крутоты спрайта.
    //
    // IT: Сканирует комнату данжа, сканирует спрайта, вызов REST Матрицы
    // TODO(https://trello.com/c/e8Y6SinJ/199-реализовать-активные-абилки-влияющие-на-матрицу)
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 30,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },

  {
    id: 'merge-cyberadept',
    humanReadableName: 'Merge (техношаман)',
    description: 'Устанавливает спрайт в ноду Хоста Основания',
    // 246
    // Устанавливает спрайт в ноду.
    // Самый простой вариант - это бэкдор, то есть обеспечивает временную возможность работы с Контролем этого хоста из-вне матрицы. Крутота бэкдора зависит от крутоты спрайта.
    //
    // IT: Сканирует комнату данжа, сканирует спрайта, вызов REST Матрицы
    // TODO(https://trello.com/c/e8Y6SinJ/199-реализовать-активные-абилки-влияющие-на-матрицу)
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 30,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },

  {
    id: 'awareness',
    humanReadableName: 'Насторожиться',
    description:
      'Ты можешь внимательно присмотреться к спрайтам в комнате. И какие-то из них явно не местные! Подозрительно...\n\nОбнаруживает вмерженные (то есть установленные другими хакерами) спрайты в этой ноде',
    // 247
    // Способ поиска чужих спрайтов (например - бэкдоров) в этой ноде хоста Основания.
    //
    // IT: Сканирует комнату данжа, вызов REST Матрицы Кривды, отобразить текст
    // TODO(https://trello.com/c/e8Y6SinJ/199-реализовать-активные-абилки-влияющие-на-матрицу)
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 15,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },

  {
    id: 'exterminatus',
    humanReadableName: 'Экстерминатус',
    description:
      'Ты можешь сконцентрироваться и разрушительный импульс, который уничтожит часть (зависит от Резонанса) спрайтов, вмерженных в эту Ноду\n',
    // 248
    // Способ уничтожения чужих спрайтов. У нас нет таргетинга, поэтому удаляем рандомых спрайтов, число которых зависит от Резонанса
    //
    // IT: Сканирует комнату данжа, вызов REST Матрицы Кривды, отобразить текст
    // TODO(https://trello.com/c/e8Y6SinJ/199-реализовать-активные-абилки-влияющие-на-матрицу)
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 15,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },

  {
    id: 'looking-for-trouble',
    humanReadableName: 'ГдеСрач?!',
    description:
      'Ты теперь просто нутром чувствуешь, где в Основании можно надрать кому-то цифровой зад!\n\nАктивируется перед входом в Основание (на стойке)\nВыдает список хостов, на которых есть техноманты и уровень группы. Чем сильнее твой Резонанс, тем меньше шансов у них остаться незамеченными',
    // 252
    // Показывает список хостов под атакой в данже Основание. Показывает сумму резонанса группы. Отображает группу, если резонанса достататочно (Кривда придумает формулу)
    //
    // IT: вызов Кривдиного REST, отобразить текст
    // TODO(https://trello.com/c/e8Y6SinJ/199-реализовать-активные-абилки-влияющие-на-матрицу)
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 15,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },

  {
    id: 'chieftain',
    humanReadableName: 'Вождь',
    description:
      'Это самый ценный из даров. Дар подарить Дар другому. Ты можешь разбудить в Госте Основания его суть, его природу, дав ему возможность по-настоящему почувстовать Матрицу. Цель пробудится и сможет стать техномантом',
    // 254
    // Ритуал инициации техноманта.
    //
    // IT: Цель: [+1] к характеристике МожетСтатьТехномантом
    // TODO(https://trello.com/c/EFwxEY3c/324-реализовать-абилку-вождь): Add proper implementation
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 16 * 60,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },

  {
    id: 'oblivion',
    humanReadableName: 'Забвение',
    description:
      'Целевой персонаж не помнит события последней сцены. Работает только, если персонажу не был нанесен урон (снят хотя бы 1 хиты). Если урон был нанесен - цель сообщает об этом.',
    // 288
    // Целевой персонаж забывает события "этой сцены", если персонажу не был нанесен физический урон (снят хотя бы 1 хит) за это время.
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: 60,
    minimalEssence: 0,
    eventType: useMentalAbility.name,
  },

  {
    id: 'full-oblivion',
    humanReadableName: 'Полное Забвение',
    description: 'Персонаж не помнит события последней сцены.',
    // 307
    // Персонаж забывает события "этой сцены", даже если персонажу был нанесен физический урон (снят хотя бы 1 хит) за это время.
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: 60,
    prerequisites: ['oblivion'],
    minimalEssence: 0,
    eventType: useMentalAbility.name,
  },

  {
    id: 'cloud-memory',
    humanReadableName: 'Облачная память ',
    description: 'Целевой персонаж не забывает события перед КС',
    // 274
    //  персонаж не забывает события перед КС, срок действия - 6 часов. Для менталиста эта абилка  активная, кулдаун 4 часа. У целевого персонажа в приложеньке где-то отображается, что он теперь не забывает события перед КС.
    target: 'scan',
    targetsSignature: kHealthyBodyTargeted,
    cooldownMinutes: 240,
    minimalEssence: 0,
    eventType: cloudMemoryAbility.name,
  },

  {
    id: 'tell-me-truth',
    humanReadableName: 'Скажи как есть.',
    description: 'Целевой персонаж честно отвечает на 3 вопроса. \nТы честно отвечаешь на ',
    // 311
    // Цель честно отвечает на 3 вопроса.
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: 60,
    minimalEssence: 0,
    eventType: useMentalAbility.name,
  },

  {
    id: 'lie-to-me',
    humanReadableName: 'Лай ту ми',
    description: 'Целевой персонаж не может скрыть свою ложь.',
    // 312
    // Цель озвучивает какой-то признак (щелканье пальцами, пожимание плечами, заикание), и в течение беседы в следующие 10 минут должна воспроизводить этот признак, если врет.
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: 60,
    minimalEssence: 0,
    eventType: useMentalAbility.name,
  },

  {
    id: 'danila-i-need-help',
    humanReadableName: 'Оказать услугу',
    description:
      'Данила, ай нид хелп. Цель оказывает услугу, даже если это грозит ей средними проблемами (потеря дохода за 1 экономический цикл). Выполнение услуги не должно занимать больше 10 минут.',
    // 295
    // Цель оказывает услугу, даже если это грозит ей средними проблемами (потеря дохода за 1 экономический цикл). Выполнение услуги не должно занимать больше 10 минут.
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: 30,
    minimalEssence: 0,
    eventType: useMentalAbility.name,
  },

  {
    id: 'luke-i-am-your-father',
    humanReadableName: 'Выполнить любую просьбу',
    description:
      'Люк. Я твой отец. Цель выполняет любую просьбу (кроме самоубийства). Выполнение услуги не должно занимать больше 30 минут.',
    // 296
    // Цель выполняет любую просьбу (кроме самоубийства). Выполнение услуги не должно занимать больше 30 минут.
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: 30,
    minimalEssence: 0,
    eventType: useMentalAbility.name,
  },

  {
    id: 'fly-you-fool',
    humanReadableName: 'Беги отсюда',
    description:
      'Цель боится и убегает как можно дальше от менталиста. У цели заблокирована активация всех активных абилок на 10 минут. Через 10 минут эффект проходит.',
    // 297
    // Цель боится и убегает как можно дальше от менталиста. Через 10 минут эффект проходит.
    // 2. У цели заблокирована активация всех активных абилок на 10 минут
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: 60,
    minimalEssence: 0,
    eventType: useMentalAbility.name,
  },

  {
    id: 'paralysis-1',
    humanReadableName: 'Оцепенение',
    description:
      'Цель не может двигаться 10 минут или пока ей не нанесён физический урон (-1хит). Не может пользоваться активными абилками.',
    // 298
    // Цель не может двигаться 10 минут или пока ей не нанесён физический урон (-1хит)
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: 30,
    minimalEssence: 0,
    eventType: useMentalAbility.name,
  },

  {
    id: 'paralysis-2',
    humanReadableName: 'Паралич движения',
    description: 'Цель не может двигаться 10 минут.',
    // 318
    // Цель не может двигаться 10 минут.
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: 30,
    prerequisites: ['paralysis-1'],
    minimalEssence: 0,
    eventType: useMentalAbility.name,
  },

  {
    id: 'paralysis-3',
    humanReadableName: 'Паралич полный',
    description: 'Цель не может двигаться и произносить звуки 10 минут.',
    // 319
    // Цель не может двигаться и говорить 10 минут.
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: 30,
    prerequisites: ['paralysis-2'],
    minimalEssence: 0,
    eventType: useMentalAbility.name,
  },

  {
    id: 'scorn-him',
    humanReadableName: 'Птибурдюков, тебя я презираю',
    description:
      'Цель старается сделать агрессивное, но не смертельное действие к выбранному персонажу.  (оскорбить, плюнуть на одежду, выразить презрение убеждениям ) ',
    // 320
    // Цель старается сделать агрессивное, но не смертельное действие к выбранному персонажу.  (оскорбить, плюнуть на одежду, выразить презрение убеждениям )
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: 10,
    minimalEssence: 0,
    eventType: useMentalAbility.name,
  },

  {
    id: 'kill-him',
    humanReadableName: 'Агрессия',
    description: 'Цель активно пытается убить персонажа, на которого указывает менталист.',
    // 302
    // Цель активно пытается убить персонажа, на которого указывает менталист.
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: 360,
    minimalEssence: 0,
    eventType: useMentalAbility.name,
  },

  {
    id: 'dgroup-add',
    humanReadableName: 'Принять в дискурс-группу',
    description: 'Принять персонажа в дискурс-группу',
    // 317
    // Сканируется код локуса, код персонажа, персонаж приобретает абилку “член группы” для соответствующей локусу группы, локус теряет заряд. Запускается процедура пересчета дискурс-абилок. Если на локусе нет зарядов, абилка не работает.
    target: 'scan',
    targetsSignature: kLocusAndPhysicalBody,
    cooldownMinutes: 30,
    minimalEssence: 0,
    eventType: discourseGroupAddAbility.name,
  },

  {
    id: 'dgroup-exclude',
    humanReadableName: 'Исключить из дискурс-группы',
    description: 'Исключить персонажа из дискурс-группы',
    // 318
    // Сканируется код локуса, код персонажа, персонаж теряет абилку “член группы” для соответствующей локусу группы. Запускается процедура пересчета дискурс-абилок
    target: 'scan',
    targetsSignature: kLocusAndPhysicalBody,
    cooldownMinutes: 30,
    minimalEssence: 0,
    eventType: discourseGroupExcludeAbility.name,
  },

  {
    id: 'dm-inc-counter',
    humanReadableName: 'Добавить заряд к локусу',
    description: 'Добавить один заряд к локусу',
    // 319
    // Сканируется код локуса, код пополнения заряда. Количество зарядов на локусе увеличивается на 1.
    target: 'scan',
    targetsSignature: [
      {
        name: 'Локус',
        allowedTypes: ['locus'],
        field: 'locusId',
      },
      {
        name: 'Заряд',
        allowedTypes: ['locus_charge'],
        field: 'qrCode',
      },
    ],
    cooldownMinutes: 0,
    minimalEssence: 0,
    eventType: chargeLocusAbility.name,
  },

  {
    id: 'dm-add-guru',
    humanReadableName: 'Гуру',
    description: 'Принять персонажа в дискурс-группу, не расходуя заряд локуса',
    // 320
    // Сканируется код локуса, код персонажа, персонаж приобретает абилку “член группы” для соответствующей локусу группы. Запускается процедура пересчета дискурс-абилок. Если на локусе нет зарядов, абилка не работает.
    target: 'scan',
    targetsSignature: kLocusAndPhysicalBody,
    cooldownMinutes: 60,
    prerequisites: ['dgroup-add'],
    minimalEssence: 0,
    eventType: discourseGroupAddGuru.name,
  },

  {
    id: 'dm-exclude-inq-1',
    humanReadableName: 'Инквизитор-1',
    description: 'Выгнать персонажа из дискурс-группы, восстановив заряд локуса',
    // 321
    // Сканируется код локуса, код персонажа, персонаж теряет абилку “член группы” для соответствующей локусу группы. Количество зарядов локуса увеличивается на 1. Запускается процедура пересчета дискурс-абилок
    target: 'scan',
    targetsSignature: kLocusAndPhysicalBody,
    cooldownMinutes: 30,
    prerequisites: ['dgroup-exclude'],
    minimalEssence: 0,
    eventType: discourseGroupInquisitor1.name,
  },

  {
    id: 'dm-exclude-inq-2',
    humanReadableName: 'Инквизитор-2',
    description: 'Выгнать персонажа из дискурс-группы, восстановив два заряда локуса',
    // 322
    // Сканируется код локуса, код персонажа, персонаж теряет абилку “член группы” для соответствующей локусу группы. Количество зарядов локуса увеличивается на 2. Запускается процедура пересчета дискурс-абилок
    target: 'scan',
    targetsSignature: kLocusAndPhysicalBody,
    cooldownMinutes: 30,
    prerequisites: ['dm-exclude-inq-1'],
    minimalEssence: 0,
    eventType: discourseGroupInquisitor2.name,
  },

  {
    id: 'dm-prophet',
    humanReadableName: 'Пророк',
    description: 'Предъявите экран с описанием абилки региональному мастеру, чтобы получить новый QR локуса.',
    // 323
    // Абилка-сертификат с кулдауном. Предъявителю выдается QR локуса дискурс-группы, к которой он принадлежит.
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 360,
    minimalEssence: 0,
    eventType: prophetAbility.name,
  },

  {
    id: 'really-need-it',
    humanReadableName: 'Очень надо.',
    description: 'Цель дарит менталисту 1 игровой предмет по выбору менталиста. (Прописать, что нельзя подарить дрон, например)',
    // 322
    // Цель дарит менталисту 1 игровой предмет по выбору менталиста.
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: 60,
    minimalEssence: 0,
    eventType: useMentalAbility.name,
  },

  {
    id: 'billioner-walk',
    humanReadableName: 'Прогулка миллионера',
    description: 'Цель переводит на счет менталиста некоторую часть денег со своего счета.',
    // 323
    // Убеждает жертву перевести со своего на счет менталиста Х% (15% например)
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: 60,
    minimalEssence: 0,
    eventType: useMentalAbility.name,
  },

  {
    id: 'increase-the-mental-protection',
    humanReadableName: '',
    description: 'на 24 часа увеличивает сопротивляемость целевого персонажа ментальному воздействию. ',
    // 330
    // Добавляет +8 к ментальной защите целевого персонажа  на 24 часа
    target: 'scan',
    targetsSignature: kNonDeadBodyTargeted,
    cooldownMinutes: 180,
    minimalEssence: 0,
    eventType: increaseTheMentalProtectionAbility.name,
  },

  {
    id: 'reduce-the-mental-protection',
    humanReadableName: '',
    description: 'на 12 часов  уменьшает сопротивляемость целевого персонажа ментальному воздействию. ',
    // 331
    // Добавляет -8 к ментальной защите целевого персонажа на 12 часов
    target: 'scan',
    targetsSignature: kNonDeadBodyTargeted,
    cooldownMinutes: 180,
    minimalEssence: 0,
    eventType: reduceTheMentalProtectionAbility.name,
  },

  {
    id: 'i-dont-trust-anybody',
    humanReadableName: 'Я никому не верю',
    description: 'Временно увеличивает сопротивляемость менталиста ментальному воздействию.',
    // 332
    // Менталист увеличивает свою ментальную защиту на +8 на 30 минут.
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 60,
    minimalEssence: 0,
    eventType: iDontTrustAnybody.name,
  },

  {
    id: 'you-dont-trust-anybody',
    humanReadableName: 'Ты никому не веришь',
    description: 'Временно увеличивает сопротивляемость персонажа ментальному воздействию.',
    // 333
    // Менталист увеличивает ментальную защиту другого персонажа на +8 на 30 минут
    target: 'scan',
    targetsSignature: kNonDeadBodyTargeted,
    cooldownMinutes: 60,
    minimalEssence: 0,
    eventType: youDontTrustAnybody.name,
  },

  {
    id: 'how-much-it-costs',
    humanReadableName: 'Чо почем',
    description: 'посмотреть на qr и сказать сколько это стоит, базовую цену товара',
    // 289
    // qr товара содержит информацию о базовой стоимости товара при его покупке
    // При применении абилки на экране отображается записанная на QR baseprice товара.
    // Если товар не был продан через магазин - возвращает 0.
    target: 'scan',
    targetsSignature: [kMerchandiseTargeted],
    cooldownMinutes: 0,
    minimalEssence: 0,
    eventType: howMuchItCosts.name,
  },

  {
    id: 'who-needs-it',
    humanReadableName: 'Чей туфля?',
    description: 'Ты можешь узнать что-то интересное про этот товар. ',
    // 291
    // Выводит на экран гм информацию из скрытого текстового поля товара .
    // Текст по умолчанию: Ты не знаешь ничего интересного про этот товар.
    target: 'scan',
    targetsSignature: [kMerchandiseTargeted],
    cooldownMinutes: 10,
    minimalEssence: 0,
    eventType: whoNeedsIt.name,
  },

  {
    id: 'how-much-is-rent',
    humanReadableName: 'ПлачУ и ПлАчу',
    description: 'посмотреть на qr и сказать размер рентного платежа чаммера. ',
    // 292
    // Показывает (возвращает) размер рентного платежа по данному товару. Данная информация записывается на QR при его покупке.
    // Если товар не был продан через магазин - возвращает 0.
    target: 'scan',
    targetsSignature: [kMerchandiseTargeted],
    cooldownMinutes: 0,
    minimalEssence: 0,
    eventType: howMuchTheRent.name,
  },

  {
    id: 'let-me-pay',
    humanReadableName: 'Давай я заплачу',
    description: 'Гешефтмахер может переписать кредит за 1 предмет на себя. Работает только если есть QR-код товара.',
    // 292
    // ГМ переписывает кредит за предмет с другого перонажа на себя. При этом сумма последующих рентных платежей пересчитывается. Новые рентные платежи рассчитываются исходя из скоринга гма на момент активации абилки.
    // Механика:
    // Активировать абилку, отсканировать QR-код товара.
    // Если на данном товаре нет рентного платежа - отображается "на данном товаре нет рентного платежа"
    target: 'scan',
    targetsSignature: [kMerchandiseTargeted],
    cooldownMinutes: 30,
    minimalEssence: 0,
    eventType: letMePay.name,
  },

  {
    id: 'let-him-pay',
    humanReadableName: 'Давай он заплатит',
    description: 'переписать долг за 1 предмет по выбору с персонажа А на персонажа Б.',
    // 293
    // Переписать долг за 1 предмет c QR с персонажа А на персонажа Б.
    // При этом сумма последующих рентных платежей пересчитывается. Новые рентные платежи рассчитываются исходя из скоринга гма на момент активации абилки.
    // Механика:
    // Активировать абилку, отсканировать QR-код товара, отсканировать QR код персонажа, на которого .
    // Если на данном товаре нет рентного платежа - отображается "на данном товаре нет рентного платежа"
    target: 'scan',
    targetsSignature: [
      kMerchandiseTargeted,
      {
        name: 'Новый плательщик',
        field: 'targetCharacterId',
        allowedTypes: ['HEALTHY_BODY'],
      },
    ],
    cooldownMinutes: 30,
    minimalEssence: 0,
    eventType: letHimPay.name,
  },

  {
    id: 're-rent',
    humanReadableName: 'Переоформить ренту',
    description: 'ГМ может целевому персонажу переоформить контракт с новым коэфициентом скоринга. ',
    // 296
    // ГМ переписывает кредит за предмет: пересчитывается сумма последующих рентных платежей . Новые рентные платежи рассчитываются исходя из скоринга персонажа, на которого записан кредит на момент активации абилки.
    // Механика:
    // Активировать абилку, отсканировать QR-код товара.
    // Если на данном товаре нет рентного платежа - отображается "на данном товаре нет рентного платежа"
    target: 'scan',
    targetsSignature: [kMerchandiseTargeted],
    cooldownMinutes: 30,
    minimalEssence: 0,
    eventType: reRent.name,
  },

  {
    id: 'investigate-scoring',
    humanReadableName: 'Посмотрим скоринг',
    description: 'другой персонаж сможет видеть свои коэффициенты скоринга в течение 5 минут.',
    // 294
    // Показывает актуальные коэффициенты, которые влияют на скоринг. У целевого персонажа в течение следующих 5 минут отображаются его коэффициенты скоринга.
    target: 'scan',
    targetsSignature: kHealthyBodyTargeted,
    cooldownMinutes: 30,
    minimalEssence: 0,
    eventType: investigateScoring.name,
  },

  {
    id: 'pray-s',
    humanReadableName: 'Pray my lame',
    description: 'Помогает нужному духу обрести силы для воплощения',
    // 111
    // При сканировании qr-кода астрального тела духа сокращает у этого духа кулдаун способности Fleshpoint на 5 минут
    // TODO(https://trello.com/c/J2QfWUnU/286-реализовать-абилки-pray-my-lame-name-fame): Add proper implementation
    target: 'scan',
    targetsSignature: kAstralBodyTargeted,
    cooldownMinutes: 10,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },

  {
    id: 'pray-m',
    humanReadableName: 'Pray my name',
    description: 'Сильно помогает нужному духу обрести силы для воплощения',
    // 112
    // При сканировании qr-кода астрального тела духа сокращает у этого духа кулдаун способности Fleshpoint на 10 минут
    // TODO(https://trello.com/c/J2QfWUnU/286-реализовать-абилки-pray-my-lame-name-fame): Add proper implementation
    target: 'scan',
    targetsSignature: kAstralBodyTargeted,
    cooldownMinutes: 10,
    prerequisites: ['pray-s'],
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },

  {
    id: 'pray-xl',
    humanReadableName: 'Pray my fame',
    description: 'Как боженька помогает нужному духу обрести силы для воплощения',
    // 113
    // При сканировании qr-кода астрального тела духа сокращает у этого духа кулдаун способности Fleshpoint на 30 минут
    // TODO(https://trello.com/c/J2QfWUnU/286-реализовать-абилки-pray-my-lame-name-fame): Add proper implementation
    target: 'scan',
    targetsSignature: kAstralBodyTargeted,
    cooldownMinutes: 10,
    prerequisites: ['pray-m'],
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },

  {
    id: 'astral-body-1',
    humanReadableName: 'Астральное тельце',
    description: 'Ненадолго перейти в астральное тело, слабо готовое к астральному бою',
    // 448
    // Время действия 15 минут, кулдаун 45 минут После активации маг переключается в астральное тело. У него 2 хита, 2 меча и 1 щит
    // TODO(https://trello.com/c/GpCUz0q2/138-магия-реализовать-способности-для-астрала-астральное-тельце-астральное-тело-корпус-а)
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 45,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },

  {
    id: 'astral-body-2',
    humanReadableName: 'Астральное тело',
    description: 'Перейти в астральное тело, готовое к астральному бою',
    // 449
    // Время действия 45 минут, кулдаун 55 минут После активации маг переключается в астральное тело. У него 5 хитов, 4 меча и 3 щита
    // TODO(https://trello.com/c/GpCUz0q2/138-магия-реализовать-способности-для-астрала-астральное-тельце-астральное-тело-корпус-а)
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 55,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },

  {
    id: 'astral-body-3',
    humanReadableName: 'Корпус А',
    description: 'На долгий срок перейти в астральное тело, отлично готовое к астральному бою.',
    // 450
    // Время действия 120 минут, кулдаун 125 минут После активации маг переключается в астральное тело. У него 12 хитов, 6 мечей и 5 щитов
    // TODO(https://trello.com/c/GpCUz0q2/138-магия-реализовать-способности-для-астрала-астральное-тельце-астральное-тело-корпус-а)
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 125,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },

  {
    id: 'silentium-est-aurum',
    humanReadableName: 'Silentium est aurum',
    description: 'Временно частично изменить цели ее ауру. Требуемая эссенция: больше 4',
    // 375
    // Время действия 60 минут. Кулдаун 40 минут. Аура цели на это время случайным образом меняется на 20% (и случайный фрагмент, и на случайное значение).
    // TODO(https://trello.com/c/qATKkQtq/140-магия-реализовать-способности-связанные-с-аурой-silentium-est-aurum-light-step-dictator-control)
    target: 'scan',
    targetsSignature: [
      {
        name: 'Персонаж',
        allowedTypes: ['ASTRAL_BODY', 'HEALTHY_BODY', 'WOUNDED_BODY', 'CLINICALLY_DEAD_BODY'],
        field: 'targetCharacterId',
      },
    ],
    cooldownMinutes: 40,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },

  {
    id: 'blood-feast',
    humanReadableName: 'Blood Feast',
    description: 'Извлечение доз крови из жертв, у которых сканируются qr-коды мясных тел',
    // 455
    // - время действия 5 минут, кулдаун 30 минут. За время активации можно сосканировать Qr-код мясных тел до 3 уникальных целей (добровольно или в тяжране) - это приведет к созданию соответствующего количества чипов “кровь”.  Если цель не была в тяжране, то она там оказывается.
    // TODO(https://trello.com/c/bzPOYhyP/171-реализовать-заклинания-и-абилки-связанные-с-чипами-крови-blood-feast-bathory-charger-sense-of-essence)
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 30,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },

  {
    id: 'hammer-of-justice',
    humanReadableName: 'Hammer of Justice',
    description: 'Активируемый статус "тяжелое" для одноручного оружия.  Требуемая эссенция: больше 3',
    // 380
    // - время действия 10+N минут, кулдаун 5 минут. Одноручное оружие считается тяжёлым. N=умвл*3 минут
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 5,
    minimalEssence: 3,
    eventType: hammerOfJustice.name,
  },

  {
    id: 'arrowgant',
    humanReadableName: 'Arrowgant',
    description: 'Активируемая защита от дистанционного легкого оружия.  Требуемая эссенция: больше 4',
    // 381
    // - время действия 5+N минут, кулдаун 15 минут. Дает защиту от дистанционных атак (только от нерфов). N=умвл*1 минут
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 15,
    minimalEssence: 4,
    eventType: arrowgant.name,
  },

  {
    id: 'trollton',
    humanReadableName: 'Trollton',
    description: 'Активируемая тяжелая броня.  Требуемая эссенция: больше 2',
    // 382
    // - время действия 5+N минут, кулдаун 30 минут. Дает тяжелую броню. N=умвл*2 минут
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 30,
    minimalEssence: 2,
    eventType: trollton.name,
  },

  {
    id: 'i-will-survive',
    humanReadableName: 'I will survive ',
    description: 'Активируемая возможность подняться из тяжрана в течение некоторого времени. Требуемая эссенция: больше 2',
    // 383
    // - время действия 5+N минут, кулдаун 20 минут. Позволяет автоматически подняться из тяжрана через 30с с полным запасом текущих хитов. N=умвл*2 минут
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 20,
    minimalEssence: 2,
    eventType: iWillSurvive.name,
  },

  {
    id: 'stand-up-and-fight',
    humanReadableName: 'Stand up and fight ',
    description: 'Излечение цели. Требуемая эссенция: больше 5',
    // 384
    // - мгновенное, кулдаун 5 минут. Позволяет поднять из тяжрана одного другого персонажа с полным запасом текущих хитов
    target: 'scan',
    targetsSignature: [
      {
        name: 'Персонаж',
        allowedTypes: ['WOUNDED_BODY'],
        field: 'targetCharacterId',
      },
    ],
    cooldownMinutes: 5,
    minimalEssence: 5,
    eventType: reviveOnTarget.name,
  },

  {
    id: 'fresh-new-day',
    humanReadableName: 'Fresh new day ',
    description: 'Перезарядка артефакта. Требуемая эссенция: больше 4',
    // 385
    // - мгновенное, кулдаун 40 минут. Позволяет восстановить активированный (то есть потраченный) артефакт с любым заклинанием - в такое же состояние, какое они имели до активации.
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 40,
    minimalEssence: 4,
    eventType: dummyAbility.name,
  },

  {
    id: 'artifact-enlarge-pencil',
    humanReadableName: 'Crate of the art: Enlarge Your Pencil',
    description: 'Ты можешь создавать артефакты, содержащие заклинание Enlarge Your Pencil. Требуемая эссенция: больше 4',
    // 386
    // - мгновенное, кулдаун 120 минут. Позволяет создать артефакт, содержащий подготовленное заклинание Enlarge Your Pencil - из расчета как будто у адепта Магия=2. Вместо активации заклинание привязывается к материальному носителю (что-то с qr-кодом), и активация произойдет только после сканирования qr-кода и подтверждения активации в интерфейсе.
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 120,
    minimalEssence: 4,
    eventType: dummyAbility.name,
  },

  {
    id: 'artifact-stone-skin',
    humanReadableName: 'Crate of the art: Stone skin',
    description: 'Ты можешь создавать артефакты, содержащие заклинание Stone skin. Требуемая эссенция: больше 4',
    // 387
    // - мгновенное, кулдаун 120 минут. Позволяет создать артефакт, содержащий подготовленное заклинание Stone skin - из расчета как будто у адепта Магия=2. Вместо активации заклинание привязывается к материальному носителю (что-то с qr-кодом), и активация произойдет только после сканирования qr-кода и подтверждения активации в интерфейсе.
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 120,
    minimalEssence: 4,
    eventType: dummyAbility.name,
  },

  {
    id: 'artifact-tempus-fugit',
    humanReadableName: 'Crate of the art: Tempus Fugit',
    description: 'Ты можешь создавать артефакты, содержащие заклинание Tempus Fugit. Требуемая эссенция: больше 4',
    // 388
    // - мгновенное, кулдаун 120 минут. Позволяет создать артефакт, содержащий подготовленное заклинание Tempus Fugit - из расчета как будто у адепта Магия=2. Вместо активации заклинание привязывается к материальному носителю (что-то с qr-кодом), и активация произойдет только после сканирования qr-кода и подтверждения активации в интерфейсе.
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 120,
    minimalEssence: 4,
    eventType: dummyAbility.name,
  },

  {
    id: 'artifact-beacon',
    humanReadableName: 'Crate of the art: Beacon',
    description: 'Ты можешь создавать артефакты, содержащие заклинание Beacon. Требуемая эссенция: больше 4',
    // 389
    // - мгновенное, кулдаун 120 минут. Позволяет создать артефакт, содержащий подготовленное заклинание Beacon - из расчета как будто у адепта Магия=2. Вместо активации заклинание привязывается к материальному носителю (что-то с qr-кодом), и активация произойдет только после сканирования qr-кода и подтверждения активации в интерфейсе.
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 120,
    minimalEssence: 4,
    eventType: dummyAbility.name,
  },

  {
    id: 'artifact-run-spirit-run',
    humanReadableName: 'Crate of the art: Run, spirit, run',
    description: 'Ты можешь создавать артефакты, содержащие заклинание Run, spirit, run. Требуемая эссенция: больше 4',
    // 390
    // - мгновенное, кулдаун 120 минут. Позволяет создать артефакт, содержащий подготовленное заклинание Run, spirit, run - из расчета как будто у адепта Магия=2. Вместо активации заклинание привязывается к материальному носителю (что-то с qr-кодом), и активация произойдет только после сканирования qr-кода и подтверждения активации в интерфейсе.
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 120,
    minimalEssence: 4,
    eventType: dummyAbility.name,
  },

  {
    id: 'artifact-input-stream',
    humanReadableName: 'Crate of the art: InputStream',
    description: 'Ты можешь создавать артефакты, содержащие заклинание InputStream. Требуемая эссенция: больше 4',
    // 391
    // - мгновенное, кулдаун 120 минут. Позволяет создать артефакт, содержащий подготовленное заклинание InputStream - из расчета как будто у адепта Магия=2. Вместо активации заклинание привязывается к материальному носителю (что-то с qr-кодом), и активация произойдет только после сканирования qr-кода и подтверждения активации в интерфейсе.
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 120,
    minimalEssence: 4,
    eventType: dummyAbility.name,
  },

  {
    id: 'artifact-output-stream',
    humanReadableName: 'Crate of the art: OutputStream',
    description: 'Ты можешь создавать артефакты, содержащие заклинание OutputStream. Требуемая эссенция: больше 4',
    // 392
    // - мгновенное, кулдаун 120 минут. Позволяет создать артефакт, содержащий подготовленное заклинание OutputStream - из расчета как будто у адепта Магия=2. Вместо активации заклинание привязывается к материальному носителю (что-то с qr-кодом), и активация произойдет только после сканирования qr-кода и подтверждения активации в интерфейсе.
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 120,
    minimalEssence: 4,
    eventType: dummyAbility.name,
  },

  {
    id: 'artifact-mosquito-tree',
    humanReadableName: 'Crate of the art: Mosquito Tree',
    description: 'Ты можешь создавать артефакты, содержащие заклинание Mosquito Tree. Требуемая эссенция: больше 4',
    // 393
    // - мгновенное, кулдаун 120 минут. Позволяет создать артефакт, содержащий подготовленное заклинание Mosquito Tree - из расчета как будто у адепта Магия=2. Вместо активации заклинание привязывается к материальному носителю (что-то с qr-кодом), и активация произойдет только после сканирования qr-кода и подтверждения активации в интерфейсе.
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 120,
    minimalEssence: 4,
    eventType: dummyAbility.name,
  },

  {
    id: 'artifact-feed-the-cat',
    humanReadableName: 'Crate of the art: Feed the cat',
    description: 'Ты можешь создавать артефакты, содержащие заклинание Feed the cat. Требуемая эссенция: больше 4',
    // 394
    // - мгновенное, кулдаун 120 минут. Позволяет создать артефакт, содержащий подготовленное заклинание Feed the cat - из расчета как будто у адепта Магия=2. Вместо активации заклинание привязывается к материальному носителю (что-то с qr-кодом), и активация произойдет только после сканирования qr-кода и подтверждения активации в интерфейсе.
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 120,
    minimalEssence: 4,
    eventType: dummyAbility.name,
  },

  {
    id: 'artifact-tame-the-dog',
    humanReadableName: 'Crate of the art: Tame the dog',
    description: 'Ты можешь создавать артефакты, содержащие заклинание Tame the dog. Требуемая эссенция: больше 4',
    // 395
    // - мгновенное, кулдаун 120 минут. Позволяет создать артефакт, содержащий подготовленное заклинание Tame the dog - из расчета как будто у адепта Магия=2. Вместо активации заклинание привязывается к материальному носителю (что-то с qr-кодом), и активация произойдет только после сканирования qr-кода и подтверждения активации в интерфейсе.
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 120,
    minimalEssence: 4,
    eventType: dummyAbility.name,
  },

  {
    id: 'artifact-exorcizamus',
    humanReadableName: 'Crate of the art: Exorcizamus',
    description: 'Ты можешь создавать артефакты, содержащие заклинание Exorcizamus. Требуемая эссенция: больше 4',
    // 396
    // - мгновенное, кулдаун 120 минут. Позволяет создать артефакт, содержащий подготовленное заклинание Exorcizamus - из расчета как будто у адепта Магия=2. Вместо активации заклинание привязывается к материальному носителю (что-то с qr-кодом), и активация произойдет только после сканирования qr-кода и подтверждения активации в интерфейсе.
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 120,
    minimalEssence: 4,
    eventType: dummyAbility.name,
  },

  {
    id: 'allo-homorus',
    humanReadableName: 'Allo, homorus!',
    description: 'Активация дает возможность открыть один замок. Требуемая эссенция: больше 2',
    // 400
    // Активация дает возможность открыть замок (см.правила по взломам в "Прочих моделях"). Кулдаун - 10 минут
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 10,
    minimalEssence: 2,
    eventType: alloHomorusAbility.name,
  },

  {
    id: 'medcart-healing',
    humanReadableName: 'Полевое лечение тяжрана',
    description: '',
    // 464
    // Аблика появляется в альтернативном теле Дрон медикарт. Кулдаен абилки 60 минут
    // TODO(aeremin): Add proper implementation
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 9000,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },

  {
    id: 'autodoc-healing',
    humanReadableName: 'Лечение тяжрана',
    description: '',
    // 465
    // Абилка появляется в альтернативном теле автодок. Кулдаун абилки 10 минут
    // TODO(aeremin): Add proper implementation
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 9000,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },

  {
    id: 'implant-active',
    humanReadableName: 'Установка импланта',
    description: 'Для установки импланта используй эту способность. Необходим автодок!',
    // 475
    // НЕОБХОДИМ АВТОДОК.
    // Активирует процесс установки импланта.
    // надо отсканировать:
    // - QR автодока
    // - QR целевого чаммера
    // - QR импланта (?)
    //
    // TODO(aeremin): Add proper implementation
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 20,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },

  {
    id: 'tuning-active',
    humanReadableName: 'Установка мода в дронкибердеку',
    description: 'Для установки мода в дронкибердеку используй эту способность.',
    // 479
    // Активирует процесс установки мода.
    // надо отсканировать:
    // - QR Мастерской
    // - QR целевого дрона \ кибердеки
    // - QR мода (?)
    //
    // особый экран НЕ показывается, все проверки проходят в бэкнде, выдается только результат "получилось \ не получилось"
    // TODO(https://trello.com/c/lbmO5n8E/337-дроны-модификация-дронов-реализовать-возможность-установки-и-снятия-модов-в-дроны): Add proper implementation
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 20,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },

  {
    id: 'repoman-active',
    humanReadableName: 'Рипомен',
    description: 'Активируй, чтобы снять имплантмод. Выберется самый слабый.',
    // 483
    // Активирует процесс снятия импланта\мода (надо отсканировать QR пустышки, куда запишется трофей и QR чаммера \ дрона \ кибердеки ).  Выбираем самый слабый мод по параметру Сложности. Если несколько одинаково слабых - любой.  Если параметра can-do-repo +
    // Int - не хватило - снятия не происходит.
    // TODO(https://trello.com/c/OBEicfEg/330-реализовать-вырезание-имплантов-рипоменами): Add proper implementation
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 20,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },

  {
    id: 'repoman-black',
    humanReadableName: 'Черный рипомен',
    description: 'Активируй, чтобы снять имплантмод. Выберется самый сильный.',
    // 487
    // Активирует процесс снятия импланта\мода (надо отсканировать QR пустышки, куда запишется трофей и QR чаммера \ дрона \ кибердеки ). Смотрим параметр can-do-repo + Int ,  Выбираем самый дорогой мод по параметру Сложности, но не больше чем параметр can-do-repo. Если несколько одинаково дорогих - любой. Если can-do-repo не хватило - ничего не происходит.
    // TODO(https://trello.com/c/OBEicfEg/330-реализовать-вырезание-имплантов-рипоменами): Add proper implementation
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 20,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },

  {
    id: 'repoman-medic',
    humanReadableName: 'Рипомен хирург',
    description: 'Ты умеешь использовать автодок и выбирать сам, какой имплант хочешь снять.',
    // 488
    // Здесь идет включение а Автодок, показывается экран Автодока и к сумме (can-do-repo + Int ) добавляется еще auto-doc-bonus.
    // Вырезанный имплант записывается на QR чип
    // TODO(https://trello.com/c/OBEicfEg/330-реализовать-вырезание-имплантов-рипоменами): Add proper implementation
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 20,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },

  {
    id: 'groundcraft-active',
    humanReadableName: 'Управление наземным дроном',
    description: 'Активируй, чтобы включиться в наземного дрона.',
    // 496
    // Активирует процесс включения в дрона.
    // надо отсканировать:
    // - QR дрона
    // - QR телохранилища
    // TODO(https://trello.com/c/HgKga3aT/338-тела-дроны-создать-сущность-дроны-их-можно-покупать-в-магазине-носить-с-собой-на-куар-коде-и-в-них-можно-включаться)
    // Реальный кулдаун: time-after-drone - 5* body но не меньше чем 0
    target: 'scan',
    targetsSignature: kDroneAndBodyStorageTargeted,
    cooldownMinutes: 0,
    minimalEssence: 0,
    eventType: enterDrone.name,
  },

  {
    id: 'drone-logoff',
    humanReadableName: 'Отключиться от дрона',
    description: 'Отключиться от дрона.',
    // 505
    // При активации кнопки необходимо выбрать ЯЧЕЙКУ телохранилища, в котором лежит тело ригги.
    // Риггер выходит из дрона, пропадают абилки дрона, появляются абилки риггера.
    // Статус сообщение при выходе "Вы потеряли  DroneFeedbaсk хитов"
    // где DroneFeedback = DroneFeedback1 + DroneFeedback2 + DroneFeedback3
    // TODO(aeremin): Add proper implementation
    target: 'scan',
    targetsSignature: kBodyStorageTargeted,
    cooldownMinutes: 0,
    minimalEssence: 0,
    eventType: exitDrone.name,
  },

  {
    id: 'drone-danger',
    humanReadableName: 'Аварийное отключение',
    description: 'Дрон поврежден! Необходимо срочно вернуться к телу!',
    // 506
    // Эта кнопка символизирует аварийное отключение.
    // Используется в случае если
    // - с дрона сняли все хиты.
    // Кроме того, происходит автоматически если:
    // - закончилось время на включение в дрона
    // - было атаковано мясное тело риггера
    // DroneFeedback1 = 1
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 0,
    minimalEssence: 0,
    eventType: droneEmergencyExit.name,
  },

  {
    id: 'pill-name',
    humanReadableName: 'Фармацевтика',
    description: 'Отсканируй препарати и пойми, что за это',
    // 514
    // При активации аблики игрок сканирует куар-код с препаратом и видит его название
    // TODO(https://trello.com/c/ac3aDyG0/329-реализовать-абилку-фармацевтика): Add proper implementation
    target: 'scan',
    targetsSignature: [
      {
        name: 'Препарат',
        allowedTypes: ['pill'],
        field: 'pillId',
      },
    ],
    minimalEssence: 0,
    eventType: dummyAbility.name,
    cooldownMinutes: 9000,
  },

  {
    id: 'gm-respawn-normal',
    humanReadableName: 'Воскрешение общее',
    description: 'Воскрешение Норм, эльф, орк, тролль, гном',
    // 527
    // Эта абилка нужна как мастерская.
    // Активировать абилку, отсканировать QR-код персонажа-объекта. У персонажа-объекта  восстанавливаются все хиты.
    target: 'scan',
    targetsSignature: [
      {
        name: 'Препарат',
        allowedTypes: ['HEALTHY_BODY', 'WOUNDED_BODY', 'CLINICALLY_DEAD_BODY', 'ABSOLUTELY_DEAD_BODY'],
        field: 'targetCharacterId',
      },
    ],
    minimalEssence: 0,
    eventType: reviveAbsoluteOnTarget.name,
    cooldownMinutes: 0,
  },

  {
    id: 'test-only-copy-qr',
    humanReadableName: 'Скопировать таблетку или имплант на QR-пустышку',
    description: 'ТОЛЬКО ДЛЯ ТЕСТИРОВАНИЯ',
    target: 'scan',
    targetsSignature: [
      {
        name: 'Откуда',
        allowedTypes: ['pill', 'implant'],
        field: 'pillId',
      },
      {
        name: 'Куда',
        allowedTypes: ['empty'],
        field: 'qrCode',
      },
    ],
    cooldownMinutes: 0,
    minimalEssence: 0,
    eventType: copyPasteQr.name,
  },

  {
    id: 'medcart-light-heal-1',
    humanReadableName: 'Лечение легких ранений (1)',
    description: 'Вылечить легкое ранение (1)',
    // 515
    // Активная абилка Медикарта
    // TODO(https://trello.com/c/MUwUHRoQ/360-реализовать-активные-абилки-медкарта): Add proper implementation
    target: 'scan',
    targetsSignature: kHealthyBodyTargeted,
    cooldownMinutes: 60,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },

  {
    id: 'medcart-light-heal-2',
    humanReadableName: 'Лечение легких ранений (2)',
    description: 'Вылечить легкое ранение (2)',
    // 516
    // Активная абилка Медикарта
    // TODO(https://trello.com/c/MUwUHRoQ/360-реализовать-активные-абилки-медкарта): Add proper implementation
    target: 'scan',
    targetsSignature: kHealthyBodyTargeted,
    cooldownMinutes: 60,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },

  {
    id: 'medcart-light-heal-3',
    humanReadableName: 'Лечение легких ранений (3)',
    description: 'Вылечить легкое ранение (3)',
    // 517
    // Активная абилка Медикарта
    // TODO(https://trello.com/c/MUwUHRoQ/360-реализовать-активные-абилки-медкарта): Add proper implementation
    target: 'scan',
    targetsSignature: kHealthyBodyTargeted,
    cooldownMinutes: 60,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },

  {
    id: 'medcart-heavy-heal-1',
    humanReadableName: 'Лечение тяжелых ранений (1)',
    description: 'Вылечить тяжелое ранение (1)',
    // 518
    // Активная абилка Медикарта
    // TODO(https://trello.com/c/MUwUHRoQ/360-реализовать-активные-абилки-медкарта): Add proper implementation
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 60,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },

  {
    id: 'medcart-heavy-heal-2',
    humanReadableName: 'Лечение тяжелых ранений (2)',
    description: 'Вылечить тяжелое ранение (2)',
    // 519
    // Активная абилка Медикарта
    // TODO(https://trello.com/c/MUwUHRoQ/360-реализовать-активные-абилки-медкарта): Add proper implementation
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 60,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },

  {
    id: 'medcart-heavy-heal-3',
    humanReadableName: 'Лечение тяжелых ранений (3)',
    description: 'Вылечить тяжелое ранение (3)',
    // 520
    // Активная абилка Медикарта
    // TODO(https://trello.com/c/MUwUHRoQ/360-реализовать-активные-абилки-медкарта): Add proper implementation
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 60,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },

  {
    id: 'medcart-reanimate',
    humanReadableName: 'Лечение состояния КС',
    description: 'Вылечить состояние КС',
    // 521
    // Активная абилка Медикарта
    // TODO(https://trello.com/c/MUwUHRoQ/360-реализовать-активные-абилки-медкарта): Add proper implementation
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 60,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },
];

setAllActiveAbilities(
  (() => {
    const result = new Map<string, ActiveAbility>();
    kAllActiveAbilitiesList.forEach((f) => {
      if (result.has(f.id)) throw new Error('Non-unique active ability id: ' + f.id);
      result.set(f.id, f);
    });
    return result;
  })(),
);
