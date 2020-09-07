import {
  absoluteDeathAbility,
  alloHomorusAbility,
  arrowgant,
  changeAuraAbility,
  cloudMemoryAbility,
  doNothingAbility,
  dummyAbility,
  hammerOfJustice,
  howMuchItCosts,
  howMuchTheRent,
  investigateScoring,
  iWillSurvive,
  letHimPay,
  letMePay,
  oneTimeRevive,
  reRent,
  trollton,
  whoNeedsIt,
} from './active_abilities';
import {
  iDontTrustAnybody,
  increaseTheMentalProtectionAbility,
  reduceTheMentalProtectionAbility,
  useMentalAbility,
  youDontTrustAnybody,
} from './mental';
import { autodocHeal, autodocRevive, capsuleReanimate, reviveAbsoluteOnTarget, reviveOnTarget } from './death_and_rebirth';
import { QrType } from '@sr2020/sr2020-common/models/qr-code.model';
import { Targetable } from '@sr2020/sr2020-common/models/sr2020-character.model';
import {
  chargeLocusAbility,
  discourseGroupAddAbility,
  discourseGroupAddGuru,
  discourseGroupExcludeAbility,
  discourseGroupInquisitor1,
  discourseGroupInquisitor2,
  prophetAbility,
} from './ethics';
import { setAllActiveAbilities } from '@sr2020/sr2020-model-engine/scripts/character/library_registrator';
import { droneEmergencyExit, enterDrone, exitDrone } from '@sr2020/sr2020-model-engine/scripts/character/rigger';
import { getPillNameAbility } from '@sr2020/sr2020-model-engine/scripts/character/chemo';
import { nanohiveArmorAbility, nanohiveBackupAbility, nanohiveHealhAbility, nanohiveShooterAbility } from './nanohives';
import { spiritsRelatedSpell } from '@sr2020/sr2020-model-engine/scripts/character/spells';
import { ghoulBite, gmRespawnHmhvv, vampireBite } from '@sr2020/sr2020-model-engine/scripts/character/hmhvv';
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
const kMedcartHealthyBodyTargeted: TargetSignature[] = [
  {
    name: 'Пациент',
    allowedTypes: ['HEALTHY_BODY'],
    field: 'targetCharacterId',
  },
];
const kMedcartWoundedBodyTargeted: TargetSignature[] = [
  {
    name: 'Пациент',
    allowedTypes: ['WOUNDED_BODY'],
    field: 'targetCharacterId',
  },
];
const kMedcartDeadBodyTargeted: TargetSignature[] = [
  {
    name: 'Пациент',
    allowedTypes: ['CLINICALLY_DEAD_BODY'],
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
const kPhysicalBodyTargeted: TargetSignature[] = [
  {
    name: 'Персонаж',
    allowedTypes: ['HEALTHY_BODY', 'WOUNDED_BODY', 'CLINICALLY_DEAD_BODY', 'ABSOLUTELY_DEAD_BODY'],
    field: 'targetCharacterId',
  },
];
const kLocusAndPhysicalBody: TargetSignature[] = [
  {
    name: 'Локус',
    allowedTypes: ['locus'],
    field: 'locusId',
  },
  ...kPhysicalBodyTargeted,
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
  karmaCost: number;
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
    karmaCost: 0,
    minimalEssence: 0,
    eventType: oneTimeRevive.name,
  },
  {
    id: 'mugger',
    humanReadableName: 'Грабеж',
    description: '',
    // TODO(https://trello.com/c/ihi8Ffmu/320-реализовать-абилку-грабеж): Add proper implementation
    //  Самурай находит тушку в тяжране, применяет эту абилку, сканирует QR тушки. Со счета тушки переводится самураю 10% нуйен остатка счета тушки. Тушка автоматически переходит в КС. Перевод создается без обоснования. В поле назначение - "добровольное пожертвование".
    target: 'scan',
    targetsSignature: [
      {
        name: 'Жертва',
        allowedTypes: ['WOUNDED_BODY'],
        field: 'targetCharacterId',
      },
    ],
    cooldownMinutes: 9000,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },
  {
    id: 'absolutely-finish-him',
    humanReadableName: 'абсолютная смерть',
    description: '',
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
    karmaCost: 0,
    minimalEssence: 0,
    eventType: absoluteDeathAbility.name,
  },
  {
    id: 'finish-him',
    humanReadableName: 'добивание тела из тяжрана в КС',
    description: '',
    // TODO(https://trello.com/c/RgKWvnBk/322-реализовать-добивание-тела-из-тяжрана-в-кс): Add proper implementation
    //
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 9000,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },
  {
    id: 'enter-vr',
    humanReadableName: 'зайти в Виар',
    description: '',
    // TODO(https://trello.com/c/npKNMNV9/323-вход-нахождение-и-выход-из-вр): Add proper implementation
    // дает возможность персонажу зайти в Виар на 2 часа (или сколько-то), кулдаун есть.  Увеличение длительности виара ИЛИ уменьшение кулдауна - спец абилки.
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 9000,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },
  {
    id: 'merge-shaman',
    humanReadableName: 'Merge (техношаман)',
    description: 'Устанавливает спрайт в ноду Хоста Основания',
    // TODO(https://trello.com/c/e8Y6SinJ/199-реализовать-активные-абилки-влияющие-на-матрицу)
    // Устанавливает спрайт в ноду.
    // Самый простой вариант - это бэкдор, то есть обеспечивает временную возможность работы с Контролем этого хоста из-вне матрицы. Крутота бэкдора зависит от крутоты спрайта.
    //
    // IT: Сканирует комнату данжа, сканирует спрайта, вызов REST Матрицы
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 30,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },
  {
    id: 'merge-cyberadept',
    humanReadableName: 'Merge (техношаман)',
    description: 'Устанавливает спрайт в ноду Хоста Основания',
    // TODO(https://trello.com/c/e8Y6SinJ/199-реализовать-активные-абилки-влияющие-на-матрицу)
    // Устанавливает спрайт в ноду.
    // Самый простой вариант - это бэкдор, то есть обеспечивает временную возможность работы с Контролем этого хоста из-вне матрицы. Крутота бэкдора зависит от крутоты спрайта.
    //
    // IT: Сканирует комнату данжа, сканирует спрайта, вызов REST Матрицы
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 30,
    karmaCost: 6,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },
  {
    id: 'awareness',
    humanReadableName: 'Насторожиться',
    description:
      'Ты можешь внимательно присмотреться к спрайтам в комнате. И какие-то из них явно не местные! Подозрительно...\n\nОбнаруживает вмерженные (то есть установленные другими хакерами) спрайты в этой ноде',
    // TODO(https://trello.com/c/e8Y6SinJ/199-реализовать-активные-абилки-влияющие-на-матрицу)
    // Способ поиска чужих спрайтов (например - бэкдоров) в этой ноде хоста Основания.
    //
    // IT: Сканирует комнату данжа, вызов REST Матрицы Кривды, отобразить текст
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 15,
    karmaCost: 2,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },
  {
    id: 'exterminatus',
    humanReadableName: 'Экстерминатус',
    description:
      'Ты можешь сконцентрироваться и разрушительный импульс, который уничтожит часть (зависит от Резонанса) спрайтов, вмерженных в эту Ноду\n',
    // TODO(https://trello.com/c/e8Y6SinJ/199-реализовать-активные-абилки-влияющие-на-матрицу)
    // Способ уничтожения чужих спрайтов. У нас нет таргетинга, поэтому удаляем рандомых спрайтов, число которых зависит от Резонанса
    //
    // IT: Сканирует комнату данжа, вызов REST Матрицы Кривды, отобразить текст
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 15,
    karmaCost: 2,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },
  {
    id: 'looking-for-trouble',
    humanReadableName: 'ГдеСрач?!',
    description:
      'Ты теперь просто нутром чувствуешь, где в Основании можно надрать кому-то цифровой зад!\n\nАктивируется перед входом в Основание (на стойке)\nВыдает список хостов, на которых есть техноманты и уровень группы. Чем сильнее твой Резонанс, тем меньше шансов у них остаться незамеченными',
    // TODO(https://trello.com/c/e8Y6SinJ/199-реализовать-активные-абилки-влияющие-на-матрицу)
    // Показывает список хостов под атакой в данже Основание. Показывает сумму резонанса группы. Отображает группу, если резонанса достататочно (Кривда придумает формулу)
    //
    // IT: вызов Кривдиного REST, отобразить текст
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 15,
    karmaCost: 8,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },
  {
    id: 'chieftain',
    humanReadableName: 'Вождь',
    description:
      'Это самый ценный из даров. Дар подарить Дар другому. Ты можешь разбудить в Госте Основания его суть, его природу, дав ему возможность по-настоящему почувстовать Матрицу. Цель пробудится и сможет стать техномантом',
    // TODO(https://trello.com/c/EFwxEY3c/324-реализовать-абилку-вождь): Add proper implementation
    // Ритуал инициации техноманта.
    //
    // IT: Цель: [+1] к характеристике МожетСтатьТехномантом
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 16 * 60,
    karmaCost: 16,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },
  {
    id: 'oblivion',
    humanReadableName: 'Забвение',
    description:
      '1) Целевой персонаж не помнит события последней сцены. Работает только, если персонажу не был нанесен урон (снят хотя бы 1 хиты). \n2) Ты забыл события последней сцены. Это работает только если тебе не был нанесён урон (снят хотя бы 1 хит). Если тебе был нанесён урон, ты говоришь об этом менталисту.',
    // Целевой персонаж забывает события "этой сцены", если персонажу не был нанесен физический урон (снят хотя бы 1 хит) за это время.
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: 60,
    karmaCost: 8,
    minimalEssence: 0,
    eventType: useMentalAbility.name,
  },
  {
    id: 'full-oblivion',
    humanReadableName: 'Полное Забвение',
    description: 'Персонаж не помнит события последней сцены.',
    // Персонаж забывает события "этой сцены", даже если персонажу был нанесен физический урон (снят хотя бы 1 хит) за это время.
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: 60,
    prerequisites: ['oblivion'],
    karmaCost: 16,
    minimalEssence: 0,
    eventType: useMentalAbility.name,
  },
  {
    id: 'cloud-memory',
    humanReadableName: 'Облачная память ',
    description: 'Персонаж не забывает события перед КС',
    // Целевой персонаж не забывает события перед КС, срок действия - 6 часов. Для менталиста эта абилка  активная, кулдаун 4 часа. У целевого персонажа в приложеньке где-то отображается, что он теперь не забывает события перед КС.
    target: 'scan',
    targetsSignature: kHealthyBodyTargeted,
    cooldownMinutes: 240,
    karmaCost: 16,
    minimalEssence: 0,
    eventType: cloudMemoryAbility.name,
  },
  {
    id: 'tell-me-truth',
    humanReadableName: 'Скажи как есть.',
    description: 'Целевой персонаж честно отвечает на 3 вопроса. \nТы честно отвечаешь на ',
    // Цель честно отвечает на 3 вопроса.
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: 60,
    karmaCost: 4,
    minimalEssence: 0,
    eventType: useMentalAbility.name,
  },
  {
    id: 'lie-to-me',
    humanReadableName: 'Лай ту ми',
    description: 'Целевой персонаж не может скрыть свою ложь.',
    // Цель озвучивает какой-то признак (щелканье пальцами, пожимание плечами, заикание), и в течение беседы в следующие 10 минут должна воспроизводить этот признак, если врет.
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: 60,
    karmaCost: 4,
    minimalEssence: 0,
    eventType: useMentalAbility.name,
  },
  {
    id: 'danila-i-need-help',
    humanReadableName: 'Оказать услугу',
    description:
      'Данила, ай нид хелп. Цель оказывает услугу, даже если это грозит ей средними проблемами (потеря дохода за 1 экономический цикл). Выполнение услуги не должно занимать больше 10 минут.',
    // Цель оказывает услугу, даже если это грозит ей средними проблемами (потеря дохода за 1 экономический цикл). Выполнение услуги не должно занимать больше 10 минут.
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: 30,
    karmaCost: 4,
    minimalEssence: 0,
    eventType: useMentalAbility.name,
  },
  {
    id: 'luke-i-am-your-father',
    humanReadableName: 'Выполнить любую просьбу',
    description:
      'Люк. Я твой отец. Цель выполняет любую просьбу (кроме самоубийства). Выполнение услуги не должно занимать больше 30 минут.',
    // Цель выполняет любую просьбу (кроме самоубийства). Выполнение услуги не должно занимать больше 30 минут.
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: 30,
    karmaCost: 16,
    minimalEssence: 0,
    eventType: useMentalAbility.name,
  },
  {
    id: 'fly-you-fool',
    humanReadableName: 'Беги отсюда',
    description:
      'Цель боится и убегает как можно дальше от менталиста. У цели заблокирована активация всех активных абилок на 10 минут. Через 10 минут эффект проходит.',
    // Цель боится и убегает как можно дальше от менталиста. Через 10 минут эффект проходит.
    // 2. У цели заблокирована активация всех активных абилок на 10 минут
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: 60,
    karmaCost: 8,
    minimalEssence: 0,
    eventType: useMentalAbility.name,
  },
  {
    id: 'paralysis-1',
    humanReadableName: 'Оцепенение',
    description:
      'Цель не может двигаться 10 минут или пока ей не нанесён физический урон (-1хит). Не может пользоваться активными абилками.',
    // Цель не может двигаться 10 минут или пока ей не нанесён физический урон (-1хит)
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: 30,
    karmaCost: 2,
    minimalEssence: 0,
    eventType: useMentalAbility.name,
  },
  {
    id: 'paralysis-2',
    humanReadableName: 'Паралич движения',
    description: 'Цель не может двигаться 10 минут.',
    // Цель не может двигаться 10 минут.
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: 30,
    prerequisites: ['paralysis-1'],
    karmaCost: 4,
    minimalEssence: 0,
    eventType: useMentalAbility.name,
  },
  {
    id: 'paralysis-3',
    humanReadableName: 'Паралич полный',
    description: 'Цель не может двигаться и произносить звуки 10 минут.',
    // Цель не может двигаться и говорить 10 минут.
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: 30,
    prerequisites: ['paralysis-2'],
    karmaCost: 8,
    minimalEssence: 0,
    eventType: useMentalAbility.name,
  },
  {
    id: 'scorn-him',
    humanReadableName: 'Птибурдюков, тебя я презираю',
    description:
      'Цель старается сделать агрессивное, но не смертельное действие к выбранному персонажу.  (оскорбить, плюнуть на одежду, выразить презрение убеждениям ) ',
    // Цель старается сделать агрессивное, но не смертельное действие к выбранному персонажу.  (оскорбить, плюнуть на одежду, выразить презрение убеждениям )
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: 10,
    karmaCost: 4,
    minimalEssence: 0,
    eventType: useMentalAbility.name,
  },
  {
    id: 'kill-him',
    humanReadableName: 'Агрессия',
    description: 'Цель активно пытается убить персонажа, на которого указывает менталист.',
    // Цель активно пытается убить персонажа, на которого указывает менталист.
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: 360,
    karmaCost: 16,
    minimalEssence: 0,
    eventType: useMentalAbility.name,
  },
  {
    id: 'dgroup-add',
    humanReadableName: 'Принять в дискурс-группу',
    description: 'Принять персонажа в дискурс-группу',
    // Сканируется код локуса, код персонажа, персонаж приобретает абилку “член группы” для соответствующей локусу группы, локус теряет заряд. Запускается процедура пересчета дискурс-абилок. Если на локусе нет зарядов, абилка не работает. Дает карму владельцу абилки.
    target: 'scan',
    targetsSignature: kLocusAndPhysicalBody,
    cooldownMinutes: 30,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: discourseGroupAddAbility.name,
  },
  {
    id: 'dgroup-exclude',
    humanReadableName: 'Исключить из дискурс-группы',
    description: 'Исключить персонажа из дискурс-группы',
    // Сканируется код локуса, код персонажа, персонаж теряет абилку “член группы” для соответствующей локусу группы. Запускается процедура пересчета дискурс-абилок. Дает карму владельцу абилки.
    target: 'scan',
    targetsSignature: kLocusAndPhysicalBody,
    cooldownMinutes: 30,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: discourseGroupExcludeAbility.name,
  },
  {
    id: 'dm-inc-counter',
    humanReadableName: 'Пропаганда',
    description: 'Добавить один заряд к локусу',
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
    karmaCost: 0,
    minimalEssence: 0,
    eventType: chargeLocusAbility.name,
  },
  {
    id: 'dm-add-guru',
    humanReadableName: 'Гуру',
    description: 'Принять персонажа в дискурс-группу, не расходуя заряд локуса',
    // Сканируется код локуса, код персонажа, персонаж приобретает абилку “член группы” для соответствующей локусу группы. Запускается процедура пересчета дискурс-абилок. Если на локусе нет зарядов, абилка не работает.  Дает карму владельцу абилки.
    target: 'scan',
    targetsSignature: kLocusAndPhysicalBody,
    cooldownMinutes: 60,
    prerequisites: ['dgroup-add'],
    karmaCost: 0,
    minimalEssence: 0,
    eventType: discourseGroupAddGuru.name,
  },
  {
    id: 'dm-exclude-inq-1',
    humanReadableName: 'Инквизитор-1',
    description: 'Выгнать персонажа из дискурс-группы, восстановив заряд локуса',
    // Сканируется код локуса, код персонажа, персонаж теряет абилку “член группы” для соответствующей локусу группы. Количество зарядов локуса увеличивается на 1. Запускается процедура пересчета дискурс-абилок.  Дает карму владельцу абилки.
    target: 'scan',
    targetsSignature: kLocusAndPhysicalBody,
    cooldownMinutes: 30,
    prerequisites: ['dgroup-exclude'],
    karmaCost: 0,
    minimalEssence: 0,
    eventType: discourseGroupInquisitor1.name,
  },
  {
    id: 'dm-exclude-inq-2',
    humanReadableName: 'Инквизитор-2',
    description: 'Выгнать персонажа из дискурс-группы, восстановив два заряда локуса',
    // Сканируется код локуса, код персонажа, персонаж теряет абилку “член группы” для соответствующей локусу группы. Количество зарядов локуса увеличивается на 2. Запускается процедура пересчета дискурс-абилок.  Дает карму владельцу абилки.
    target: 'scan',
    targetsSignature: kLocusAndPhysicalBody,
    cooldownMinutes: 30,
    prerequisites: ['dm-exclude-inq-1'],
    karmaCost: 0,
    minimalEssence: 0,
    eventType: discourseGroupInquisitor2.name,
  },
  {
    id: 'dm-prophet',
    humanReadableName: 'Пророк',
    description: 'Предъявите экран с описанием абилки региональному мастеру, чтобы получить новый QR локуса.',
    // Абилка-сертификат с кулдауном. Предъявителю выдается QR локуса дискурс-группы, к которой он принадлежит.
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 360,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: prophetAbility.name,
  },
  {
    id: 'really-need-it',
    humanReadableName: 'Очень надо.',
    description: 'Цель дарит менталисту 1 игровой предмет по выбору менталиста. (Прописать, что нельзя подарить дрон, например)',
    // Цель дарит менталисту 1 игровой предмет по выбору менталиста.
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: 60,
    karmaCost: 8,
    minimalEssence: 0,
    eventType: useMentalAbility.name,
  },
  {
    id: 'billioner-walk',
    humanReadableName: 'Прогулка миллионера',
    description: 'Цель переводит на счет менталиста некоторую часть денег со своего счета.',
    // Убеждает жертву перевести со своего на счет менталиста 50%
    target: 'show',
    targetsSignature: kNoTarget,
    cooldownMinutes: 60,
    karmaCost: 4,
    minimalEssence: 0,
    eventType: useMentalAbility.name,
  },
  {
    id: 'increase-the-mental-protection',
    humanReadableName: '',
    description: 'на 24 часа увеличивает сопротивляемость целевого персонажа ментальному воздействию. ',
    // Добавляет +8 к ментальной защите целевого персонажа  на 24 часа
    target: 'scan',
    targetsSignature: kNonDeadBodyTargeted,
    cooldownMinutes: 180,
    karmaCost: 16,
    minimalEssence: 0,
    eventType: increaseTheMentalProtectionAbility.name,
  },
  {
    id: 'reduce-the-mental-protection',
    humanReadableName: '',
    description: 'на 12 часов  уменьшает сопротивляемость целевого персонажа ментальному воздействию. ',
    // Добавляет -8 к ментальной защите целевого персонажа на 12 часов
    target: 'scan',
    targetsSignature: kNonDeadBodyTargeted,
    cooldownMinutes: 180,
    karmaCost: 16,
    minimalEssence: 0,
    eventType: reduceTheMentalProtectionAbility.name,
  },
  {
    id: 'i-dont-trust-anybody',
    humanReadableName: 'Я никому не верю',
    description: 'Временно увеличивает сопротивляемость менталиста ментальному воздействию.',
    // Менталист увеличивает свою ментальную защиту на +8 на 30 минут.
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 60,
    karmaCost: 2,
    minimalEssence: 0,
    eventType: iDontTrustAnybody.name,
  },
  {
    id: 'you-dont-trust-anybody',
    humanReadableName: 'Ты никому не веришь',
    description: 'Временно увеличивает сопротивляемость персонажа ментальному воздействию.',
    // Менталист увеличивает ментальную защиту другого персонажа на +8 на 30 минут
    target: 'scan',
    targetsSignature: kNonDeadBodyTargeted,
    cooldownMinutes: 60,
    karmaCost: 2,
    minimalEssence: 0,
    eventType: youDontTrustAnybody.name,
  },
  {
    id: 'how-much-it-costs',
    humanReadableName: 'Чо почем',
    description: 'посмотреть на qr и сказать сколько это стоит, базовую цену товара',
    // qr товара содержит информацию о базовой стоимости товара при его покупке
    // При применении абилки на экране отображается записанная на QR baseprice товара.
    // Если товар не был продан через магазин - возвращает 0.
    target: 'scan',
    targetsSignature: [kMerchandiseTargeted],
    cooldownMinutes: 0,
    karmaCost: 10,
    minimalEssence: 0,
    eventType: howMuchItCosts.name,
  },
  {
    id: 'who-needs-it',
    humanReadableName: 'Чей туфля?',
    description: 'Ты можешь узнать что-то интересное про этот товар. ',
    // Выводит на экран гм информацию из скрытого текстового поля товара .
    // Текст по умолчанию: Ты не знаешь ничего интересного про этот товар.
    target: 'scan',
    targetsSignature: [kMerchandiseTargeted],
    cooldownMinutes: 10,
    karmaCost: 40,
    minimalEssence: 0,
    eventType: whoNeedsIt.name,
  },
  {
    id: 'how-much-is-rent',
    humanReadableName: 'ПлачУ и ПлАчу',
    description: 'посмотреть на qr и сказать размер рентного платежа чаммера. ',
    // Показывает (возвращает) размер рентного платежа по данному товару. Данная информация записывается на QR при его покупке.
    // Если товар не был продан через магазин - возвращает 0.
    target: 'scan',
    targetsSignature: [kMerchandiseTargeted],
    cooldownMinutes: 0,
    karmaCost: 10,
    minimalEssence: 0,
    eventType: howMuchTheRent.name,
  },
  {
    id: 'let-me-pay',
    humanReadableName: 'Давай я заплачу',
    description: 'Гешефтмахер может переписать кредит за 1 предмет на себя. Работает только если есть QR-код товара.',
    // ГМ переписывает кредит за предмет с другого перонажа на себя. При этом сумма последующих рентных платежей пересчитывается. Новые рентные платежи рассчитываются исходя из скоринга гма на момент активации абилки.
    // Механика:
    // Активировать абилку, отсканировать QR-код товара.
    // Если на данном товаре нет рентного платежа - отображается "на данном товаре нет рентного платежа"
    target: 'scan',
    targetsSignature: [kMerchandiseTargeted],
    cooldownMinutes: 30,
    karmaCost: 20,
    minimalEssence: 0,
    eventType: letMePay.name,
  },
  {
    id: 'let-him-pay',
    humanReadableName: 'Давай он заплатит',
    description: 'переписать долг за 1 предмет по выбору с персонажа А на персонажа Б.',
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
    karmaCost: 40,
    minimalEssence: 0,
    eventType: letHimPay.name,
  },
  {
    id: 're-rent',
    humanReadableName: 'Переоформить ренту',
    description: 'ГМ может целевому персонажу переоформить контракт с новым коэфициентом скоринга. ',
    // ГМ переписывает кредит за предмет: пересчитывается сумма последующих рентных платежей . Новые рентные платежи рассчитываются исходя из скоринга персонажа, на которого записан кредит на момент активации абилки.
    // Механика:
    // Активировать абилку, отсканировать QR-код товара.
    // Если на данном товаре нет рентного платежа - отображается "на данном товаре нет рентного платежа"
    target: 'scan',
    targetsSignature: [kMerchandiseTargeted],
    cooldownMinutes: 30,
    karmaCost: 40,
    minimalEssence: 0,
    eventType: reRent.name,
  },
  {
    id: 'investigate-scoring',
    humanReadableName: 'Посмотрим скоринг',
    description: 'другой персонаж сможет видеть свои коэффициенты скоринга в течение 5 минут.',
    // Показывает актуальные коэффициенты, которые влияют на скоринг. У целевого персонажа в течение следующих 5 минут отображаются его коэффициенты скоринга.
    target: 'scan',
    targetsSignature: kHealthyBodyTargeted,
    cooldownMinutes: 30,
    karmaCost: 20,
    minimalEssence: 0,
    eventType: investigateScoring.name,
  },
  {
    id: 'chain-interrogation',
    humanReadableName: 'Конвейерный допрос',
    description: 'На допросе цель развернуто отвечает на заданный вопрос и теряет единицу эссенса.',
    // На допросе цель развернуто отвечает на заданный вопрос и теряет одну единицу эссенса (начисляется на Папу Драконов). Абилка-сертификат с кулдауном
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 60,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: doNothingAbility.name,
  },
  {
    id: 'orthodox-exorcism',
    humanReadableName: 'Отчитка',
    description: 'Благословением Божиим ваша способность Exorcizamus срабатывает с кратно увеличенной вероятностью.',
    // TODO(https://trello.com/c/XHT0b9Oj/155-реализовать-заклинания-работающие-с-духами)
    // При использовании абилки Exorcizamus ее коэффициент К=5 (значение может быть изменено для нужд балансировки).
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 60,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: spiritsRelatedSpell.name,
  },
  {
    id: 'pray-s',
    humanReadableName: 'Pray my lame',
    description: 'Помогает нужному духу обрести силы для воплощения',
    // TODO(https://trello.com/c/J2QfWUnU/286-реализовать-абилки-pray-my-lame-name-fame): Add proper implementation
    // При сканировании qr-кода астрального тела духа сокращает у этого духа кулдаун способности Fleshpoint на 5 минут
    target: 'scan',
    targetsSignature: kAstralBodyTargeted,
    cooldownMinutes: 10,
    karmaCost: 4,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },
  {
    id: 'pray-m',
    humanReadableName: 'Pray my name',
    description: 'Сильно помогает нужному духу обрести силы для воплощения',
    // TODO(https://trello.com/c/J2QfWUnU/286-реализовать-абилки-pray-my-lame-name-fame): Add proper implementation
    // При сканировании qr-кода астрального тела духа сокращает у этого духа кулдаун способности Fleshpoint на 10 минут
    target: 'scan',
    targetsSignature: kAstralBodyTargeted,
    cooldownMinutes: 10,
    prerequisites: ['pray-s'],
    karmaCost: 8,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },
  {
    id: 'pray-xl',
    humanReadableName: 'Pray my fame',
    description: 'Как боженька помогает нужному духу обрести силы для воплощения',
    // TODO(https://trello.com/c/J2QfWUnU/286-реализовать-абилки-pray-my-lame-name-fame): Add proper implementation
    // При сканировании qr-кода астрального тела духа сокращает у этого духа кулдаун способности Fleshpoint на 30 минут
    target: 'scan',
    targetsSignature: kAstralBodyTargeted,
    cooldownMinutes: 10,
    prerequisites: ['pray-m'],
    karmaCost: 16,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },
  {
    id: 'astral-body-1',
    humanReadableName: 'Астральное тельце',
    description: 'Ненадолго перейти в астральное тело, слабо готовое к астральному бою',
    // TODO(https://trello.com/c/GpCUz0q2/138-магия-реализовать-способности-для-астрала-астральное-тельце-астральное-тело-корпус-а)
    // Время действия 15 минут, кулдаун 45 минут После активации маг переключается в астральное тело. У него 2 хита и абилка "Астробой"
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 45,
    karmaCost: 1,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },
  {
    id: 'astral-body-2',
    humanReadableName: 'Астральное тело',
    description: 'Перейти в астральное тело, готовое к астральному бою',
    // TODO(https://trello.com/c/GpCUz0q2/138-магия-реализовать-способности-для-астрала-астральное-тельце-астральное-тело-корпус-а)
    // Время действия 45 минут, кулдаун 55 минут После активации маг переключается в астральное тело. У него 5 хитов и абилка "Астробоевик"
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 55,
    karmaCost: 2,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },
  {
    id: 'astral-body-3',
    humanReadableName: 'Корпус А',
    description: 'На долгий срок перейти в астральное тело, отлично готовое к астральному бою.',
    // TODO(https://trello.com/c/GpCUz0q2/138-магия-реализовать-способности-для-астрала-астральное-тельце-астральное-тело-корпус-а)
    // Время действия 120 минут, кулдаун 125 минут После активации маг переключается в астральное тело. У него 12 хитов и абилка "Астробугай"
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 125,
    karmaCost: 4,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },
  {
    id: 'silentium-est-aurum',
    humanReadableName: 'Silentium est aurum',
    description: 'Временно частично изменить цели ее ауру. Требуемая эссенция: больше 4',
    // Время действия 60 минут. Кулдаун 40 минут. Аура цели на это время случайным образом меняется на 20% (и случайный фрагмент, и на случайное значение).
    target: 'scan',
    targetsSignature: [
      {
        name: 'Персонаж',
        allowedTypes: ['ASTRAL_BODY', 'HEALTHY_BODY', 'WOUNDED_BODY', 'CLINICALLY_DEAD_BODY'],
        field: 'targetCharacterId',
      },
    ],
    cooldownMinutes: 40,
    karmaCost: 4,
    minimalEssence: 0,
    eventType: changeAuraAbility.name,
  },
  {
    id: 'hammer-of-justice',
    humanReadableName: 'Hammer of Justice',
    description: 'Активируемый статус "тяжелое" для одноручного оружия.  Требуемая эссенция: больше 3',
    // - время действия 10+N минут, кулдаун 5 минут. Одноручное оружие считается тяжёлым. N=умвл*3 минут
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 5,
    karmaCost: 4,
    minimalEssence: 3,
    eventType: hammerOfJustice.name,
  },
  {
    id: 'arrowgant',
    humanReadableName: 'Arrowgant',
    description: 'Активируемая защита от дистанционного легкого оружия.  Требуемая эссенция: больше 4',
    // - время действия 5+N минут, кулдаун 15 минут. Дает защиту от дистанционных атак (только от нерфов). N=умвл*1 минут
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 15,
    karmaCost: 8,
    minimalEssence: 4,
    eventType: arrowgant.name,
  },
  {
    id: 'trollton',
    humanReadableName: 'Trollton',
    description: 'Активируемая тяжелая броня.  Требуемая эссенция: больше 2',
    // - время действия 5+N минут, кулдаун 30 минут. Дает тяжелую броню. N=умвл*2 минут
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 30,
    karmaCost: 16,
    minimalEssence: 2,
    eventType: trollton.name,
  },
  {
    id: 'i-will-survive',
    humanReadableName: 'I will survive ',
    description: 'Активируемая возможность подняться из тяжрана в течение некоторого времени. Требуемая эссенция: больше 2',
    // - время действия 5+N минут, кулдаун 20 минут. Позволяет автоматически подняться из тяжрана через 30с с полным запасом текущих хитов. N=умвл*2 минут
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 20,
    karmaCost: 4,
    minimalEssence: 2,
    eventType: iWillSurvive.name,
  },
  {
    id: 'stand-up-and-fight',
    humanReadableName: 'Stand up and fight ',
    description: 'Излечение цели. Требуемая эссенция: больше 5',
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
    karmaCost: 8,
    minimalEssence: 5,
    eventType: reviveOnTarget.name,
  },
  {
    id: 'fresh-new-day',
    humanReadableName: 'Fresh new day ',
    description: 'Перезарядка артефакта. Требуемая эссенция: больше 4',
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    // - мгновенное, кулдаун 40 минут. Позволяет восстановить активированный (то есть потраченный) артефакт с любым заклинанием - в такое же состояние, какое они имели до активации.
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 40,
    karmaCost: 4,
    minimalEssence: 4,
    eventType: dummyAbility.name,
  },
  {
    id: 'artifact-enlarge-pencil',
    humanReadableName: 'Crate of the art: Enlarge Your Pencil',
    description: 'Ты можешь создавать артефакты, содержащие заклинание Enlarge Your Pencil. Требуемая эссенция: больше 4',
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    // - мгновенное, кулдаун 120 минут. Позволяет создать артефакт, содержащий подготовленное заклинание Enlarge Your Pencil - из расчета как будто у адепта Магия=2. Вместо активации заклинание привязывается к материальному носителю (что-то с qr-кодом), и активация произойдет только после сканирования qr-кода и подтверждения активации в интерфейсе.
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 120,
    karmaCost: 4,
    minimalEssence: 4,
    eventType: dummyAbility.name,
  },
  {
    id: 'artifact-stone-skin',
    humanReadableName: 'Crate of the art: Stone skin',
    description: 'Ты можешь создавать артефакты, содержащие заклинание Stone skin. Требуемая эссенция: больше 4',
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    // - мгновенное, кулдаун 120 минут. Позволяет создать артефакт, содержащий подготовленное заклинание Stone skin - из расчета как будто у адепта Магия=2. Вместо активации заклинание привязывается к материальному носителю (что-то с qr-кодом), и активация произойдет только после сканирования qr-кода и подтверждения активации в интерфейсе.
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 120,
    karmaCost: 4,
    minimalEssence: 4,
    eventType: dummyAbility.name,
  },
  {
    id: 'artifact-tempus-fugit',
    humanReadableName: 'Crate of the art: Tempus Fugit',
    description: 'Ты можешь создавать артефакты, содержащие заклинание Tempus Fugit. Требуемая эссенция: больше 4',
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    // - мгновенное, кулдаун 120 минут. Позволяет создать артефакт, содержащий подготовленное заклинание Tempus Fugit - из расчета как будто у адепта Магия=2. Вместо активации заклинание привязывается к материальному носителю (что-то с qr-кодом), и активация произойдет только после сканирования qr-кода и подтверждения активации в интерфейсе.
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 120,
    karmaCost: 4,
    minimalEssence: 4,
    eventType: dummyAbility.name,
  },
  {
    id: 'artifact-beacon',
    humanReadableName: 'Crate of the art: Beacon',
    description: 'Ты можешь создавать артефакты, содержащие заклинание Beacon. Требуемая эссенция: больше 4',
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    // - мгновенное, кулдаун 120 минут. Позволяет создать артефакт, содержащий подготовленное заклинание Beacon - из расчета как будто у адепта Магия=2. Вместо активации заклинание привязывается к материальному носителю (что-то с qr-кодом), и активация произойдет только после сканирования qr-кода и подтверждения активации в интерфейсе.
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 120,
    karmaCost: 4,
    minimalEssence: 4,
    eventType: dummyAbility.name,
  },
  {
    id: 'artifact-run-spirit-run',
    humanReadableName: 'Crate of the art: Run, spirit, run',
    description: 'Ты можешь создавать артефакты, содержащие заклинание Run, spirit, run. Требуемая эссенция: больше 4',
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    // - мгновенное, кулдаун 120 минут. Позволяет создать артефакт, содержащий подготовленное заклинание Run, spirit, run - из расчета как будто у адепта Магия=2. Вместо активации заклинание привязывается к материальному носителю (что-то с qr-кодом), и активация произойдет только после сканирования qr-кода и подтверждения активации в интерфейсе.
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 120,
    karmaCost: 4,
    minimalEssence: 4,
    eventType: dummyAbility.name,
  },
  {
    id: 'artifact-input-stream',
    humanReadableName: 'Crate of the art: InputStream',
    description: 'Ты можешь создавать артефакты, содержащие заклинание InputStream. Требуемая эссенция: больше 4',
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    // - мгновенное, кулдаун 120 минут. Позволяет создать артефакт, содержащий подготовленное заклинание InputStream - из расчета как будто у адепта Магия=2. Вместо активации заклинание привязывается к материальному носителю (что-то с qr-кодом), и активация произойдет только после сканирования qr-кода и подтверждения активации в интерфейсе.
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 120,
    karmaCost: 4,
    minimalEssence: 4,
    eventType: dummyAbility.name,
  },
  {
    id: 'artifact-output-stream',
    humanReadableName: 'Crate of the art: OutputStream',
    description: 'Ты можешь создавать артефакты, содержащие заклинание OutputStream. Требуемая эссенция: больше 4',
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    // - мгновенное, кулдаун 120 минут. Позволяет создать артефакт, содержащий подготовленное заклинание OutputStream - из расчета как будто у адепта Магия=2. Вместо активации заклинание привязывается к материальному носителю (что-то с qr-кодом), и активация произойдет только после сканирования qr-кода и подтверждения активации в интерфейсе.
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 120,
    karmaCost: 4,
    minimalEssence: 4,
    eventType: dummyAbility.name,
  },
  {
    id: 'artifact-mosquito-tree',
    humanReadableName: 'Crate of the art: Mosquito Tree',
    description: 'Ты можешь создавать артефакты, содержащие заклинание Mosquito Tree. Требуемая эссенция: больше 4',
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    // - мгновенное, кулдаун 120 минут. Позволяет создать артефакт, содержащий подготовленное заклинание Mosquito Tree - из расчета как будто у адепта Магия=2. Вместо активации заклинание привязывается к материальному носителю (что-то с qr-кодом), и активация произойдет только после сканирования qr-кода и подтверждения активации в интерфейсе.
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 120,
    karmaCost: 4,
    minimalEssence: 4,
    eventType: dummyAbility.name,
  },
  {
    id: 'artifact-feed-the-cat',
    humanReadableName: 'Crate of the art: Feed the cat',
    description: 'Ты можешь создавать артефакты, содержащие заклинание Feed the cat. Требуемая эссенция: больше 4',
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    // - мгновенное, кулдаун 120 минут. Позволяет создать артефакт, содержащий подготовленное заклинание Feed the cat - из расчета как будто у адепта Магия=2. Вместо активации заклинание привязывается к материальному носителю (что-то с qr-кодом), и активация произойдет только после сканирования qr-кода и подтверждения активации в интерфейсе.
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 120,
    karmaCost: 4,
    minimalEssence: 4,
    eventType: dummyAbility.name,
  },
  {
    id: 'artifact-tame-the-dog',
    humanReadableName: 'Crate of the art: Tame the dog',
    description: 'Ты можешь создавать артефакты, содержащие заклинание Tame the dog. Требуемая эссенция: больше 4',
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    // - мгновенное, кулдаун 120 минут. Позволяет создать артефакт, содержащий подготовленное заклинание Tame the dog - из расчета как будто у адепта Магия=2. Вместо активации заклинание привязывается к материальному носителю (что-то с qr-кодом), и активация произойдет только после сканирования qr-кода и подтверждения активации в интерфейсе.
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 120,
    karmaCost: 4,
    minimalEssence: 4,
    eventType: dummyAbility.name,
  },
  {
    id: 'artifact-exorcizamus',
    humanReadableName: 'Crate of the art: Exorcizamus',
    description: 'Ты можешь создавать артефакты, содержащие заклинание Exorcizamus. Требуемая эссенция: больше 4',
    // TODO(https://trello.com/c/TwTAHAut/142-магия-реализовать-способности-адептов-связанные-с-артефактами-fresh-new-day-и-набор-crate-of-the-art)
    // - мгновенное, кулдаун 120 минут. Позволяет создать артефакт, содержащий подготовленное заклинание Exorcizamus - из расчета как будто у адепта Магия=2. Вместо активации заклинание привязывается к материальному носителю (что-то с qr-кодом), и активация произойдет только после сканирования qr-кода и подтверждения активации в интерфейсе.
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 120,
    karmaCost: 4,
    minimalEssence: 4,
    eventType: dummyAbility.name,
  },
  {
    id: 'allo-homorus',
    humanReadableName: 'Allo, homorus!',
    description: 'Активация дает возможность открыть один замок. Требуемая эссенция: больше 2',
    // Активация дает возможность открыть замок (см.правила по взломам в "Прочих моделях"). Кулдаун - 10 минут
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 10,
    karmaCost: 4,
    minimalEssence: 2,
    eventType: alloHomorusAbility.name,
  },
  {
    id: 'medcart-healing',
    humanReadableName: 'Полевое лечение тяжрана',
    description: '',
    // TODO(aeremin): Add proper implementation
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 9000,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },
  {
    id: 'autodoc-healing',
    humanReadableName: 'Лечение тяжрана',
    description: '',
    // TODO(aeremin): Add proper implementation
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 9000,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },
  {
    id: 'reanimate',
    humanReadableName: 'Встань и иди',
    description: 'Поднять персонажа из состояния клинической смерти',
    // Переводит чаммера из состояния КС в состояние Здоров
    // надо отсканировать:
    // - QR воскрешательной капсулы
    // - QR ИИ
    // - QR целевого чаммера
    // Делается запись в лог использования абилок (кто использовал, какая капсула, какой ИИ, какой символ чаммер)
    // В зависимости от параметров Капсулы делает вот что:
    // drain-essense = Снимает с целевого чаммера Эссенс
    // get-essence = записывает в таблицу Имя ИИ и количество get-essence
    // air-essense  = записывает в таблици количество Air Essense
    // reanimate-cooldown = кулдаун в минутах у персонажа, применившего абилку
    // price-reanimate  = Это коэффициент цены, его надо как-то учесть в экономике (прописать в цену услуги "воскрешение на оборудовании таком-то ???)
    target: 'scan',
    targetsSignature: [
      {
        name: 'Капсула',
        allowedTypes: ['reanimate_capsule'],
        field: 'droneId',
      },
      {
        name: 'ИИ',
        allowedTypes: ['ai_symbol'],
        field: 'qrCode',
      },
      {
        name: 'Пациент',
        allowedTypes: ['CLINICALLY_DEAD_BODY'],
        field: 'targetCharacterId',
      },
    ],
    cooldownMinutes: 5,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: capsuleReanimate.name,
  },
  {
    id: 'implant-active',
    humanReadableName: 'Установка импланта',
    description: 'Для установки импланта используй эту способность. Необходим автодок!',
    // TODO(aeremin): Add proper implementation
    // Активирует процесс установки импланта.
    // надо отсканировать:
    // - QR автодока
    // - QR импланта
    // - QR целевого чаммера
    // Появляется экран автодока в котором можно выбрать, куда ставить имплант
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 20,
    karmaCost: 60,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },
  {
    id: 'tuning-active',
    humanReadableName: 'Установка мода в дрон\\кибердеку',
    description: 'Для установки мода в дрон\\кибердеку используй эту способность.Необходима мастерская!',
    // TODO(https://trello.com/c/lbmO5n8E/337-дроны-модификация-дронов-реализовать-возможность-установки-и-снятия-модов-в-дроны): Add proper implementation
    // Активирует процесс установки мода.
    // надо отсканировать:
    // - QR Мастерской
    // - QR мода
    // - QR целевого дрона \ кибердеки
    //
    // особый экран НЕ показывается, все проверки проходят в бэкнде, выдается только результат "получилось \ не получилось"
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 20,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },
  {
    id: 'repoman-active',
    humanReadableName: 'Рипомен',
    description: 'Активируй, чтобы снять имплант\\мод. Выберется самый слабый.',
    // TODO(https://trello.com/c/OBEicfEg/330-реализовать-вырезание-имплантов-рипоменами): Add proper implementation
    // Активирует процесс снятия импланта\мода.
    // надо отсканировать
    // QR чаммера \ дрона \ кибердеки
    // QR пустышки, куда запишется трофей
    // Выбираем самый слабый мод по параметру Сложности.
    // Если несколько одинаково слабых - любой.
    // Если параметра rigging.repomanBonus + Int - не хватило - снятия не происходит.
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 20,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },
  {
    id: 'repoman-black',
    humanReadableName: 'Черный рипомен',
    description: 'Активируй, чтобы снять имплант\\мод. Выберется самый сильный.',
    // TODO(https://trello.com/c/OBEicfEg/330-реализовать-вырезание-имплантов-рипоменами): Add proper implementation
    // Активирует процесс снятия импланта\мода (надо отсканировать QR пустышки, куда запишется трофей и QR чаммера \ дрона \ кибердеки ). Смотрим параметр rigging.repomanBonus + Int ,  Выбираем самый дорогой мод по параметру Сложности, но не больше чем параметр rigging.repomanBonus. Если несколько одинаково дорогих - любой. Если rigging.repomanBonus не хватило - ничего не происходит.
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 20,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },
  {
    id: 'repoman-medic',
    humanReadableName: 'Рипомен хирург',
    description: 'Ты умеешь использовать автодок и выбирать сам, какой имплант хочешь снять.',
    // TODO(https://trello.com/c/OBEicfEg/330-реализовать-вырезание-имплантов-рипоменами): Add proper implementation
    // Здесь идет включение а Автодок, показывается экран Автодока и к сумме (rigging.repomanBonus + Int ) добавляется еще auto-doc-bonus.
    // Вырезанный имплант записывается на QR чип
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 20,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },
  {
    id: 'medicraft-active',
    humanReadableName: 'Управление медицинским дроном',
    description: 'Активируй, чтобы включиться в дрона-медикарт.',
    // Активирует процесс включения в дрона.
    // надо отсканировать:
    // - QR дрона
    // - QR телохранилища
    target: 'scan',
    targetsSignature: kDroneAndBodyStorageTargeted,
    cooldownMinutes: 0,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: enterDrone.name,
  },
  {
    id: 'groundcraft-active',
    humanReadableName: 'Управление наземным дроном',
    description: 'Активируй, чтобы включиться в наземного дрона.',
    // Активирует процесс включения в дрона.
    // надо отсканировать:
    // - QR дрона
    // - QR телохранилища
    target: 'scan',
    targetsSignature: kDroneAndBodyStorageTargeted,
    cooldownMinutes: 0,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: enterDrone.name,
  },
  {
    id: 'aircraft-active',
    humanReadableName: 'Управление воздушным дроном',
    description: 'Активируй, чтобы включиться в воздушного дрона.',
    // Активирует процесс включения в дрона.
    // надо отсканировать:
    // - QR дрона
    // - QR телохранилища
    target: 'scan',
    targetsSignature: kDroneAndBodyStorageTargeted,
    cooldownMinutes: 0,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: enterDrone.name,
  },
  {
    id: 'drone-logoff',
    humanReadableName: 'Отключиться от дрона',
    description: 'Отключиться от дрона.',
    // При активации кнопки необходимо выбрать ЯЧЕЙКУ телохранилища, в котором лежит тело ригги.
    // Риггер выходит из дрона, пропадают абилки дрона, появляются абилки риггера.
    // Статус сообщение при выходе "Вы потеряли  DroneFeedbaсk хитов"
    // где DroneFeedback = DroneFeedback1 + DroneFeedback2 + DroneFeedback3
    target: 'scan',
    targetsSignature: kBodyStorageTargeted,
    cooldownMinutes: 0,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: exitDrone.name,
  },
  {
    id: 'drone-danger',
    humanReadableName: 'Аварийное отключение',
    description: 'Дрон поврежден! Необходимо срочно вернуться к телу!',
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
    karmaCost: 0,
    minimalEssence: 0,
    eventType: droneEmergencyExit.name,
  },
  {
    id: 'pill-name',
    humanReadableName: 'фармацевтика',
    description: 'Отсканируй препарат и пойми, что это за препарат',
    // При активации аблики игрок сканирует куар-код с препаратом и видит его название
    target: 'scan',
    targetsSignature: [
      {
        name: 'Препарат',
        allowedTypes: ['pill'],
        field: 'pillId',
      },
    ],
    karmaCost: 0,
    minimalEssence: 0,
    eventType: getPillNameAbility.name,
    cooldownMinutes: 0,
  },
  {
    id: 'gm-respawn-normal',
    humanReadableName: 'Воскрешение общее',
    description: 'Воскрешение Норм, эльф, орк, тролль, гном',
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
    karmaCost: 0,
    minimalEssence: 0,
    eventType: reviveAbsoluteOnTarget.name,
    cooldownMinutes: 0,
  },
  {
    id: 'medcart-light-heal-1',
    humanReadableName: 'Лечение легких ранений (1)',
    description: 'Вылечить легкое ранение (1)',
    // Активная абилка Медикарта
    target: 'scan',
    targetsSignature: kMedcartHealthyBodyTargeted,
    cooldownMinutes: 60,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: autodocHeal.name,
  },
  {
    id: 'medcart-light-heal-2',
    humanReadableName: 'Лечение легких ранений (2)',
    description: 'Вылечить легкое ранение (2)',
    // Активная абилка Медикарта
    target: 'scan',
    targetsSignature: kMedcartHealthyBodyTargeted,
    cooldownMinutes: 60,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: autodocHeal.name,
  },
  {
    id: 'medcart-light-heal-3',
    humanReadableName: 'Лечение легких ранений (3)',
    description: 'Вылечить легкое ранение (3)',
    // Активная абилка Медикарта
    target: 'scan',
    targetsSignature: kMedcartHealthyBodyTargeted,
    cooldownMinutes: 60,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: autodocHeal.name,
  },
  {
    id: 'medcart-heavy-heal-1',
    humanReadableName: 'Лечение тяжелых ранений (1)',
    description: 'Вылечить тяжелое ранение (1)',
    // Активная абилка Медикарта
    target: 'scan',
    targetsSignature: kMedcartWoundedBodyTargeted,
    cooldownMinutes: 60,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: autodocRevive.name,
  },
  {
    id: 'medcart-heavy-heal-2',
    humanReadableName: 'Лечение тяжелых ранений (2)',
    description: 'Вылечить тяжелое ранение (2)',
    // Активная абилка Медикарта
    target: 'scan',
    targetsSignature: kMedcartWoundedBodyTargeted,
    cooldownMinutes: 60,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: autodocRevive.name,
  },
  {
    id: 'medcart-heavy-heal-3',
    humanReadableName: 'Лечение тяжелых ранений (3)',
    description: 'Вылечить тяжелое ранение (3)',
    // Активная абилка Медикарта
    target: 'scan',
    targetsSignature: kMedcartWoundedBodyTargeted,
    cooldownMinutes: 60,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: autodocRevive.name,
  },
  {
    id: 'medcart-reanimate',
    humanReadableName: 'Лечение состояния КС',
    description: 'Вылечить состояние КС',
    // Активная абилка Медикарта
    target: 'scan',
    targetsSignature: kMedcartDeadBodyTargeted,
    cooldownMinutes: 60,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: reviveOnTarget.name,
  },
  // Nanohive abilities
  {
    id: 'kokkoro-armor',
    humanReadableName: 'Каменная кожа ',
    description:
      'С тебя снимаются хиты, как если бы ты находился в легкой броне. Активация абилки хитов не добавляет. Продолжительность - 15  минут.',
    // появляется текст "С тебя снимаются хиты, как если бы ты находился в легкой броне"
    // itGapEssense +5
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 15,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: nanohiveArmorAbility.name,
  },
  {
    id: 'kokkoro-shooter',
    humanReadableName: 'Стрелок',
    description: 'Ты можешь использовать автоматическое оружие 15 минут',
    // Персонаж может использовать автоматическое оружие 15 минут
    // itGapEssense +5
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 15,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: nanohiveShooterAbility.name,
  },
  {
    id: 'kokkoro-health',
    humanReadableName: 'Здоровяк ',
    description: 'Ты получаешь +2 хита на 15 минут',
    // мясное тело +2 хита на 15 минут
    // itGapEssense +5
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 15,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: nanohiveHealhAbility.name,
  },
  {
    id: 'kokkoro-backup',
    humanReadableName: 'Бэкап ',
    description: 'Ты можешь забыть эпизод, если расскажешь о нем Искусственному интеллекту',
    // появляется текст "ты забыл эпизод"
    // itGapEssense +5"
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 15,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: nanohiveBackupAbility.name,
  },
  {
    id: 'koshcghei-armor',
    humanReadableName: 'Каменная кожа ',
    description:
      'С тебя снимаются хиты, как если бы ты находился в легкой броне. Активация абилки хитов не добавляет. Продолжительность - 15  минут.',
    // появляется текст "С тебя снимаются хиты, как если бы ты находился в легкой броне"
    // itGapEssense +5
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 15,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: nanohiveArmorAbility.name,
  },
  {
    id: 'koshcghei-shooter',
    humanReadableName: 'Стрелок',
    description: 'Ты можешь использовать автоматическое оружие 15 минут',
    // Персонаж может использовать автоматическое оружие 15 минут
    // itGapEssense +5
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 15,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: nanohiveShooterAbility.name,
  },
  {
    id: 'koshcghei-health',
    humanReadableName: 'Здоровяк ',
    description: 'Ты получаешь +2 хита на 15 минут',
    // мясное тело +2 хита на 15 минут
    // itGapEssense +5"
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 15,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: nanohiveHealhAbility.name,
  },
  {
    id: 'koshcghei-backup',
    humanReadableName: 'Бэкап ',
    description: 'Ты можешь забыть эпизод, если расскажешь о нем Искусственному интеллекту',
    // появляется текст "ты забыл эпизод"
    // itGapEssense +5"
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 15,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: nanohiveBackupAbility.name,
  },
  {
    id: 'horizon-armor',
    humanReadableName: 'Каменная кожа ',
    description:
      'С тебя снимаются хиты, как если бы ты находился в легкой броне. Активация абилки хитов не добавляет. Продолжительность - 15  минут.',
    // появляется текст "С тебя снимаются хиты, как если бы ты находился в легкой броне"
    // itGapEssense +5
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 15,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: nanohiveArmorAbility.name,
  },
  {
    id: 'horizon-shooter',
    humanReadableName: 'Стрелок',
    description: 'Ты можешь использовать автоматическое оружие 15 минут',
    // Персонаж может использовать автоматическое оружие 15 минут
    // itGapEssense +5
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 15,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: nanohiveShooterAbility.name,
  },
  {
    id: 'horizon-health',
    humanReadableName: 'Здоровяк ',
    description: 'Ты получаешь +2 хита на 15 минут',
    // мясное тело +2 хита на 15 минут
    // itGapEssense +5"
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 15,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: nanohiveHealhAbility.name,
  },
  {
    id: 'horizon-backup',
    humanReadableName: 'Бэкап ',
    description: 'Ты можешь забыть эпизод, если расскажешь о нем Искусственному интеллекту',
    // появляется текст "ты забыл эпизод"
    // itGapEssense +5"
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 15,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: nanohiveBackupAbility.name,
  },
  {
    id: 'badass-armor',
    humanReadableName: 'Каменная кожа ',
    description:
      'С тебя снимаются хиты, как если бы ты находился в легкой броне. Активация абилки хитов не добавляет. Продолжительность - 15  минут.',
    // появляется текст "С тебя снимаются хиты, как если бы ты находился в легкой броне"
    // itGapEssense +5
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 15,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: nanohiveArmorAbility.name,
  },
  {
    id: 'badass-shooter',
    humanReadableName: 'Стрелок',
    description: 'Ты можешь использовать автоматическое оружие 15 минут',
    // Персонаж может использовать автоматическое оружие 15 минут
    // itGapEssense +5
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 15,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: nanohiveShooterAbility.name,
  },
  {
    id: 'badass-health',
    humanReadableName: 'Здоровяк ',
    description: 'Ты получаешь +2 хита на 15 минут',
    // мясное тело +2 хита на 15 минут
    // itGapEssense +5"
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 15,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: nanohiveHealhAbility.name,
  },
  {
    id: 'badass-backup',
    humanReadableName: 'Бэкап ',
    description: 'Ты можешь забыть эпизод, если расскажешь о нем Искусственному интеллекту',
    // появляется текст "ты забыл эпизод"
    // itGapEssense +5"
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 15,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: nanohiveBackupAbility.name,
  },
  {
    id: 'gm-respawn-hmhvv',
    humanReadableName: 'Воскрешение HMHVV',
    description: 'Воскрешение HMHVV',
    // Эта абилка нужна как мастерская.
    // Активировать абилку, отсканировать QR-код персонажа-объекта. У персонажа-объекта  восстанавливаются все хиты.
    // Эссенс становится равен 0,8
    // itEssense пересчитывается
    // itGapEssence=920
    target: 'scan',
    targetsSignature: kPhysicalBodyTargeted,
    cooldownMinutes: 0,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: gmRespawnHmhvv.name,
  },
  {
    id: 'ghoul-feast',
    humanReadableName: 'Питание гулей',
    description: 'Отсканируй QR жертвы для питания\nТвой Эссенс увеличится на 1.',
    // Гуль сканирует QR другого персонажа, находящегося в тяжелом ранении ИЛИ добровольно показавшего свой QR.
    //
    // может иметь целью только персонажей метарас эльф, орк, гном, норм, тролль, находящихся в базовом мясном теле при применении абилки.
    //
    // Эссенс гуля увеличивается на  min (100, itEssense жертвы)
    // Эссенс персонажа уменьшается на min ( 100, itEssense жертвы). Укушенный персонаж переходит в состояние КС
    // itGapEssense Жертвы = itGapEssense + [min ( 100, itEssense жертвы)]
    // itGapEssense гуля = itGapEssense -кусь гуля
    target: 'scan',
    targetsSignature: kNonDeadBodyTargeted,
    cooldownMinutes: 0,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: ghoulBite.name,
  },
  {
    id: 'vampire-feast',
    humanReadableName: 'Питание вампиров',
    description: 'Отсканируй QR жертвы для питания\nТвой Эссенс увеличится на 2.',
    // Вампир сканирует QR другого персонажа, находящегося в тяжелом ранении ИЛИ добровольно показавшего свой QR.
    // При применении абилки вампиром жертва  получает инъекцию вещества vampirium (слюна вампира).
    // может иметь целью только персонажей метарас эльф, орк, гном, норм, тролль, находящихся в базовом мясном теле при применении абилки.
    //
    // Эссенс вампира увеличивается на  min (200, itEssense жертвы)
    // Эссенс персонажа уменьшается на min ( 200, itEssense жертвы). Укушенный персонаж переходит в состояние КС
    // itGapEssense Жертвы = itGapEssense + [min ( 200, itEssense жертвы)]
    // itGapEssense вампира= itGapEssense - кусьВампира
    target: 'scan',
    targetsSignature: kNonDeadBodyTargeted,
    cooldownMinutes: 0,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: vampireBite.name,
  },
  {
    id: 'meta-werewolf',
    humanReadableName: 'Оборотень',
    description: 'Нажми, чтобы принять форму зверя - не более чем на 60 минут.',
    // TODO(aeremin): Add proper implementation
    // выдает абилку Форма зверя (?)
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 120,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },
  {
    id: 'rd-reset-essence',
    humanReadableName: 'РД Полное восстановление Эссенс',
    description: 'РД Эссенс персонажа станет =6, все импланты деактивируются(ломаются)\nдействует на расы: эльф, орк, норм, тролль, гном',
    // TODO(aeremin): Add proper implementation
    // Эта абилка нужна как мастерская.
    // Активировать абилку, отсканировать QR-код персонажа-объекта. У персонажа-объекта  пересчитывается itEssense
    // itUsedEssense = 0
    // itGapEssense = 0
    // Все импланты, установленные в тело персонажа-объекта - ломаются и выходят из строя. Тело их отторгает. (Импланты как товары - ломаются, слоты в теле персонажа - пустые)
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 360,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },
  {
    id: 'termorectal-analysis',
    humanReadableName: 'Терморектальный криптоанализ',
    description: 'На допросе цель развернуто отвечает на заданный вопрос и теряет один хит.',
    // TODO(aeremin): Add proper implementation
    // На допросе цель развернуто отвечает на заданный вопрос и теряет один хит. Абилка-сертификат с кулдауном
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 9000,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },
  {
    id: 'take-no-harm',
    humanReadableName: 'Take no harm',
    description:
      'Раскрыть "магический щит" (прозрачный зонтик, защищает от любого легкого оружия), требуется активация способности перед использованием. После активации действует 5 минут',
    // TODO(aeremin): Add proper implementation
    // При активации на 5 минут выдаёт способность Magic Shield
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 100000,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },
  {
    id: 'pencil-large',
    humanReadableName: 'Pencil, large!',
    description: 'Получить силу - одно оружие в руках будет считаться тяжёлым. После активации действует 5 минут.',
    // TODO(aeremin): Add proper implementation
    // При активации на 5 минут выдаёт способность PENCIL
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 100000,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },
  {
    id: 'skin-stone',
    humanReadableName: 'Skin, Stone!',
    description: 'Поднять щиты - имеющаяся броня будет считаться тяжёлой. После активации действует 5 минут.',
    // TODO(aeremin): Add proper implementation
    // При активации на 5 минут выдаёт способность Stone Skin
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 100000,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },
  {
    id: 'tincasm',
    humanReadableName: 'Think as a master',
    description: 'Последнее китайское предупреждение уже было.',
    // TODO(aeremin): Add proper implementation
    // После активации абилки у мага появляется на 10 минут пассивная абилка с текстом "С <такого-то времени> по <такое-то время + 10 мин> все персонажи, присутствующие в реале рядом с магом (мясо/экто/дрон - кроме самого мага и тех, кого он вслух укажет), оказываются в тяжране, если персонаж не занят _исключительно_ убеганием от мага. Начавшие убегать должны продолжать бежать, пока не досчитают до 60 (после этого эффект заклинания на них больше не действует). Во время убегания они доступны для атаки по обычным правилам".
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 60,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },
  {
    id: 'gm-increase-essence',
    humanReadableName: 'Эссенс "+1"',
    description: 'Увеличить Эссенс персонажа +1',
    // TODO(aeremin): Add proper implementation
    // Эта абилка нужна как мастерская.
    // Активировать абилку, отсканировать QR-код персонажа-объекта. У персонажа-объекта  его  базовый показатель Эссенса увеличивается на +1.
    //  itMaxEssense = itMaxEssense + 100.
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 0,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },
  {
    id: 'gm-decrease-essence',
    humanReadableName: 'Эссенс "-1"',
    description: 'Уменьшить Эссенс на -1',
    // TODO(aeremin): Add proper implementation
    // Эта абилка нужна как мастерская.
    // Активировать абилку, отсканировать QR-код персонажа-объекта. У персонажа-объекта  его  базовый показатель Эссенса уменьшается на -1
    //  itMaxEssense = itMaxEssense - 100
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 0,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },
  {
    id: 'gm-reset-essence',
    humanReadableName: 'Полное восстановление Эссенс',
    description: 'Эссенс персонажа станет =6, все импланты деактивируются(ломаются)\nдействует на расы: эльф, орк, норм, тролль, гном',
    // TODO(aeremin): Add proper implementation
    // Эта абилка нужна как мастерская.
    // Активировать абилку, отсканировать QR-код персонажа-объекта. У персонажа-объекта  меняются показатели:
    // itUsedEssense = 0
    // itGapEssense = 0
    // Все импланты, установленные в тело персонажа-объекта - ломаются и выходят из строя. Тело их отторгает. (Импланты как товары - ломаются, слоты в теле персонажа - пустые)
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 0,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },
  {
    id: 'gm-respawn-digital',
    humanReadableName: 'Воскрешение цифровой',
    description: 'Воскрешение Цифровой',
    // TODO(aeremin): Add proper implementation
    // Эта абилка нужна как мастерская.
    // Активировать абилку, отсканировать QR-код персонажа-объекта. У персонажа-объекта  восстанавливаются все хиты.
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 0,
    karmaCost: 0,
    minimalEssence: 0,
    eventType: dummyAbility.name,
  },
  {
    id: 'gm-increase-magic',
    humanReadableName: 'Увеличение магии "+1"',
    description: 'Увеличение магии +1',
    // TODO(aeremin): Add proper implementation
    // Увеличение нехуеватости Магии "+1".
    target: 'scan',
    targetsSignature: kNoTarget,
    cooldownMinutes: 0,
    karmaCost: 0,
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
